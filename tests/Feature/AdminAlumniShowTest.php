<?php

use App\Models\Alumni;
use App\Models\Campus;
use App\Models\Program;
use App\Models\User;

test('authenticated user can fetch a single alumni record as json', function () {
    $admin = User::factory()->admin()->create();
    $alumni = Alumni::factory()->create();

    $this->actingAs($admin)
        ->getJson(route('admin.alumni.show', $alumni))
        ->assertSuccessful()
        ->assertJsonPath('data.id', $alumni->id)
        ->assertJsonPath('data.name', $alumni->name);
});

test('staff cannot fetch alumni outside their campus', function () {
    $campuses = Campus::query()->limit(2)->get();

    if ($campuses->count() < 2) {
        $this->markTestSkipped('Requires at least two campuses in reference data.');
    }

    [$campusA, $campusB] = $campuses;

    $programB = Program::query()->where('campus_id', $campusB->id)->first();

    if ($programB === null) {
        $this->markTestSkipped('Requires programs on two campuses.');
    }

    $staff = User::factory()->staff()->create(['campus_id' => $campusA->id]);
    $alumni = Alumni::factory()->create(['program_id' => $programB->id]);

    $this->actingAs($staff)
        ->getJson(route('admin.alumni.show', $alumni))
        ->assertForbidden();
});

test('unverified user is redirected from admin dashboard', function () {
    $user = User::factory()->unverified()->admin()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('verification.notice'));
});
