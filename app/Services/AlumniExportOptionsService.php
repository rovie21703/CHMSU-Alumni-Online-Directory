<?php

namespace App\Services;

use App\Models\Alumni;
use App\Models\Campus;
use App\Models\Province;
use App\Models\School;
use App\Support\AlumniExportColumns;
class AlumniExportOptionsService
{
    /**
     * @return array<string, mixed>
     */
    public function build(): array
    {
        $yearBounds = Alumni::query()
            ->selectRaw('MIN(CAST(year_graduated AS UNSIGNED)) as min_year, MAX(CAST(year_graduated AS UNSIGNED)) as max_year')
            ->first();

        $submittedBounds = Alumni::query()
            ->selectRaw('MIN(DATE(submitted_at)) as min_date, MAX(DATE(submitted_at)) as max_date')
            ->first();

        return [
            'columns' => AlumniExportColumns::forFrontend(),
            'columnGroups' => AlumniExportColumns::groupLabels(),
            'defaultColumns' => AlumniExportColumns::keys(),
            'campuses' => Campus::query()
                ->with(['programs:id,campus_id,name'])
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Campus $campus): array => [
                    'id' => $campus->id,
                    'name' => $campus->name,
                    'programs' => $campus->programs->map(fn ($program): array => [
                        'id' => $program->id,
                        'name' => $program->name,
                    ])->values()->all(),
                ])
                ->values()
                ->all(),
            'schools' => School::query()
                ->orderBy('name')
                ->get(['id', 'code', 'name'])
                ->map(fn (School $school): array => [
                    'id' => $school->id,
                    'code' => $school->code,
                    'name' => $school->name,
                ])
                ->values()
                ->all(),
            'provinces' => Province::query()
                ->whereHas('cities.alumni')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Province $province): array => [
                    'id' => $province->id,
                    'name' => $province->name,
                ])
                ->values()
                ->all(),
            'filterValues' => [
                'employmentStatuses' => $this->distinctValues('employment_status'),
                'employmentSectors' => $this->distinctValues('employment_sector'),
                'presentEmploymentStatuses' => $this->distinctValues('present_employment_status'),
                'highestAttainments' => $this->distinctValues('highest_attainment'),
                'sexOptions' => ['MALE', 'FEMALE'],
                'locationOptions' => [
                    ['value' => 'LOCAL', 'label' => 'Employed Locally'],
                    ['value' => 'ABROAD', 'label' => 'Employed Abroad'],
                ],
                'yearGraduated' => [
                    'min' => (int) ($yearBounds->min_year ?? (int) date('Y') - 30),
                    'max' => (int) ($yearBounds->max_year ?? (int) date('Y')),
                ],
                'submittedAt' => [
                    'min' => $submittedBounds->min_date,
                    'max' => $submittedBounds->max_date,
                ],
            ],
        ];
    }

    /**
     * @return list<string>
     */
    private function distinctValues(string $column): array
    {
        return Alumni::query()
            ->whereNotNull($column)
            ->where($column, '!=', '')
            ->distinct()
            ->orderBy($column)
            ->pluck($column)
            ->map(fn ($value): string => (string) $value)
            ->values()
            ->all();
    }
}
