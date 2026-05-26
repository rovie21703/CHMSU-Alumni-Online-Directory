<?php

namespace App\Http\Resources;

use App\Models\Alumni;
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
        $this->loadMissing(['school', 'program.campus', 'birthCity.province']);

        return [
            'id' => $this->id,
            'submittedAt' => $this->submitted_at?->toIso8601String(),
            'name' => $this->name,
            'sex' => $this->sex,
            'dateOfBirth' => $this->date_of_birth?->format('Y-m-d'),
            'age' => (string) $this->age,
            'birthProvince' => $this->birthCity?->province?->name ?? '',
            'birthCity' => $this->birthCity?->name ?? '',
            'placeOfBirth' => $this->birthCity
                ? "{$this->birthCity->name}, {$this->birthCity->province->name}"
                : '',
            'mobileNo' => $this->mobile_no,
            'address' => $this->address,
            'civilStatus' => $this->civil_status,
            'religion' => $this->religion ?? '',
            'email' => $this->email,
            'schoolAttended' => $this->school?->code ?? '',
            'yearGraduated' => $this->year_graduated,
            'campus' => $this->program?->campus?->name ?? '',
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
