<?php

test('production csp allows only same-origin scripts', function () {
    $this->app->detectEnvironment(fn () => 'production');

    $csp = (string) $this->get(route('login'))->headers->get('Content-Security-Policy');

    expect($csp)->toContain("script-src 'self'")
        ->and($csp)->not->toContain('unsafe-inline');
});

test('login page shares ziggy config for client-side routing', function () {
    $this->get(route('login'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('ziggy.routes')
            ->has('ziggy.url')
        );
});
