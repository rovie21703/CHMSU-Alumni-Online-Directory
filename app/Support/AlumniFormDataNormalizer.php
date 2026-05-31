<?php

namespace App\Support;

class AlumniFormDataNormalizer
{
    public const OTHERS = 'OTHERS';

    /**
     * @param  array<string, mixed>  $merged
     * @return array<string, mixed>
     */
    public static function normalizeBirthPlace(array $merged): array
    {
        if (isset($merged['birth_province']) && is_string($merged['birth_province'])) {
            $merged['birth_province'] = strtoupper(trim($merged['birth_province']));
        }

        if (isset($merged['birth_city']) && is_string($merged['birth_city'])) {
            $merged['birth_city'] = strtoupper(trim($merged['birth_city']));
        }

        if (isset($merged['birth_province_custom']) && is_string($merged['birth_province_custom'])) {
            $merged['birth_province_custom'] = strtoupper(trim($merged['birth_province_custom']));
        }

        if (isset($merged['birth_city_custom']) && is_string($merged['birth_city_custom'])) {
            $merged['birth_city_custom'] = strtoupper(trim($merged['birth_city_custom']));
        }

        $province = is_string($merged['birth_province'] ?? null) ? $merged['birth_province'] : '';
        $city = is_string($merged['birth_city'] ?? null) ? $merged['birth_city'] : '';

        if ($province === self::OTHERS) {
            $merged['birth_city_id'] = null;
            $merged['birth_province_custom'] = $merged['birth_province_custom'] ?? null;
            $merged['birth_city_custom'] = $merged['birth_city_custom'] ?? null;

            return $merged;
        }

        if ($city === self::OTHERS) {
            $merged['birth_city_id'] = null;
            $merged['birth_province_custom'] = $province !== '' ? $province : null;
            $merged['birth_city_custom'] = $merged['birth_city_custom'] ?? null;

            return $merged;
        }

        $merged['birth_province_custom'] = null;
        $merged['birth_city_custom'] = null;
        $merged['birth_city_id'] = AlumniReferenceResolver::birthCityId($province, $city);

        return $merged;
    }

    /**
     * @param  array<string, mixed>  $merged
     * @return array<string, mixed>
     */
    public static function normalizeReligion(array $merged): array
    {
        if (isset($merged['religion']) && is_string($merged['religion'])) {
            $merged['religion'] = strtoupper(trim($merged['religion']));
        }

        if (isset($merged['religion_other']) && is_string($merged['religion_other'])) {
            $merged['religion_other'] = strtoupper(trim($merged['religion_other']));
        }

        if (($merged['religion'] ?? '') === self::OTHERS) {
            $other = is_string($merged['religion_other'] ?? null) ? trim($merged['religion_other']) : '';

            if ($other === '') {
                $merged['religion'] = self::OTHERS;
            } else {
                $merged['religion'] = strtoupper($other);
            }
        }

        return $merged;
    }

    public static function usesCustomBirthPlace(?string $province, ?string $city): bool
    {
        return $province === self::OTHERS || $city === self::OTHERS;
    }
}
