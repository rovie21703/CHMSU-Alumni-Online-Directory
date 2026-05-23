<?php

namespace App\Rules;

use App\Models\City;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidPhilippineBirthLocation implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $cityId = is_numeric($value) ? (int) $value : 0;
        $provinceName = request()->input('birth_province');
        $cityName = request()->input('birth_city');

        if ($cityId <= 0) {
            $fail('The selected birth location is invalid.');

            return;
        }

        $city = City::query()->with('province')->find($cityId);

        if ($city === null) {
            $fail('The selected city is invalid.');

            return;
        }

        if (is_string($provinceName) && is_string($cityName)) {
            $provinceMatches = strtoupper(trim($provinceName)) === $city->province->name;
            $cityMatches = strtoupper(trim($cityName)) === $city->name;

            if (! $provinceMatches || ! $cityMatches) {
                $fail('The selected city does not belong to the selected province.');
            }
        }
    }
}
