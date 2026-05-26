<?php

namespace App\Http\Requests\Admin;

use App\Models\Alumni;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAlumniRequest extends FormRequest
{
    public function authorize(): bool
    {
        $alumnus = $this->route('alumnus');

        return $alumnus instanceof Alumni && $this->user()?->can('update', $alumnus);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'sex' => ['required', Rule::in(['MALE', 'FEMALE'])],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'mobile_no' => ['required', 'string', 'regex:/^[0-9]+$/', 'max:12'],
            'address' => ['required', 'string', 'max:1000'],
            'civil_status' => ['required', 'string', 'max:50'],
            'religion' => ['nullable', 'string', 'max:100'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('alumni', 'email')->ignore($this->route('alumnus')),
            ],
            'year_graduated' => ['required', 'string', 'size:4'],
            'highest_attainment' => ['required', Rule::in(['MASTER', 'DOCTORATE', 'N/A'])],
            'eligibility' => ['nullable', 'string', 'max:255'],
            'degree' => ['nullable', 'string', 'max:255'],
            'employment_status' => ['required', Rule::in(['YES', 'NO', 'BUSINESS OWNER', 'RETIRED'])],
            'employment_sector' => ['nullable', 'string', 'max:100'],
            'present_employment_status' => ['nullable', 'string', 'max:100'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'year_employed' => ['nullable', 'string', 'size:4'],
            'company' => ['nullable', 'string', 'max:500'],
            'company_address' => ['nullable', 'string', 'max:1000'],
            'location_of_employment' => ['nullable', 'string', 'max:255'],
        ];
    }
}
