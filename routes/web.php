<?php

use App\Http\Controllers\Admin\AlumniExportController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\AlumniController;
use App\Http\Controllers\AlumniFormController;
use Illuminate\Support\Facades\Route;

Route::redirect('/admin', '/login')->name('admin.login');

Route::get('/', [AlumniFormController::class, 'create'])->name('alumni.create');
Route::post('/alumni', [AlumniController::class, 'store'])
    ->middleware('throttle:alumni-submit')
    ->name('alumni.store');

Route::middleware(['auth', 'throttle:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/alumni/export', AlumniExportController::class)
        ->middleware('throttle:export')
        ->name('alumni.export');

    Route::middleware('admin')->group(function () {
        Route::middleware('throttle:staff-write')->group(function () {
            Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
            Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
            Route::put('/staff/{staff}', [StaffController::class, 'update'])->name('staff.update');
            Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
