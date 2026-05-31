<?php

namespace App\Http\Requests\Concerns;

use App\Support\AlumniReferenceResolver;
use Illuminate\Validation\Rule;

trait ResolvesAlumniEducation
{
    /**
     * @param  array<string, mixed>  $merged
     * @return array<string, mixed>
     */
    protected function resolveAlumniEducation(array $merged): array
    {
        if (isset($merged['school_attended']) && is_string($merged['school_attended'])) {
            $merged['school_attended'] = strtoupper(trim($merged['school_attended']));
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

        $schoolCode = $merged['school_attended'] ?? null;

        if ($schoolCode === 'CHMSU') {
            $merged['program_id'] = AlumniReferenceResolver::programId(
                is_string($merged['campus'] ?? null) ? $merged['campus'] : null,
                is_string($merged['degree'] ?? null) ? $merged['degree'] : null,
            );
            $merged['degree'] = null;
        } else {
            $merged['program_id'] = null;
        }

        return $merged;
    }

    protected function submittedSchoolIsChmsu(): bool
    {
        return $this->input('school_attended') === 'CHMSU';
    }

    /**
     * @return array<string, mixed>
     */
    protected function educationRules(): array
    {
        return [
            'campus' => ['required', 'string', 'exists:campuses,name'],
            'school_attended' => ['required', 'string', 'exists:schools,code'],
            'school_id' => ['required', 'integer', 'exists:schools,id'],
            'program_id' => [
                Rule::requiredIf($this->submittedSchoolIsChmsu()),
                'nullable',
                'integer',
                'exists:programs,id',
            ],
            'degree' => ['nullable', 'string', 'max:255'],
        ];
    }
}
