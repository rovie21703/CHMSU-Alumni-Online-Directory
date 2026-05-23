<?php

$allowedOrigins = array_values(array_unique(array_filter([
    env('APP_URL'),
    env('FRONTEND_URL'),
])));

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This Inertia app is primarily same-origin. Explicit origins avoid wildcard
    | exposure if API routes are added later. CORS is not a substitute for auth.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => $allowedOrigins !== [] ? $allowedOrigins : ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'X-Requested-With', 'Accept', 'Authorization', 'X-XSRF-TOKEN'],

    'exposed_headers' => ['X-Request-Id'],

    'max_age' => 0,

    'supports_credentials' => true,

];
