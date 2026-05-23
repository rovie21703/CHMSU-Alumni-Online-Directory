<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BuildPhilippineLocationsCommand extends Command
{
    protected $signature = 'philippines:build-locations';

    protected $description = 'Build philippine-locations.json from PSGC source files';

    public function handle(): int
    {
        $provincesPath = database_path('data/provinces.json');
        $muncitiesPath = database_path('data/muncities.json');
        $outputPath = database_path('data/philippine-locations.json');

        if (! file_exists($provincesPath) || ! file_exists($muncitiesPath)) {
            $this->error('Missing database/data/provinces.json or muncities.json');

            return self::FAILURE;
        }

        /** @var list<array{provCode: string, provName: string, cityClass: ?string}> $provinces */
        $provinces = json_decode(file_get_contents($provincesPath), true);
        /** @var list<array{provCode: string, munCityName: string}> $muncities */
        $muncities = json_decode(file_get_contents($muncitiesPath), true);

        $provinceMap = [];
        foreach ($provinces as $province) {
            if (($province['cityClass'] ?? null) === 'HUC') {
                continue;
            }

            $provinceMap[$province['provCode']] = strtoupper(trim($province['provName']));
        }

        $locations = [];
        foreach ($muncities as $municipality) {
            $code = $municipality['provCode'] ?? '';

            if (! isset($provinceMap[$code])) {
                continue;
            }

            $provinceName = $provinceMap[$code];
            $cityName = strtoupper(trim($municipality['munCityName']));

            $locations[$provinceName] ??= [];
            $locations[$provinceName][] = $cityName;
        }

        $additionalPath = database_path('data/additional-cities.json');

        if (file_exists($additionalPath)) {
            /** @var array<string, list<string>> $additionalCities */
            $additionalCities = json_decode(file_get_contents($additionalPath), true);

            foreach ($additionalCities as $provinceName => $cities) {
                $provinceName = strtoupper(trim($provinceName));

                if (! isset($locations[$provinceName])) {
                    continue;
                }

                foreach ($cities as $cityName) {
                    $locations[$provinceName][] = strtoupper(trim($cityName));
                }
            }
        }

        foreach ($locations as &$cities) {
            $cities = array_values(array_unique($cities));
            sort($cities);
        }
        unset($cities);

        ksort($locations);

        $encoded = json_encode($locations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        file_put_contents($outputPath, $encoded);
        file_put_contents(resource_path('js/data/philippine-locations.json'), $encoded);

        $this->info(sprintf(
            'Built %s with %d provinces and %d cities/municipalities.',
            $outputPath,
            count($locations),
            array_sum(array_map(fn (array $cities) => count($cities), $locations))
        ));

        return self::SUCCESS;
    }
}
