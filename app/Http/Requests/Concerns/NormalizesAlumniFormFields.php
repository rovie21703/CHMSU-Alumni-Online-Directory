<?php

namespace App\Http\Requests\Concerns;

use App\Rules\ValidPhilippineBirthLocation;
use App\Support\AlumniFormDataNormalizer;
use Illuminate\Validation\Rule;

trait NormalizesAlumniFormFields
{
    /**
     * @param  array<string, mixed>  $merged
     * @return array<string, mixed>
     */
    protected function mergeAlumniFormFieldAliases(array $merged): array
    {
        $camelToSnake = [
            'birthProvince' => 'birth_province',
            'birthCity' => 'birth_city',
            'birthProvinceOther' => 'birth_province_custom',
            'birthCityOther' => 'birth_city_custom',
            'religionOther' => 'religion_other',
        ];

        foreach ($camelToSnake as $camel => $snake) {
            if ($this->has($camel) && ! $this->has($snake)) {
                $merged[$snake] = $this->input($camel);
            }
        }

        return $merged;
    }

    /**
     * @param  array<string, mixed>  $merged
     * @return array<string, mixed>
     */
    /**
     * @param  array<string, mixed>  $merged
     * @return array<string, mixed>
     */
    protected function normalizeAlumniBirthPlace(array $merged): array
    {
        return AlumniFormDataNormalizer::normalizeBirthPlace($merged);
    }

    /**
     * @param  array<string, mixed>  $merged
     * @return array<string, mixed>
     */
    protected function normalizeAlumniReligion(array $merged): array
    {
        return AlumniFormDataNormalizer::normalizeReligion($merged);
    }

    protected function usesCustomBirthPlace(): bool
    {
        return AlumniFormDataNormalizer::usesCustomBirthPlace(
            is_string($this->input('birth_province')) ? $this->input('birth_province') : null,
            is_string($this->input('birth_city')) ? $this->input('birth_city') : null,
        );
    }

    /**
     * @return array<string, mixed>
     */
    protected function birthPlaceRules(): array
    {
        $provinceIsOthers = $this->input('birth_province') === AlumniFormDataNormalizer::OTHERS;
        $cityIsOthers = $this->input('birth_city') === AlumniFormDataNormalizer::OTHERS;

        return [
            'birth_province' => ['required', 'string', 'max:255'],
            'birth_city' => ['required', 'string', 'max:255'],
            'birth_province_custom' => [
                Rule::requiredIf($provinceIsOthers),
                'nullable',
                'string',
                'max:255',
            ],
            'birth_city_custom' => [
                Rule::requiredIf($provinceIsOthers || $cityIsOthers),
                'nullable',
                'string',
                'max:255',
            ],
            'birth_city_id' => [
                Rule::requiredIf(! $this->usesCustomBirthPlace()),
                'nullable',
                'integer',
                'exists:cities,id',
                ...($this->usesCustomBirthPlace() ? [] : [new ValidPhilippineBirthLocation]),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function religionRules(): array
    {
        return [
            'religion' => ['required', 'string', 'max:100', Rule::notIn([AlumniFormDataNormalizer::OTHERS])],
            'religion_other' => ['nullable', 'string', 'max:100'],
        ];
    }
}
