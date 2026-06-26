<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\VacationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;

// Rutas públicas
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Rutas protegidas con JWT
Route::middleware(['jwt.auth'])->group(function () {

    // Auth personal
    Route::prefix('auth')->group(function () {
        Route::post('/logout',  [AuthController::class, 'logout']);
        Route::get('/me',       [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });

    // Dashboard (todos los roles — filtrado internamente por rol)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Empleados (employee solo puede ver el suyo — filtrado internamente)
    Route::get('/employees/stats', [EmployeeController::class, 'stats']);
    Route::apiResource('/employees', EmployeeController::class);

    // Asistencia (employee puede marcar su propia entrada/salida)
    Route::get('/attendances/report',     [AttendanceController::class, 'report']);
    Route::get('/attendances/today',      [AttendanceController::class, 'todayStatus']);
    Route::post('/attendances/check-in',  [AttendanceController::class, 'checkIn']);
    Route::post('/attendances/check-out', [AttendanceController::class, 'checkOut']);
    Route::apiResource('/attendances', AttendanceController::class);

    // Vacaciones (employee puede ver las suyas y crear para sí mismo)
    Route::get('/vacations/calendar',      [VacationController::class, 'calendar']);
    Route::put('/vacations/{id}/approve',  [VacationController::class, 'approve']);
    Route::put('/vacations/{id}/reject',   [VacationController::class, 'reject']);
    Route::apiResource('/vacations', VacationController::class);

    // Documentos (employee solo puede ver los suyos)
    Route::apiResource('/documents', DocumentController::class);

    // Notificaciones
    Route::get('/notifications',             [NotificationController::class, 'index']);
    Route::put('/notifications/read-all',    [NotificationController::class, 'markAllRead']);
    Route::put('/notifications/{id}/read',   [NotificationController::class, 'markRead']);
    Route::delete('/notifications/{id}',     [NotificationController::class, 'destroy']);

    // Gestión de usuarios — solo admin
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/users/available-employees', [UserController::class, 'availableEmployees']);
        Route::apiResource('/users', UserController::class);
    });
});
