<?php

namespace Database\Seeders;

use App\Models\Campus;
use App\Models\City;
use App\Models\Program;
use App\Models\Province;
use App\Models\School;
use Illuminate\Database\Seeder;

class ReferenceDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedSchools();
        $this->seedCampusesAndPrograms();
        $this->seedPhilippineLocations();
    }

    private function seedSchools(): void
    {
        $schools = [
            ['code' => 'BCNTS', 'name' => 'Bacolod City National Trade School'],
            ['code' => 'PSC', 'name' => 'Philippine School of Commerce'],
            ['code' => 'CHMSC', 'name' => 'Carlos Hilado Memorial State College'],
            ['code' => 'CHMSU', 'name' => 'Carlos Hilado Memorial State University'],
        ];

        foreach ($schools as $school) {
            School::query()->updateOrCreate(
                ['code' => $school['code']],
                ['name' => $school['name']],
            );
        }
    }

    private function seedCampusesAndPrograms(): void
    {
        /** @var array<string, list<string>> $programsByCampus */
        $programsByCampus = require database_path('data/campus-programs.php');

        foreach ($programsByCampus as $campusName => $programNames) {
            $campus = Campus::query()->updateOrCreate(
                ['name' => $campusName],
            );

            foreach ($programNames as $programName) {
                Program::query()->updateOrCreate(
                    [
                        'campus_id' => $campus->id,
                        'name' => $programName,
                    ],
                );
            }
        }
    }

    private function seedPhilippineLocations(): void
    {
        $locationsPath = database_path('data/philippine-locations.json');
        $additionalPath = database_path('data/additional-cities.json');

        if (! file_exists($locationsPath)) {
            return;
        }

        /** @var array<string, list<string>> $locations */
        $locations = json_decode(file_get_contents($locationsPath), true);

        if (file_exists($additionalPath)) {
            /** @var array<string, list<string>> $additional */
            $additional = json_decode(file_get_contents($additionalPath), true);

            foreach ($additional as $provinceName => $cities) {
                $locations[$provinceName] = array_values(array_unique([
                    ...($locations[$provinceName] ?? []),
                    ...$cities,
                ]));
            }
        }

        foreach ($locations as $provinceName => $cities) {
            $province = Province::query()->updateOrCreate(
                ['name' => strtoupper(trim($provinceName))],
            );

            foreach ($cities as $cityName) {
                City::query()->updateOrCreate(
                    [
                        'province_id' => $province->id,
                        'name' => strtoupper(trim($cityName)),
                    ],
                );
            }
        }
    }
}
