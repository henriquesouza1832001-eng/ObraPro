<?php

namespace Tests\Feature;

use App\Models\Course;
use Database\Seeders\CourseCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_offers_a_clear_path_to_the_course_catalog(): void
    {
        $this->get('/')->assertOk()->assertSee('Ver cursos')->assertSee('/cursos');
    }

    public function test_public_catalog_lists_published_courses_and_their_access_type(): void
    {
        $this->seed(CourseCatalogSeeder::class);

        $this->get('/cursos')
            ->assertOk()
            ->assertSee('Planejamento da obra do zero')
            ->assertSee('Gratuito')
            ->assertSee('A partir de R$ 29,90');
    }

    public function test_course_details_show_modules_and_lessons(): void
    {
        $this->seed(CourseCatalogSeeder::class);

        $this->get('/cursos/alvenaria-na-pratica')
            ->assertOk()
            ->assertSee('Alvenaria na prática')
            ->assertSee('Entenda antes de executar')
            ->assertSee('Checklist de conferência');
    }

    public function test_unpublished_course_is_not_publicly_accessible(): void
    {
        $course = Course::factory()->create(['is_published' => false]);

        $this->get('/cursos/'.$course->slug)->assertNotFound();
    }
}
