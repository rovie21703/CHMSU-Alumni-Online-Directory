<?php

namespace App\Http\Requests\Admin;

use App\Models\Alumni;
use App\Support\AlumniExportColumns;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportAlumniRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('export', Alumni::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $user = $this->user();

        if ($user !== null && ! $user->isAdmin() && $user->campus_id !== null) {
            $this->merge([
                'campus_ids' => [$user->campus_id],
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $columnKeys = AlumniExportColumns::keys();

        return [
            'columns' => ['required', 'array', 'min:1'],
            'columns.*' => ['required', 'string', Rule::in($columnKeys)],
            'submitted_from' => ['nullable', 'date'],
            'submitted_to' => ['nullable', 'date', 'after_or_equal:submitted_from'],
            'year_graduated_from' => ['nullable', 'integer', 'min:1950', 'max:2100'],
            'year_graduated_to' => ['nullable', 'integer', 'min:1950', 'max:2100', 'gte:year_graduated_from'],
            'school_ids' => ['nullable', 'array'],
            'school_ids.*' => ['integer', 'exists:schools,id'],
            'program_ids' => ['nullable', 'array'],
            'program_ids.*' => ['integer', 'exists:programs,id'],
            'campus_ids' => ['nullable', 'array'],
            'campus_ids.*' => ['integer', 'exists:campuses,id'],
            'employment_status' => ['nullable', 'array'],
            'employment_status.*' => ['string', 'max:50'],
            'employment_sector' => ['nullable', 'array'],
            'employment_sector.*' => ['string', 'max:50'],
            'present_employment_status' => ['nullable', 'array'],
            'present_employment_status.*' => ['string', 'max:50'],
            'highest_attainment' => ['nullable', 'array'],
            'highest_attainment.*' => ['string', 'max:50'],
            'sex' => ['nullable', 'array'],
            'sex.*' => [Rule::in(['MALE', 'FEMALE'])],
            'birth_province_ids' => ['nullable', 'array'],
            'birth_province_ids.*' => ['integer', 'exists:provinces,id'],
            'location' => ['nullable', Rule::in(['LOCAL', 'ABROAD'])],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        $validated = $this->validated();

        unset($validated['columns']);

        return $validated;
    }

    /**
     * @return list<string>
     */
    public function selectedColumns(): array
    {
        /** @var list<string> */
        return $this->validated('columns');
    }
}
