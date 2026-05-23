<?php

namespace App\Exports;

use App\Models\Alumni;
use App\Support\AlumniExportColumns;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AlumniExport implements FromQuery, WithHeadings, WithMapping
{
    /**
     * @param  Builder<Alumni>  $query
     * @param  list<string>  $columns
     */
    public function __construct(
        private readonly Builder $query,
        private readonly array $columns,
    ) {}

    /**
     * @return Builder<Alumni>
     */
    public function query(): Builder
    {
        return $this->query;
    }

    /**
     * @return list<string>
     */
    public function headings(): array
    {
        return array_map(
            fn (string $column): string => AlumniExportColumns::label($column),
            $this->columns,
        );
    }

    /**
     * @param  Alumni  $alumni
     * @return list<mixed>
     */
    public function map($alumni): array
    {
        return array_map(
            fn (string $column): mixed => $this->valueForColumn($alumni, $column),
            $this->columns,
        );
    }

    private function valueForColumn(Alumni $alumni, string $column): mixed
    {
        return match ($column) {
            'id' => $alumni->id,
            'submitted_at' => $alumni->submitted_at?->toDateTimeString(),
            'name' => $alumni->name,
            'sex' => $alumni->sex,
            'date_of_birth' => $alumni->date_of_birth?->format('Y-m-d'),
            'age' => $alumni->age,
            'birth_province' => $alumni->birthCity?->province?->name,
            'birth_city' => $alumni->birthCity?->name,
            'civil_status' => $alumni->civil_status,
            'religion' => $alumni->religion,
            'email' => $alumni->email,
            'mobile_no' => $alumni->mobile_no,
            'address' => $alumni->address,
            'school' => $alumni->school?->code,
            'campus' => $alumni->program?->campus?->name,
            'degree' => $alumni->program?->name,
            'year_graduated' => $alumni->year_graduated,
            'highest_attainment' => $alumni->highest_attainment,
            'eligibility' => $alumni->eligibility,
            'employment_status' => $alumni->employment_status,
            'employment_sector' => $alumni->employment_sector,
            'present_employment_status' => $alumni->present_employment_status,
            'occupation' => $alumni->occupation,
            'position' => $alumni->position,
            'year_employed' => $alumni->year_employed,
            'company' => $alumni->company,
            'location_of_employment' => $this->formatEmploymentLocation($alumni->location_of_employment),
            default => null,
        };
    }

    private function formatEmploymentLocation(?string $location): ?string
    {
        if ($location === null || $location === '') {
            return null;
        }

        if (str_contains(strtoupper($location), 'ABROAD')) {
            return 'Employed Abroad';
        }

        return 'Employed Locally';
    }
}
