<?php

namespace Database\Seeders;

use App\Enums\MembershipRole;
use App\Models\Organization;
use App\Models\OrganizationMembership;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $organization = Organization::factory()->create([
            'name' => 'Obra Residencial das Flores',
            'slug' => 'residencial-das-flores',
        ]);

        $admin = User::factory()->create([
            'name' => 'Administrador de Demonstracao',
            'email' => 'admin@example.com',
        ]);

        OrganizationMembership::factory()->for($organization)->for($admin)->create([
            'role' => MembershipRole::Admin,
        ]);
    }
}
