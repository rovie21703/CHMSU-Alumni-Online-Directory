<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@chmsu.edu.ph'],
            [
                'name' => 'CHMSU Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'campus_id' => null,
                'email_verified_at' => now(),
            ]
        );
    }
}
