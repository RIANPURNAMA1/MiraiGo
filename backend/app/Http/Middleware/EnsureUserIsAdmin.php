<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Only allow users with the "admin" role to proceed.
     * Student users receive a 403 - authorization is ALWAYS enforced server-side,
     * never trusted from the frontend route guard alone.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Admin access required.',
                'errors' => [],
            ], 403);
        }

        return $next($request);
    }
}
