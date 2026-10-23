<?php

use App\Http\Controllers\MeasurementController;
use Illuminate\Support\Facades\Route;

Route::view('/measurements', 'app')->middleware('auth')->name('measurements');

Route::post('/measurement/create', [MeasurementController::class, 'create'])
    ->middleware('auth')
    ->name('measurement.create');

Route::patch('/measurement/update', [MeasurementController::class, 'update'])
    ->middleware('auth')
    ->name('measurement.update');

Route::get('/measurements/list', [MeasurementController::class, 'list'])->middleware('auth')->name('measurement.list');

Route::patch('/measurement/edit/status', [MeasurementController::class, 'updateStatus'])
    ->middleware('auth')
    ->name('measurement.list');

Route::delete('/measurement/delete', [MeasurementController::class, 'delete'])
    ->middleware('auth')
    ->name('measurement.delete');
