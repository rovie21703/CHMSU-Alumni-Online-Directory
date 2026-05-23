<?php

namespace App\Support;

use App\Models\City;
use App\Models\Program;
use App\Models\Province;
use App\Models\School;

class AlumniReferenceResolver
{
    public static function schoolId(?string $code): ?int
    {
        if (! is_string($code) || $code === '') {
            return null;
        }

        return School::query()->where('code', strtoupper(trim($code)))->value('id');
    }

    public static function programId(?string $campusName, ?string $degreeName): ?int
    {
        if (! is_string($campusName) || ! is_string($degreeName) || $campusName === '' || $degreeName === '') {
            return null;
        }

        return Program::query()
            ->whereHas('campus', fn ($query) => $query->where('name', strtoupper(trim($campusName))))
            ->where('name', strtoupper(trim($degreeName)))
            ->value('id');
    }

    public static function birthCityId(?string $provinceName, ?string $cityName): ?int
    {
        if (! is_string($provinceName) || ! is_string($cityName) || $provinceName === '' || $cityName === '') {
            return null;
        }

        $provinceId = Province::query()
            ->where('name', strtoupper(trim($provinceName)))
            ->value('id');

        if ($provinceId === null) {
            return null;
        }

        return City::query()
            ->where('province_id', $provinceId)
            ->where('name', strtoupper(trim($cityName)))
            ->value('id');
    }
}
