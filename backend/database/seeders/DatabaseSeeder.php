<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario de demostración
        User::firstOrCreate(
            ['email' => 'admin@hrcloud.com'],
            [
                'name'         => 'Admin Demo',
                'password'     => Hash::make('password'),
                'company_name' => 'Empresa Demo S.A.',
                'role'         => 'admin',
                'is_active'    => true,
            ]
        );
    }
}
