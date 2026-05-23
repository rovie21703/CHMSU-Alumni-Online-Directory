<?php

use App\Models\Alumni;
use App\Models\User;

test('guest is redirected from admin dashboard', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('authenticated user can view admin dashboard', function () {
    $user = User::factory()->admin()->create();

    Alumni::factory()->count(3)->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('records', 3)
            ->has('analytics')
            ->where('analytics.total', 3)
        );
});

test('authenticated user can export alumni excel', function () {
    $user = User::factory()->admin()->create();

    Alumni::factory()->count(2)->create();

    $this->actingAs($user)
        ->get(route('admin.alumni.export', [
            'columns' => ['name', 'email'],
        ]))
        ->assertSuccessful()
        ->assertDownload();
});

test('guest cannot export alumni excel', function () {
    $this->get(route('admin.alumni.export', [
        'columns' => ['name'],
    ]))->assertRedirect(route('login'));
});
