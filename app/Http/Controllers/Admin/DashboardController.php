<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AlumniResource;
use App\Models\Alumni;
use App\Services\AlumniAnalyticsService;
use App\Services\AlumniExportOptionsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private AlumniAnalyticsService $analytics,
        private AlumniExportOptionsService $exportOptions,
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Alumni::class);

        $user = request()->user();

        $records = Alumni::query()
            ->visibleTo($user)
            ->with(['school', 'program.campus', 'birthCity.province'])
            ->latest('submitted_at')
            ->get();

        return Inertia::render('admin/dashboard', [
            'records' => AlumniResource::collection($records)->resolve(),
            'analytics' => $this->analytics->compute($records),
            'exportOptions' => $this->exportOptions->build(),
        ]);
    }
}
