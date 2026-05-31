<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DashboardIndexRequest;
use App\Http\Resources\AlumniListResource;
use App\Models\Alumni;
use App\Services\AlumniAnalyticsService;
use App\Services\AlumniDashboardRecordsQuery;
use App\Services\AlumniExportOptionsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private AlumniAnalyticsService $analytics,
        private AlumniExportOptionsService $exportOptions,
    ) {}

    public function index(DashboardIndexRequest $request): Response
    {
        $this->authorize('viewAny', Alumni::class);

        $user = $request->user();
        $params = $request->queryParams();

        $paginator = AlumniDashboardRecordsQuery::paginate($user, $params);

        $recent = AlumniDashboardRecordsQuery::recent($user)
            ->get();

        return Inertia::render('admin/dashboard', [
            'records' => [
                'data' => AlumniListResource::collection($paginator->items())->resolve(),
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
            'recentRecords' => AlumniListResource::collection($recent)->resolve(),
            'recordsTotal' => $paginator->total(),
            'filters' => [
                'search' => $params['search'] ?? '',
                'sort' => $params['sort'] ?? 'name',
                'dir' => $params['dir'] ?? 'asc',
                'filter_status' => $params['filter_status'] ?? '',
                'filter_sector' => $params['filter_sector'] ?? '',
                'filter_location' => $params['filter_location'] ?? '',
            ],
            'analytics' => $this->analytics->computeForUser($user),
            'exportOptions' => $this->exportOptions->build(),
        ]);
    }
}
