<?php

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post('/register', withFormProtection([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => testPassword(),
        'password_confirmation' => testPassword(),
    ]));

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});
