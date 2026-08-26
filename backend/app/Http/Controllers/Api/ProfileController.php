<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show()
    {
        return $this->success(new UserResource(Auth::user()));
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = Auth::user();
        $user->update($request->validated());

        return $this->success(new UserResource($user), 'Profile updated.');
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = Auth::user();
        $user->update(['password' => Hash::make($request->validated('password'))]);

        return $this->success([], 'Password updated.');
    }
}
