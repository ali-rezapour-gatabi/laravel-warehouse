<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->middleware('auth')->name('home');
Route::view('/login', 'app')->name('login');
