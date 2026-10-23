<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->middleware('auth')->name('home');
Route::view('/login', 'app')->name('login');
Route::view('/products', 'app')->name('products');
Route::view('/members', 'app')->name('members');


require __DIR__ . '/user.php';
require __DIR__ . '/warehouse.php';
