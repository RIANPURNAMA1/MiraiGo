<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the location
    | where each service's setting is stored, and may be referenced by
    | service providers or other parts of the application.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SIM-MENDUNIA (sistem management kandidat)
    |--------------------------------------------------------------------------
    | Kredensial untuk verifikasi token SSO yang diterbitkan oleh
    | SIM-MENDUNIA (MiraigoSsoController). Secret harus sama persis
    | dengan MIRAIGO_SSO_SECRET di sisi SIM-MENDUNIA.
    */
    'mendunia' => [
        'base_url' => env('MENDUNIA_BASE_URL', 'http://localhost:5174'),
        'sso_iss' => 'sim-mendunia',
        'sso_secret' => env('MIRAIGO_SSO_SECRET', 'miraigo-sso-local-secret-change-me'),
    ],

];