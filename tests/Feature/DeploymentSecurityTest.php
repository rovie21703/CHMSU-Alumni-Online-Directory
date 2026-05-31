<?php

use App\Models\Alumni;
use App\Models\Campus;
use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

test('public deploy helper scripts are not shipped', function () {
    expect(file_exists(public_path('deploy-once.php')))->toBeFalse();
    expect(file_exists(public_path('setup-storage.php')))->toBeFalse();
});

test('public registration is disabled by default', function () {
    config(['security.allow_registration' => false]);

    $this->get('/register')->assertNotFound();
});

test('login is rate limited after repeated failures', function () {
    RateLimiter::clear('login');

    $user = User::factory()->admin()->create();

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);
    }

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertStatus(429);
});

test('staff only sees alumni from their assigned campus', function () {
    $campuses = Campus::query()->limit(2)->get();

    if ($campuses->count() < 2) {
        $this->markTestSkipped('Requires at least two campuses in reference data.');
    }

    [$campusA, $campusB] = $campuses;

    $programA = Program::query()->where('campus_id', $campusA->id)->first();
    $programB = Program::query()->where('campus_id', $campusB->id)->first();

    if ($programA === null || $programB === null) {
        $this->markTestSkipped('Requires programs on two campuses.');
    }

    Alumni::factory()->create([
        'program_id' => $programA->id,
        'campus' => $campusA->name,
    ]);
    Alumni::factory()->create([
        'program_id' => $programB->id,
        'campus' => $campusB->name,
    ]);

    $staff = User::factory()->staff()->create(['campus_id' => $campusA->id]);

    $this->actingAs($staff)
        ->get(route('admin.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('records.data', 1)
            ->where('records.data.0.campus', $campusA->name)
        );
});

test('responses include a request id header', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertSuccessful()
        ->assertHeader('X-Request-Id');
});

test('staff cannot access staff management routes', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)
        ->get(route('admin.staff.index'))
        ->assertForbidden();
});
