<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\View\View;

class CourseController extends Controller
{
    public function index(): View
    {
        $courses = Course::query()
            ->where('is_published', true)
            ->withCount('modules')
            ->orderByDesc('is_featured')
            ->orderBy('title')
            ->get();

        return view('courses.index', ['courses' => $courses]);
    }

    public function show(Course $course): View
    {
        abort_unless($course->is_published, 404);

        $course->load('modules.lessons');

        return view('courses.show', ['course' => $course]);
    }
}
