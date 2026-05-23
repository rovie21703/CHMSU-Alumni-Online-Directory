<?php

use App\Models\Alumni;
use App\Support\AlumniReferenceResolver;

test('reference resolver maps birth location and program', function () {
    expect(AlumniReferenceResolver::birthCityId('NEGROS OCCIDENTAL', 'CITY OF BAGO'))->not->toBeNull();
    expect(AlumniReferenceResolver::programId('TALISAY (MAIN) CAMPUS', 'BACHELOR OF SCIENCE IN INFORMATION SYSTEMS'))->not->toBeNull();
});

test('alumni registration form can be rendered', function () {
    $this->get(route('alumni.create'))->assertSuccessful();
});

test('guest can submit a valid alumni registration', function () {
    $payload = validAlumniPayload();

    $response = $this->post(route('alumni.store'), $payload);

    $response->assertRedirect(route('alumni.create'));
    $response->assertSessionHas('success', true);

    $this->assertDatabaseHas('alumni', [
        'email' => $payload['email'],
        'name' => $payload['name'],
        'consent_given' => true,
    ]);
});

test('alumni submission requires consent', function () {
    $payload = validAlumniPayload();
    $payload['consent_given'] = false;

    $this->post(route('alumni.store'), $payload)->assertSessionHasErrors('consent_given');
});

test('alumni submission validates required fields', function () {
    $this->post(route('alumni.store'), [])->assertSessionHasErrors([
        'name',
        'email',
        'school_id',
        'program_id',
        'birth_city_id',
    ]);
});

test('alumni submission rejects invalid birth province and city pair', function () {
    $payload = validAlumniPayload();
    $payload['birth_province'] = 'NEGROS OCCIDENTAL';
    $payload['birth_city'] = 'MANILA';

    $this->post(route('alumni.store'), $payload)->assertSessionHasErrors('birth_city_id');
});

test('alumni submission accepts city of bacolod in negros occidental', function () {
    $payload = validAlumniPayload();
    $payload['birth_province'] = 'NEGROS OCCIDENTAL';
    $payload['birth_city'] = 'CITY OF BACOLOD';

    $this->post(route('alumni.store'), $payload)->assertRedirect(route('alumni.create'));

    $alumni = Alumni::query()->where('email', $payload['email'])->first();

    expect($alumni)->not->toBeNull();
    expect($alumni->birthCity?->name)->toBe('CITY OF BACOLOD');
    expect($alumni->birthCity?->province?->name)->toBe('NEGROS OCCIDENTAL');
});

test('alumni submission rejects duplicate email addresses', function () {
    $payload = validAlumniPayload();

    $this->post(route('alumni.store'), $payload)->assertRedirect();

    $payload['email'] = $payload['email'];
    $payload['name'] = 'ANOTHER ALUMNI';

    $this->post(route('alumni.store'), $payload)->assertSessionHasErrors('email');
});

/**
 * @return array<string, mixed>
 */
function validAlumniPayload(): array
{
    return [
        'consent_given' => true,
        'name' => 'JUAN DELA CRUZ',
        'sex' => 'MALE',
        'date_of_birth' => '1995-03-15',
        'birth_province' => 'NEGROS OCCIDENTAL',
        'birth_city' => 'CITY OF BAGO',
        'mobile_no' => '639171234567',
        'address' => '123 LACSON ST., BACOLOD CITY',
        'civil_status' => 'SINGLE',
        'religion' => 'ROMAN CATHOLIC',
        'email' => 'juan.delacruz.'.uniqid().'@example.com',
        'school_attended' => 'CHMSU',
        'year_graduated' => '2017',
        'campus' => 'TALISAY (MAIN) CAMPUS',
        'degree' => 'BACHELOR OF SCIENCE IN INFORMATION SYSTEMS',
        'highest_attainment' => 'N/A',
        'eligibility' => 'N/A',
        'employment_status' => 'YES',
        'employment_sector' => 'PRIVATE',
        'present_employment_status' => 'REGULAR',
        'occupation' => 'SOFTWARE DEVELOPER',
        'position' => 'DEVELOPER',
        'year_employed' => '2018',
        'company' => 'ACME CORP, BACOLOD CITY',
        'location_of_employment' => 'EMPLOYED LOCALLY, INCLUDING THOSE WITH FOREIGN EMPLOYERS IN THE PHILIPPINES',
    ];
}
