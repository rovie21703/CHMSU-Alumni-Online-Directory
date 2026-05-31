<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAlumniRequest;
use App\Http\Resources\AlumniResource;
use App\Models\Alumni;
use Illuminate\Http\RedirectResponse;

class AlumniController extends Controller
{
    public function show(Alumni $alumnus): AlumniResource
    {
        $this->authorize('view', $alumnus);

        $alumnus->load(['school.campus', 'program.campus', 'birthCity.province']);

        return new AlumniResource($alumnus);
    }

    public function update(UpdateAlumniRequest $request, Alumni $alumnus): RedirectResponse
    {
        $alumnus->update($request->validated());

        return redirect()
            ->route('admin.dashboard')
            ->with('success', 'Alumni record updated successfully.');
    }

    public function destroy(Alumni $alumnus): RedirectResponse
    {
        $this->authorize('delete', $alumnus);

        $alumnus->delete();

        return redirect()
            ->route('admin.dashboard')
            ->with('success', 'Alumni record deleted successfully.');
    }
}
