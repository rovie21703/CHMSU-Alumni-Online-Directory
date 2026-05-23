<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlumniRequest;
use App\Models\Alumni;
use Illuminate\Http\RedirectResponse;

class AlumniController extends Controller
{
    public function store(StoreAlumniRequest $request): RedirectResponse
    {
        Alumni::query()->create([
            ...$request->validated(),
            'submitted_at' => now(),
            'consent_given' => true,
        ]);

        return redirect()->route('alumni.create')->with('success', true);
    }
}
