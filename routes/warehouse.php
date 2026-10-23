<?php

use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::view('/warehouse', 'app')->name('warehouse');

Route::post('/warehouses/create/', [WarehouseController::class, 'create'])
    ->middleware('auth')
    ->name('warehouse.create');

Route::get('/warehouses/list', [WarehouseController::class, 'list'])
    ->middleware('auth')
    ->name('warehouse.list');

Route::patch('/warehouses/edit/status', [WarehouseController::class, 'updateStatus'])
    ->middleware('auth')
    ->name('warehouse.list');

Route::patch('/warehouses/update', [WarehouseController::class, 'update'])
    ->middleware('auth')
    ->name('warehouse.update');

Route::delete('/warehouses/delete', [WarehouseController::class, 'delete'])
    ->middleware('auth')
    ->name('warehouse.delete');
