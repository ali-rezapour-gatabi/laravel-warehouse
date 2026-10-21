<?php

use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->middleware('auth')->name('home');
Route::view('/login', 'app')->name('login');


Route::post('/login', [LoginController::class, 'login'])
    ->middleware('guest')
    ->name('login.submit');
