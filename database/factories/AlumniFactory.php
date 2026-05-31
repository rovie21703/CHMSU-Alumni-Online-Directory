<?php

namespace Database\Factories;

use App\Models\Alumni;
use App\Models\City;
use App\Models\Program;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Alumni>
 */
class AlumniFactory extends Factory
{
    protected $model = Alumni::class;

    public function configure(): static
    {
        return $this->afterMaking(function (Alumni $alumni): void {
            if ($alumni->program_id === null) {
                return;
            }

            $campusName = Program::query()
                ->with('campus')
                ->find($alumni->program_id)
                ?->campus
                ?->name;

            if ($campusName !== null) {
                $alumni->campus = $campusName;
            }
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $employmentStatus = fake()->randomElement(['YES', 'NO', 'RETIRED', 'BUSINESS OWNER']);
        $isEmployed = $employmentStatus === 'YES';

        $program = Program::query()->with('campus')->inRandomOrder()->first();
        $campusName = $program?->campus?->name ?? 'TALISAY (MAIN) CAMPUS';

        return [
            'submitted_at' => fake()->dateTimeBetween('-2 years'),
            'consent_given' => true,
            'name' => strtoupper(fake()->name()),
            'sex' => fake()->randomElement(['MALE', 'FEMALE']),
            'date_of_birth' => fake()->dateTimeBetween('-50 years', '-22 years'),
            'birth_city_id' => City::query()
                ->whereHas('province', fn ($query) => $query->where('name', 'NEGROS OCCIDENTAL'))
                ->where('name', 'CITY OF BAGO')
                ->value('id'),
            'mobile_no' => '639'.fake()->numerify('#########'),
            'address' => strtoupper(fake()->address()),
            'civil_status' => fake()->randomElement(['SINGLE', 'MARRIED', 'WIDOWED']),
            'religion' => fake()->randomElement(['ROMAN CATHOLIC', 'IGLESIA NI CRISTO', 'BAPTIST']),
            'email' => fake()->unique()->safeEmail(),
            'school_id' => School::query()->where('code', 'CHMSU')->value('id'),
            'campus' => $campusName,
            'program_id' => $program?->id,
            'year_graduated' => (string) fake()->numberBetween(1990, (int) date('Y')),
            'highest_attainment' => fake()->randomElement(['N/A', 'MASTER', 'DOCTORATE']),
            'eligibility' => fake()->randomElement(['N/A', 'PRC BOARD PASSER', 'LET BOARD PASSER']),
            'employment_status' => $employmentStatus,
            'employment_sector' => $isEmployed ? fake()->randomElement(['GOVERNMENT', 'PRIVATE']) : null,
            'present_employment_status' => $isEmployed ? fake()->randomElement(['REGULAR', 'PROBATIONARY', 'CASUAL']) : null,
            'occupation' => $isEmployed ? strtoupper(fake()->jobTitle()) : null,
            'position' => $isEmployed ? strtoupper(fake()->jobTitle()) : null,
            'year_employed' => $isEmployed ? (string) fake()->numberBetween(2010, (int) date('Y')) : null,
            'company' => $isEmployed ? strtoupper(fake()->company()) : null,
            'company_address' => $isEmployed ? strtoupper(fake()->address()) : null,
            'location_of_employment' => $isEmployed
                ? fake()->randomElement([
                    'EMPLOYED LOCALLY, INCLUDING THOSE WITH FOREIGN EMPLOYERS IN THE PHILIPPINES',
                    'EMPLOYED ABROAD',
                ])
                : null,
        ];
    }
}
