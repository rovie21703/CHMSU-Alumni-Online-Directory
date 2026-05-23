<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class AlumniFormController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('alumni/form');
    }
}
