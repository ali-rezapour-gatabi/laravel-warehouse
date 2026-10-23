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
            'phone_number' => ['required', 'regex:/^09[0-9]{9}$/'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt(['phone_number' => $credentials['phone_number'], 'password' => $credentials['password']])) {
            throw ValidationException::withMessages([
                'message' => 'شماره موبایل یا رمز عبور اشتباه است.',
            ]);
        } else {
            return redirect()->route('home');
        }
    }
}
