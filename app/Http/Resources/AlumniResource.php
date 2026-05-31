<?php

namespace App\Http\Resources;

use App\Models\Alumni;
use App\Support\CampusSchools;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Alumni */
class AlumniResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing(['school.campus', 'program.campus', 'birthCity.province']);

        $schoolCode = $this->school?->code ?? '';

        return [
            'id' => $this->id,
            'submittedAt' => $this->submitted_at?->toIso8601String(),
            'name' => $this->name,
            'sex' => $this->sex,
            'dateOfBirth' => $this->date_of_birth?->format('Y-m-d'),
            'age' => (string) $this->age,
            'birthProvince' => $this->birthCity?->province?->name ?? $this->birth_province_custom ?? '',
            'birthCity' => $this->birthCity?->name ?? $this->birth_city_custom ?? '',
            'placeOfBirth' => $this->birthCity
                ? "{$this->birthCity->name}, {$this->birthCity->province->name}"
                : ($this->birth_city_custom && $this->birth_province_custom
                    ? "{$this->birth_city_custom}, {$this->birth_province_custom}"
                    : ''),
            'mobileNo' => $this->mobile_no,
            'address' => $this->address,
            'civilStatus' => $this->civil_status,
            'religion' => $this->religion ?? '',
            'email' => $this->email,
            'schoolAttended' => $schoolCode,
            'yearGraduated' => $this->year_graduated,
            'campus' => $this->campus
                ?? $this->program?->campus?->name
                ?? $this->school?->campus?->name
                ?? CampusSchools::defaultCampusForSchool($schoolCode)
                ?? '',
            'degree' => $this->program?->name ?? $this->degree ?? '',
            'highestAttainment' => $this->highest_attainment,
            'eligibility' => $this->eligibility ?? '',
            'employmentStatus' => $this->employment_status,
            'employmentSector' => $this->employment_sector ?? '',
            'presentEmploymentStatus' => $this->present_employment_status ?? '',
            'occupation' => $this->occupation ?? '',
            'position' => $this->position ?? '',
            'yearEmployed' => $this->year_employed ?? '',
            'company' => $this->company ?? '',
            'companyAddress' => $this->company_address ?? '',
            'locationOfEmployment' => $this->location_of_employment ?? '',
        ];
    }
}
