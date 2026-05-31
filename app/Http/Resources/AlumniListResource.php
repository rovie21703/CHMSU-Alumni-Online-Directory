<?php

namespace App\Http\Resources;

use App\Models\Alumni;
use App\Support\CampusSchools;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Alumni */
class AlumniListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $schoolCode = $this->school?->code ?? '';

        return [
            'id' => $this->id,
            'submittedAt' => $this->submitted_at?->toIso8601String(),
            'name' => $this->name,
            'degree' => $this->program?->name ?? $this->degree ?? '',
            'yearGraduated' => $this->year_graduated,
            'campus' => $this->campus
                ?? $this->program?->campus?->name
                ?? $this->school?->campus?->name
                ?? CampusSchools::defaultCampusForSchool($schoolCode)
                ?? '',
            'schoolAttended' => $schoolCode,
            'employmentStatus' => $this->employment_status,
            'employmentSector' => $this->employment_sector ?? '',
            'locationOfEmployment' => $this->location_of_employment ?? '',
            'highestAttainment' => $this->highest_attainment,
            'presentEmploymentStatus' => $this->present_employment_status ?? '',
        ];
    }
}
