<?php

namespace App\Services;

use App\Models\Alumni;
use Illuminate\Support\Collection;

class AlumniAnalyticsService
{
    /**
     * @param  Collection<int, Alumni>  $records
     * @return array<string, mixed>
     */
    public function compute(Collection $records): array
    {
        $total = $records->count();
        $employed = $records->where('employment_status', 'YES')->count();
        $abroad = $records->filter(
            fn (Alumni $r) => str_contains(strtoupper($r->location_of_employment ?? ''), 'ABROAD')
        )->count();
        $businessOwners = $records->where('employment_status', 'BUSINESS OWNER')->count();
        $unemployed = $records->where('employment_status', 'NO')->count();
        $retired = $records->where('employment_status', 'RETIRED')->count();

        $sectorMap = [];
        foreach ($records as $record) {
            if (! $record->employment_sector) {
                continue;
            }

            $key = str_contains(strtoupper($record->employment_sector), 'ENTREPRENEURIAL')
                ? 'ENTREPRENEURIAL'
                : $record->employment_sector;
            $sectorMap[$key] = ($sectorMap[$key] ?? 0) + 1;
        }

        $bySector = [];
        foreach ($sectorMap as $name => $value) {
            $bySector[] = ['name' => $name, 'value' => $value, '_uid' => "sector-{$name}"];
        }

        $yearMap = [];
        foreach ($records as $record) {
            if ($record->year_graduated) {
                $yearMap[$record->year_graduated] = ($yearMap[$record->year_graduated] ?? 0) + 1;
            }
        }

        ksort($yearMap, SORT_NUMERIC);
        $byYear = [];
        foreach ($yearMap as $year => $count) {
            $byYear[] = ['year' => $year, 'count' => $count, '_uid' => "year-{$year}"];
        }

        $degreeMap = [];
        foreach ($records as $record) {
            $degreeName = $record->relationLoaded('program') ? $record->program?->name : null;

            if ($degreeName) {
                $degreeMap[$degreeName] = ($degreeMap[$degreeName] ?? 0) + 1;
            }
        }

        arsort($degreeMap);
        $byDegree = [];
        $seenNames = [];
        foreach (array_slice($degreeMap, 0, 6, true) as $fullName => $count) {
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
                'count' => $count,
                'fullName' => $fullName,
                '_uid' => 'deg-'.count($byDegree),
            ];
        }

        $attMap = [];
        foreach ($records as $record) {
            if ($record->highest_attainment) {
                $attMap[$record->highest_attainment] = ($attMap[$record->highest_attainment] ?? 0) + 1;
            }
        }

        $byAttainment = [];
        foreach ($attMap as $name => $value) {
            $byAttainment[] = ['name' => $name, 'value' => $value, '_uid' => "att-{$name}"];
        }

        $empStatusData = array_values(array_filter([
            ['name' => 'Employed', 'value' => $employed, '_uid' => 'emp-employed'],
            ['name' => 'Business Owner', 'value' => $businessOwners, '_uid' => 'emp-business'],
            ['name' => 'Retired', 'value' => $retired, '_uid' => 'emp-retired'],
            ['name' => 'Unemployed', 'value' => $unemployed, '_uid' => 'emp-unemployed'],
        ], fn (array $item) => $item['value'] > 0));

        $localCount = $records->filter(
            fn (Alumni $r) => $r->location_of_employment
                && ! str_contains(strtoupper($r->location_of_employment), 'ABROAD')
        )->count();

        $locationData = array_values(array_filter([
            ['name' => 'Local', 'value' => $localCount, '_uid' => 'loc-local'],
            ['name' => 'Abroad', 'value' => $abroad, '_uid' => 'loc-abroad'],
        ], fn (array $item) => $item['value'] > 0));

        $schoolCounts = [
            'BCNTS' => $records->filter(fn (Alumni $r) => $r->school?->code === 'BCNTS')->count(),
            'PSC' => $records->filter(fn (Alumni $r) => $r->school?->code === 'PSC')->count(),
            'CHMSC' => $records->filter(fn (Alumni $r) => $r->school?->code === 'CHMSC')->count(),
            'CHMSU' => $records->filter(fn (Alumni $r) => $r->school?->code === 'CHMSU')->count(),
        ];

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
            'employmentRate' => $total > 0 ? round(($employed / $total) * 100) : 0,
            'abroadRate' => $total > 0 ? round(($abroad / $total) * 100) : 0,
        ];
    }
}
