<?php

use App\Models\User;
use App\Support\FormProtection;

test('mutating requests without form protection fields are rejected', function () {
    $this->post(route('alumni.store'), [
        'consent_given' => true,
        'name' => 'BOT SUBMISSION',
    ])->assertSessionHasErrors('form_started_at');
});

test('mutating requests with filled honeypot are rejected', function () {
    $payload = withFormProtection();
    $payload[FormProtection::honeypotField()] = 'https://spam.example';

    $this->post(route('alumni.store'), $payload)
        ->assertSessionHasErrors(FormProtection::honeypotField());
});

test('mutating requests submitted too quickly are rejected', function () {
    $payload = withFormProtection();
    $payload['form_started_at'] = FormProtection::timingToken();

    $this->post(route('alumni.store'), $payload)
        ->assertSessionHasErrors('form_started_at');
});

test('logout route is excluded from form protection', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('logout'))
        ->assertRedirect('/');
});

test('inertia pages share form protection props', function () {
    $this->get(route('alumni.create'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('formProtection.honeypotField')
            ->has('formProtection.formStartedAt')
        );
});
