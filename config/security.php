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

];
