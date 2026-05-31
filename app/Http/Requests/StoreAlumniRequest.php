<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\NormalizesAlumniFormFields;
use App\Http\Requests\Concerns\ResolvesAlumniEducation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAlumniRequest extends FormRequest
{
    use NormalizesAlumniFormFields;
    use ResolvesAlumniEducation;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $camelToSnake = [
            'dateOfBirth' => 'date_of_birth',
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

        $merged = $this->mergeAlumniFormFieldAliases($merged);

        if (array_key_exists('email', $merged) && (! is_string($merged['email']) || trim($merged['email']) === '')) {
            $merged['email'] = null;
        }

        $merged = $this->resolveAlumniEducation($merged);
        $merged = $this->normalizeAlumniBirthPlace($merged);
        $merged = $this->normalizeAlumniReligion($merged);

        $this->merge($merged);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $isEmployed = $this->input('employment_status') === 'YES';

        return [
            'website' => ['nullable', 'string', 'max:0'],
            'consent_given' => ['required', 'accepted'],
            'name' => ['required', 'string', 'max:255'],
            'sex' => ['required', Rule::in(['MALE', 'FEMALE'])],
            'date_of_birth' => ['required', 'date', 'before:today'],
            ...$this->birthPlaceRules(),
            'mobile_no' => ['required', 'string', 'regex:/^[0-9]+$/', 'max:12'],
            'address' => ['required', 'string', 'max:1000'],
            'civil_status' => ['required', 'string', 'max:50'],
            ...$this->religionRules(),
            'email' => ['nullable', 'email', 'max:255', 'unique:alumni,email'],
            ...$this->educationRules(),
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
                'max:500',
            ],
            'company_address' => [
                Rule::requiredIf($this->input('employment_status') === 'BUSINESS OWNER'),
                'nullable',
                'string',
                'max:1000',
            ],
            'location_of_employment' => ['nullable', 'string', 'max:255'],
        ];
    }
}
