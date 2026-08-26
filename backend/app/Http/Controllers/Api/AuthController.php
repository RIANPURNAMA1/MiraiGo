<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        $user = \App\Models\User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return $this->error('Invalid credentials.', ['email' => ['The provided credentials are incorrect.']], 401);
        }

        if ($user->status !== 'active') {
            return $this->error('This account is suspended.', [], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Login successful.');
    }

    public function logout()
    {
        $user = request()->user();
        $user?->currentAccessToken()?->delete();

        return $this->success([], 'Logged out.');
    }

    public function me()
    {
        return $this->success(new UserResource(request()->user()));
    }

    public function register()
    {
        $data = request()->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = \App\Models\User::create([
            'name'     => $data['name'],
            'username' => $data['email'],
            'email'    => $data['email'],
            'phone'    => $data['phone'] ?? null,
            'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
            'role'     => 'student',
            'status'   => 'active',
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 'Registration successful.', 201);
    }

    public function forgotPassword()
    {
        $data = request()->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = \App\Models\User::where('email', $data['email'])->first();

        if (! $user) {
            return $this->success([], 'If the email exists, a reset link has been sent.');
        }

        $token = \Illuminate\Support\Str::random(64);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token'       => \Illuminate\Support\Facades\Hash::make($token),
                'created_at'  => now(),
            ]
        );

        // In production, send email here. For now, return token for testing.
        return $this->success([
            'token' => $token,
            'email' => $user->email,
        ], 'Reset token generated.');
    }

    public function resetPassword()
    {
        $data = request()->validate([
            'token'                => ['required', 'string'],
            'email'                => ['required', 'string', 'email'],
            'password'             => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $resetRecord = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $data['email'])
            ->first();

        if (! $resetRecord || ! \Illuminate\Support\Facades\Hash::check($data['token'], $resetRecord->token)) {
            return $this->error('Token atau email tidak valid.', [], 422);
        }

        if (now()->diffInMinutes(\Illuminate\Carbon::parse($resetRecord->created_at)) > 60) {
            return $this->error('Token sudah kedaluwarsa.', [], 422);
        }

        $user = \App\Models\User::where('email', $data['email'])->first();
        $user->password = \Illuminate\Support\Facades\Hash::make($data['password']);
        $user->save();

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $data['email'])
            ->delete();

        return $this->success([], 'Password berhasil direset.');
    }
}
