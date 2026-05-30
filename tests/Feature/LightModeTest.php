<?php

test('app layout forces light color scheme', function () {
    $response = $this->get('/');

    $response->assertSuccessful();
    $response->assertSee('color-scheme: light', false);
    $response->assertSee('content="light"', false);
    $response->assertSee("classList.remove('dark')", false);
});

test('appearance settings redirect to profile', function () {
    $user = \App\Models\User::factory()->create();

    $this->actingAs($user)
        ->get('/settings/appearance')
        ->assertRedirect('/settings/profile');
});
