<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Verifikasi token SSO yang diterbitkan SIM-MENDUNIA (MiraigoSsoController).
 * Token berformat:  base64url(payload) . '.' . base64url(hmac_sha256(payload)).
 */
class MiraigoSsoController extends Controller
{
    /**
     * POST /api/auth/sso-mendunia — tukar token SSO menjadi sesi lokal MiraiGo.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $payload = $this->verify($data['token']);

        if ($payload === null) {
            return $this->error('Token SSO tidak valid atau sudah kedaluwarsa.', [], 401);
        }

        if (($payload['exp'] ?? 0) < time()) {
            return $this->error('Token SSO sudah kedaluwarsa. Silakan buka ulang dari sistem kandidat.', [], 401);
        }

        $email = $payload['email'] ?? null;

        if (! is_string($email) || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->error('Token SSO tidak membawa email yang valid.', [], 401);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $user = User::create([
                'name'     => $payload['name'] ?? $email,
                'username' => $email,
                'email'    => $email,
                'phone'    => null,
                'password' => Hash::make(Str::random(40)),
                'role'     => 'studentmendunia',
                'status'   => 'active',
            ]);
        }

        if ($user->status !== 'active') {
            return $this->error('Akun ini sedang dinonaktifkan.', [], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 'Login SSO berhasil.');
    }

    protected function verify(string $token): ?array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 2) {
            return null;
        }

        [$encoded, $signature] = $parts;

        if ($encoded === '' || $signature === '') {
            return null;
        }

        $secret = (string) config('services.mendunia.sso_secret');

        $expected = hash_hmac('sha256', $encoded, $secret, true);
        $provided = $this->base64UrlDecode($signature);

        if ($provided === false || ! hash_equals($expected, $provided)) {
            return null;
        }

        $json = $this->base64UrlDecode($encoded);

        if ($json === false) {
            return null;
        }

        $payload = json_decode($json, true);

        if (! is_array($payload)) {
            return null;
        }

        return $payload;
    }

    protected function base64UrlDecode(string $data): string|false
    {
        return base64_decode(strtr($data, '-_', '+/'), false);
    }
}