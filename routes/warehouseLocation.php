<?php

use App\Http\Controllers\WarehouseLocationController;
use Illuminate\Support\Facades\Route;

Route::post('/warehouse/location/create', [WarehouseLocationController::class, 'create']);
Route::patch('/warehouse/location/update', [WarehouseLocationController::class, 'update']);
Route::get('/warehouse/location/list', [WarehouseLocationController::class, 'list']);
Route::delete('/warehouse/location/delete', [WarehouseLocationController::class, 'delete']);
