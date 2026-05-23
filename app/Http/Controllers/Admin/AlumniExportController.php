<?php

namespace App\Http\Controllers\Admin;

use App\Exports\AlumniExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ExportAlumniRequest;
use App\Services\AlumniExportQueryBuilder;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AlumniExportController extends Controller
{
    public function __invoke(ExportAlumniRequest $request): BinaryFileResponse
    {
        $this->authorize('export', \App\Models\Alumni::class);

        $query = AlumniExportQueryBuilder::apply(
            AlumniExportQueryBuilder::baseQuery($request->user()),
            $request->filters(),
        );

        $filename = 'chmsu-alumni-'.now()->format('Y-m-d-His').'.xlsx';

        return Excel::download(
            new AlumniExport($query, $request->selectedColumns()),
            $filename,
        );
    }
}
