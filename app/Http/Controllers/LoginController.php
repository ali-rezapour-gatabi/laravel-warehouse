<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'phone_number' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt(['phone_number' => $credentials['phone_number'], 'password' => $credentials['password']])) {
            throw ValidationException::withMessages([
                'phone_number' => ['شماره موبایل وارد شده اشتباه است'],
                'password' => ['رمز عبور وارد شده اشتباه است'],
            ]);
        } else {
            return redirect()->route('dashboard');
        }
    }
}
