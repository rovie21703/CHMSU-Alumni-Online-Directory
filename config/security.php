<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public Registration
    |--------------------------------------------------------------------------
    |
    | Staff accounts are created by admins. Keep this disabled in production.
    |
    */

    'allow_registration' => (bool) env('ALLOW_REGISTRATION', false),

    /*
    |--------------------------------------------------------------------------
    | Form Bot Protection
    |--------------------------------------------------------------------------
    |
    | Honeypot fields trap automated submissions. Time-based validation rejects
    | forms submitted faster than humans typically can complete them.
    |
    */

    'honeypot_field' => env('FORM_HONEYPOT_FIELD', 'website'),

    'form_min_seconds' => (int) env('FORM_MIN_SECONDS', 2),

    'form_max_seconds' => (int) env('FORM_MAX_SECONDS', 7200),

    'form_protection_excluded_routes' => [
        'logout',
    ],

];
