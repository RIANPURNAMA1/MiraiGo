<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken as BaseVerifyCsrfToken;

class VerifyCsrfToken extends BaseVerifyCsrfToken
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * Public authentication endpoints do not have an existing session to
     * protect, so they are excluded from CSRF verification. The SPA still
     * calls /sanctum/csrf-cookie before mutating requests where a session
     * is already established.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/auth/register',
        'api/auth/login',
        'api/auth/forgot-password',
        'api/auth/reset-password',
        'api/auth/sso-mendunia',
    ];
}
