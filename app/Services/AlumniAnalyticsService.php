<?php

namespace App\Services;

use App\Models\Alumni;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class AlumniAnalyticsService
{
    /**
     * @return array<string, mixed>
     */
    public function computeForUser(User $user): array
    {
        $base = Alumni::query()->visibleTo($user);

        $total = (clone $base)->count();

        if ($total === 0) {
            return $this->emptyAnalytics();
        }

        $employed = (clone $base)->where('employment_status', 'YES')->count();
        $abroad = (clone $base)->where('location_of_employment', 'like', '%ABROAD%')->count();
        $businessOwners = (clone $base)->where('employment_status', 'BUSINESS OWNER')->count();
        $unemployed = (clone $base)->where('employment_status', 'NO')->count();
        $retired = (clone $base)->where('employment_status', 'RETIRED')->count();
        $localCount = (clone $base)
            ->whereNotNull('location_of_employment')
            ->where('location_of_employment', 'not like', '%ABROAD%')
            ->count();

        $byYear = (clone $base)
            ->select('year_graduated', DB::raw('COUNT(*) as aggregate'))
            ->whereNotNull('year_graduated')
            ->groupBy('year_graduated')
            ->orderBy('year_graduated')
            ->get()
            ->map(fn ($row) => [
                'year' => (string) $row->year_graduated,
                'count' => (int) $row->aggregate,
                '_uid' => "year-{$row->year_graduated}",
            ])
            ->values()
            ->all();

        $byAttainment = (clone $base)
            ->select('highest_attainment', DB::raw('COUNT(*) as aggregate'))
            ->whereNotNull('highest_attainment')
            ->groupBy('highest_attainment')
            ->get()
            ->map(fn ($row) => [
                'name' => (string) $row->highest_attainment,
                'value' => (int) $row->aggregate,
                '_uid' => "att-{$row->highest_attainment}",
            ])
            ->values()
            ->all();

        $sectorRows = (clone $base)
            ->select('employment_sector', DB::raw('COUNT(*) as aggregate'))
            ->whereNotNull('employment_sector')
            ->groupBy('employment_sector')
            ->get();

        $sectorMap = [];
        foreach ($sectorRows as $row) {
            $key = str_contains(strtoupper((string) $row->employment_sector), 'ENTREPRENEURIAL')
                ? 'ENTREPRENEURIAL'
                : (string) $row->employment_sector;
            $sectorMap[$key] = ($sectorMap[$key] ?? 0) + (int) $row->aggregate;
        }

        $bySector = [];
        foreach ($sectorMap as $name => $value) {
            $bySector[] = ['name' => $name, 'value' => $value, '_uid' => "sector-{$name}"];
        }

        $byDegree = $this->topDegreePrograms($base);

        $schoolCounts = $this->schoolCounts($base);

        $presentStatusBreakdown = $this->presentStatusBreakdown($base);

        $empStatusData = array_values(array_filter([
            ['name' => 'Employed', 'value' => $employed, '_uid' => 'emp-employed'],
            ['name' => 'Business Owner', 'value' => $businessOwners, '_uid' => 'emp-business'],
            ['name' => 'Retired', 'value' => $retired, '_uid' => 'emp-retired'],
            ['name' => 'Unemployed', 'value' => $unemployed, '_uid' => 'emp-unemployed'],
        ], fn (array $item) => $item['value'] > 0));

        $locationData = array_values(array_filter([
            ['name' => 'Local', 'value' => $localCount, '_uid' => 'loc-local'],
            ['name' => 'Abroad', 'value' => $abroad, '_uid' => 'loc-abroad'],
        ], fn (array $item) => $item['value'] > 0));

        return [
            'total' => $total,
            'employed' => $employed,
            'abroad' => $abroad,
            'businessOwners' => $businessOwners,
            'unemployed' => $unemployed,
            'retired' => $retired,
            'bySector' => $bySector,
            'byYear' => $byYear,
            'byDegree' => $byDegree,
            'byAttainment' => $byAttainment,
            'empStatusData' => $empStatusData,
            'locationData' => $locationData,
            'schoolCounts' => $schoolCounts,
            'sectorGovernment' => $sectorMap['GOVERNMENT'] ?? 0,
            'sectorPrivate' => $sectorMap['PRIVATE'] ?? 0,
            'sectorEntrepreneurial' => $sectorMap['ENTREPRENEURIAL'] ?? 0,
            'mastersCount' => (clone $base)->where('highest_attainment', 'MASTER')->count(),
            'doctorateCount' => (clone $base)->where('highest_attainment', 'DOCTORATE')->count(),
            'presentStatusBreakdown' => $presentStatusBreakdown,
            'employmentRate' => $total > 0 ? (int) round(($employed / $total) * 100) : 0,
            'abroadRate' => $total > 0 ? (int) round(($abroad / $total) * 100) : 0,
        ];
    }

    /**
     * @param  Builder<Alumni>  $base
     * @return list<array{name: string, count: int, fullName: string, _uid: string}>
     */
    private function topDegreePrograms(Builder $base): array
    {
        $rows = (clone $base)
            ->join('programs', 'alumni.program_id', '=', 'programs.id')
            ->select('programs.name', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('programs.id', 'programs.name')
            ->orderByDesc('aggregate')
            ->limit(6)
            ->get();

        $byDegree = [];
        $seenNames = [];

        foreach ($rows as $row) {
            $fullName = (string) $row->name;
            $shortDeg = mb_substr(
                preg_replace(
                    ['/Bachelor of Science in /i', '/Bachelor of /i'],
                    ['BS ', 'B.'],
                    $fullName
                ) ?? $fullName,
                0,
                28
            );

            if (isset($seenNames[$shortDeg])) {
                $seenNames[$shortDeg]++;
                $shortDeg = "{$shortDeg} ({$seenNames[$shortDeg]})";
            } else {
                $seenNames[$shortDeg] = 0;
            }

            $byDegree[] = [
                'name' => $shortDeg,
                'count' => (int) $row->aggregate,
                'fullName' => $fullName,
                '_uid' => 'deg-'.count($byDegree),
            ];
        }

        return $byDegree;
    }

    /**
     * @param  Builder<Alumni>  $base
     * @return array<string, int>
     */
    private function schoolCounts(Builder $base): array
    {
        $codes = ['BCNTS', 'PSC', 'CHMSC', 'CHMSU', 'NOCAT', 'NOSAT', 'NOPCC', 'NOSOF'];
        $counts = array_fill_keys($codes, 0);

        $rows = (clone $base)
            ->join('schools', 'alumni.school_id', '=', 'schools.id')
            ->select('schools.code', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('schools.code')
            ->pluck('aggregate', 'code');

        foreach ($codes as $code) {
            $counts[$code] = (int) ($rows[$code] ?? 0);
        }

        return $counts;
    }

    /**
     * @param  Builder<Alumni>  $base
     * @return list<array{label: string, count: int}>
     */
    private function presentStatusBreakdown(Builder $base): array
    {
        $labels = [
            'REGULAR' => 'Regular',
            'PROBATIONARY' => 'Probationary',
            'CASUAL' => 'Casual',
            'JOB ORDER' => 'Job Order',
            'SELF-EMPLOYED' => 'Self-employed',
        ];

        $rows = (clone $base)
            ->select('present_employment_status', DB::raw('COUNT(*) as aggregate'))
            ->whereNotNull('present_employment_status')
            ->groupBy('present_employment_status')
            ->pluck('aggregate', 'present_employment_status');

        $breakdown = [];
        foreach ($labels as $status => $label) {
            $breakdown[] = [
                'label' => $label,
                'count' => (int) ($rows[$status] ?? 0),
            ];
        }

        $breakdown[] = [
            'label' => 'Unemployed',
            'count' => (clone $base)->where('employment_status', 'NO')->count(),
        ];

        return $breakdown;
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyAnalytics(): array
    {
        return [
            'total' => 0,
            'employed' => 0,
            'abroad' => 0,
            'businessOwners' => 0,
            'unemployed' => 0,
            'retired' => 0,
            'bySector' => [],
            'byYear' => [],
            'byDegree' => [],
            'byAttainment' => [],
            'empStatusData' => [],
            'locationData' => [],
            'schoolCounts' => [
                'BCNTS' => 0,
                'PSC' => 0,
                'CHMSC' => 0,
                'CHMSU' => 0,
                'NOCAT' => 0,
                'NOSAT' => 0,
                'NOPCC' => 0,
                'NOSOF' => 0,
            ],
            'sectorGovernment' => 0,
            'sectorPrivate' => 0,
            'sectorEntrepreneurial' => 0,
            'mastersCount' => 0,
            'doctorateCount' => 0,
            'presentStatusBreakdown' => [],
            'employmentRate' => 0,
            'abroadRate' => 0,
        ];
    }
}
