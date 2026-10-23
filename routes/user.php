<?php

use App\Http\Controllers\LoginController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::view('/login', 'app')->name('login');

Route::get('/auth/user', function (Request $request) {
    return response()->json([
        'user' => $request->user(),
    ]);
})->middleware('auth')->name('auth.user');


Route::post('/login', [LoginController::class, 'login'])
    ->middleware('guest')
    ->name('login.submit');
