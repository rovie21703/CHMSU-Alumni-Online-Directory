<?php

use App\Models\User;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', withFormProtection([
        'email' => $user->email,
        'password' => 'password',
    ]));

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', withFormProtection([
        'email' => $user->email,
        'password' => 'wrong-password',
    ]));

    $this->assertGuest();
});

test('authenticated users can access the login screen', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/login')
        ->assertSuccessful();
});

test('authenticated users can sign in again via the login screen', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/login', withFormProtection([
        'email' => $user->email,
        'password' => 'password',
    ]));

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
