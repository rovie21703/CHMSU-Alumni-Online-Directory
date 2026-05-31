<?php

namespace App\Http\Requests;

use App\Rules\ValidPhilippineBirthLocation;
use App\Support\AlumniReferenceResolver;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAlumniRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $camelToSnake = [
            'dateOfBirth' => 'date_of_birth',
            'birthProvince' => 'birth_province',
            'birthCity' => 'birth_city',
            'mobileNo' => 'mobile_no',
            'civilStatus' => 'civil_status',
            'yearGraduated' => 'year_graduated',
            'highestAttainment' => 'highest_attainment',
            'schoolAttended' => 'school_attended',
            'employmentStatus' => 'employment_status',
            'employmentSector' => 'employment_sector',
            'presentEmploymentStatus' => 'present_employment_status',
            'yearEmployed' => 'year_employed',
            'companyAddress' => 'company_address',
            'locationOfEmployment' => 'location_of_employment',
            'consentGiven' => 'consent_given',
        ];

        $merged = $this->all();

        foreach ($camelToSnake as $camel => $snake) {
            if ($this->has($camel) && ! $this->has($snake)) {
                $merged[$snake] = $this->input($camel);
            }
        }

        if (isset($merged['birth_province']) && is_string($merged['birth_province'])) {
            $merged['birth_province'] = strtoupper(trim($merged['birth_province']));
        }

        if (isset($merged['birth_city']) && is_string($merged['birth_city'])) {
            $merged['birth_city'] = strtoupper(trim($merged['birth_city']));
        }

        if (isset($merged['campus']) && is_string($merged['campus'])) {
            $merged['campus'] = strtoupper(trim($merged['campus']));
        }

        if (isset($merged['degree']) && is_string($merged['degree'])) {
            $merged['degree'] = strtoupper(trim($merged['degree']));
        }

        $merged['school_id'] = AlumniReferenceResolver::schoolId(
            is_string($merged['school_attended'] ?? null) ? $merged['school_attended'] : null
        );

        // If school is NOT CHMSU, keep program_id null (so we use the text degree field)
        $schoolCode = $merged['school_attended'] ?? null;
        if ($schoolCode === 'CHMSU') {
            $merged['program_id'] = AlumniReferenceResolver::programId(
                is_string($merged['campus'] ?? null) ? $merged['campus'] : null,
                is_string($merged['degree'] ?? null) ? $merged['degree'] : null,
            );
        } else {
            $merged['program_id'] = null;
        }

        $merged['birth_city_id'] = AlumniReferenceResolver::birthCityId(
            is_string($merged['birth_province'] ?? null) ? $merged['birth_province'] : null,
            is_string($merged['birth_city'] ?? null) ? $merged['birth_city'] : null,
        );

        $this->merge($merged);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $isEmployed = $this->input('employment_status') === 'YES';
        $showEmploymentDetails = in_array($this->input('employment_status'), ['YES', 'BUSINESS OWNER'], true);

        return [
            'consent_given' => ['required', 'accepted'],
            'name' => ['required', 'string', 'max:255'],
            'sex' => ['required', Rule::in(['MALE', 'FEMALE'])],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'birth_city_id' => ['required', 'integer', 'exists:cities,id', new ValidPhilippineBirthLocation],
            'mobile_no' => ['required', 'string', 'regex:/^[0-9]+$/', 'max:12'],
            'address' => ['required', 'string'],
            'civil_status' => ['required', 'string', 'max:50'],
            'religion' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:alumni,email'],
            'school_id' => ['required', 'integer', 'exists:schools,id'],
            'program_id' => [
                Rule::requiredIf($this->input('school_attended') === 'CHMSU'),
                'nullable',
                'integer',
                'exists:programs,id',
            ],
            'degree' => ['nullable', 'string', 'max:255'],
            'year_graduated' => ['required', 'string', 'size:4'],
            'highest_attainment' => ['required', Rule::in(['MASTER', 'DOCTORATE', 'N/A'])],
            'eligibility' => ['nullable', 'string', 'max:255'],
            'employment_status' => ['required', Rule::in(['YES', 'NO', 'BUSINESS OWNER', 'RETIRED'])],
            'employment_sector' => [
                Rule::requiredIf($isEmployed),
                'nullable',
                'string',
                'max:100',
            ],
            'present_employment_status' => [
                Rule::requiredIf($isEmployed),
                'nullable',
                'string',
                'max:100',
            ],
            'occupation' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'year_employed' => ['nullable', 'string', 'size:4'],
            'company' => [
                Rule::requiredIf($this->input('employment_status') === 'BUSINESS OWNER'),
                'nullable',
                'string',
            ],
            'company_address' => [
                Rule::requiredIf($this->input('employment_status') === 'BUSINESS OWNER'),
                'nullable',
                'string',
            ],
            'location_of_employment' => ['nullable', 'string', 'max:255'],
        ];
    }
}
