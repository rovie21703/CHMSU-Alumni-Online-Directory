<?php

use App\Enums\UserRole;
use App\Models\Campus;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;

test('guest cannot access staff management', function () {
    $this->get(route('admin.staff.index'))->assertRedirect(route('login'));
});

test('staff user cannot access staff management', function () {
    $user = User::factory()->staff()->create();

    $this->actingAs($user)
        ->get(route('admin.staff.index'))
        ->assertForbidden();
});

test('admin can view staff management page', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->staff()->count(2)->create();

    $this->actingAs($admin)
        ->get(route('admin.staff.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/staff/index')
            ->has('staff', 2)
            ->has('campuses')
        );
});

test('admin can create staff member', function () {
    $admin = User::factory()->admin()->create();
    $campus = Campus::query()->first();

    $this->actingAs($admin)
        ->post(route('admin.staff.store'), withFormProtection([
            'name' => 'Talisay Staff',
            'email' => 'staff.talisay@chmsu.edu.ph',
            'password' => testPassword(),
            'password_confirmation' => testPassword(),
            'campus_id' => $campus->id,
        ]))
        ->assertRedirect(route('admin.staff.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('users', [
        'email' => 'staff.talisay@chmsu.edu.ph',
        'role' => UserRole::Staff->value,
        'campus_id' => $campus->id,
    ]);
});

test('admin can update staff member', function () {
    $admin = User::factory()->admin()->create();
    $staff = User::factory()->staff()->create();
    $campus = Campus::query()->where('id', '!=', $staff->campus_id)->first();

    $this->actingAs($admin)
        ->put(route('admin.staff.update', $staff), withFormProtection([
            'name' => 'Updated Staff Name',
            'email' => 'updated.staff@chmsu.edu.ph',
            'password' => '',
            'password_confirmation' => '',
            'campus_id' => $campus->id,
        ]))
        ->assertRedirect(route('admin.staff.index'));

    $staff->refresh();

    expect($staff->name)->toBe('Updated Staff Name')
        ->and($staff->email)->toBe('updated.staff@chmsu.edu.ph')
        ->and($staff->campus_id)->toBe($campus->id);
});

test('admin can delete staff member', function () {
    $admin = User::factory()->admin()->create();
    $staff = User::factory()->staff()->create();

    $this->actingAs($admin)
        ->delete(route('admin.staff.destroy', $staff), withFormProtection())
        ->assertRedirect(route('admin.staff.index'));

    $this->assertDatabaseMissing('users', ['id' => $staff->id]);
});

test('admin cannot delete their own account via staff delete', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->delete(route('admin.staff.destroy', $admin))
        ->assertNotFound();
});

test('staff user cannot create staff members', function () {
    $staffUser = User::factory()->staff()->create();
    $campus = Campus::query()->first();

    $this->actingAs($staffUser)
        ->post(route('admin.staff.store'), withFormProtection([
            'name' => 'Blocked Staff',
            'email' => 'blocked@chmsu.edu.ph',
            'password' => 'password',
            'password_confirmation' => 'password',
            'campus_id' => $campus->id,
        ]))
        ->assertForbidden();
});

test('admin user seeder creates admin role', function () {
    $admin = User::query()->where('email', 'admin@chmsu.edu.ph')->first();

    if ($admin === null) {
        $this->seed(AdminUserSeeder::class);
        $admin = User::query()->where('email', 'admin@chmsu.edu.ph')->first();
    }

    expect($admin)->not->toBeNull()
        ->and($admin->role)->toBe(UserRole::Admin)
        ->and($admin->isAdmin())->toBeTrue();
});
