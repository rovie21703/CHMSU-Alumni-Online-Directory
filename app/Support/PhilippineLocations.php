<?php

namespace App\Support;

class PhilippineLocations
{
    /** @var array<string, list<string>>|null */
    private static ?array $locations = null;

    /**
     * @return array<string, list<string>>
     */
    public static function all(): array
    {
        if (self::$locations === null) {
            $path = database_path('data/philippine-locations.json');

            /** @var array<string, list<string>> $data */
            $data = json_decode(file_get_contents($path), true);
            self::$locations = $data;
        }

        return self::$locations;
    }

    /**
     * @return list<string>
     */
    public static function provinces(): array
    {
        return array_keys(self::all());
    }

    /**
     * @return list<string>
     */
    public static function citiesForProvince(string $province): array
    {
        return self::all()[$province] ?? [];
    }

    public static function isValidPair(string $province, string $city): bool
    {
        $cities = self::citiesForProvince($province);

        return in_array($city, $cities, true);
    }
}
