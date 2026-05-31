<?php

use App\Models\Alumni;
use App\Models\User;

test('admin can update alumni place of birth', function () {
    $admin = User::factory()->admin()->create();
    $alumni = Alumni::factory()->create();

    $payload = validAdminUpdatePayload($alumni);
    $payload['birth_province'] = 'NEGROS OCCIDENTAL';
    $payload['birth_city'] = 'CITY OF BACOLOD';

    $this->actingAs($admin)
        ->put(route('admin.alumni.update', $alumni), $payload)
        ->assertRedirect(route('admin.dashboard'));

    $alumni->refresh();

    expect($alumni->birthCity?->name)->toBe('CITY OF BACOLOD');
    expect($alumni->birthCity?->province?->name)->toBe('NEGROS OCCIDENTAL');
});

test('admin can update campus and school attended', function () {
    $admin = User::factory()->admin()->create();
    $alumni = Alumni::factory()->create();

    $payload = validAdminUpdatePayload($alumni);
    $payload['campus'] = 'TALISAY (MAIN) CAMPUS';
    $payload['school_attended'] = 'CHMSC';
    $payload['degree'] = 'BACHELOR OF ARTS IN ENGLISH';

    $this->actingAs($admin)
        ->put(route('admin.alumni.update', $alumni), $payload)
        ->assertRedirect(route('admin.dashboard'));

    $alumni->refresh()->load('school');

    expect($alumni->school?->code)->toBe('CHMSC');
    expect($alumni->campus)->toBe('TALISAY (MAIN) CAMPUS');
    expect($alumni->program_id)->toBeNull();
    expect($alumni->degree)->toBe('BACHELOR OF ARTS IN ENGLISH');
});

test('admin update rejects invalid birth province and city pair', function () {
    $admin = User::factory()->admin()->create();
    $alumni = Alumni::factory()->create();

    $payload = validAdminUpdatePayload($alumni);
    $payload['birth_province'] = 'NEGROS OCCIDENTAL';
    $payload['birth_city'] = 'MANILA';

    $this->actingAs($admin)
        ->put(route('admin.alumni.update', $alumni), $payload)
        ->assertSessionHasErrors('birth_city_id');
});

/**
 * @return array<string, mixed>
 */
function validAdminUpdatePayload(Alumni $alumni): array
{
    $alumni->loadMissing(['school', 'program.campus', 'birthCity.province']);

    return withFormProtection([
        'name' => $alumni->name,
        'sex' => $alumni->sex,
        'date_of_birth' => $alumni->date_of_birth->format('Y-m-d'),
        'birth_province' => $alumni->birthCity?->province?->name ?? $alumni->birth_province_custom ?? 'NEGROS OCCIDENTAL',
        'birth_province_custom' => $alumni->birth_province_custom ?? '',
        'birth_city' => $alumni->birthCity?->name ?? $alumni->birth_city_custom ?? 'CITY OF BAGO',
        'birth_city_custom' => $alumni->birth_city_custom ?? '',
        'mobile_no' => $alumni->mobile_no,
        'address' => $alumni->address,
        'civil_status' => $alumni->civil_status,
        'religion' => $alumni->religion ?? 'ROMAN CATHOLIC',
        'religion_other' => '',
        'email' => $alumni->email,
        'campus' => $alumni->program?->campus?->name ?? 'TALISAY (MAIN) CAMPUS',
        'school_attended' => $alumni->school?->code ?? 'CHMSU',
        'year_graduated' => $alumni->year_graduated,
        'highest_attainment' => $alumni->highest_attainment,
        'eligibility' => $alumni->eligibility ?? '',
        'degree' => $alumni->program?->name ?? $alumni->degree ?? 'BACHELOR OF SCIENCE IN INFORMATION SYSTEMS',
        'employment_status' => $alumni->employment_status,
        'employment_sector' => $alumni->employment_sector,
        'present_employment_status' => $alumni->present_employment_status,
        'occupation' => $alumni->occupation,
        'position' => $alumni->position,
        'year_employed' => $alumni->year_employed,
        'company' => $alumni->company ?? 'ACME CORP',
        'company_address' => $alumni->company_address ?? '123 MAIN ST',
        'location_of_employment' => $alumni->location_of_employment,
    ]);
}
