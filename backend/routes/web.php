<?php
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => response()->json(['message' => 'HR Cloud Manager API v1.0', 'status' => 'online']));
Route::get('/health', fn() => response()->json(['status' => 'ok', 'timestamp' => now()]));
