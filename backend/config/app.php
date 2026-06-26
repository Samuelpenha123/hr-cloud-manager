<?php
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\ServiceProvider;
return [
    'name' => env('APP_NAME', 'HR Cloud Manager'),
    'env'  => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url'   => env('APP_URL', 'http://localhost'),
    'timezone' => 'America/La_Paz',
    'locale' => 'es',
    'fallback_locale' => 'en',
    'faker_locale' => 'es_BO',
    'cipher' => 'AES-256-CBC',
    'key'    => env('APP_KEY'),
    'previous_keys' => array_filter(explode(',', env('APP_PREVIOUS_KEYS', ''))),
    'maintenance' => ['driver' => 'file'],
    'providers' => ServiceProvider::defaultProviders()->merge([
        Tymon\JWTAuth\Providers\LaravelServiceProvider::class,
    ])->toArray(),
    'aliases' => Facade::defaultAliases()->merge([
        'JWTAuth' => Tymon\JWTAuth\Facades\JWTAuth::class,
        'JWTFactory' => Tymon\JWTAuth\Facades\JWTFactory::class,
    ])->toArray(),
];
