<?php

use App\Models\Alumni;
use App\Models\Program;
use App\Models\User;
use App\Services\AlumniExportQueryBuilder;
use App\Support\AlumniExportColumns;

test('guest cannot export alumni excel', function () {
    $this->get(route('admin.alumni.export', [
        'columns' => ['name', 'email'],
    ]))->assertRedirect(route('login'));
});

test('authenticated user can export alumni excel', function () {
    $user = User::factory()->admin()->create();
    Alumni::factory()->count(2)->create();

    $this->actingAs($user)
        ->get(route('admin.alumni.export', [
            'columns' => AlumniExportColumns::keys(),
        ]))
        ->assertSuccessful()
        ->assertDownload();
});

test('export requires at least one column', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('admin.alumni.export', ['columns' => []]))
        ->assertSessionHasErrors('columns');
});

test('export query filters by employment status and program', function () {
    $program = Program::query()->first();

    $matching = Alumni::factory()->create([
        'program_id' => $program?->id,
        'employment_status' => 'YES',
    ]);
    Alumni::factory()->create([
        'employment_status' => 'NO',
    ]);

    $ids = AlumniExportQueryBuilder::apply(
        AlumniExportQueryBuilder::baseQuery(),
        [
            'employment_status' => ['YES'],
            'program_ids' => [$program?->id],
        ],
    )->pluck('id')->all();

    expect($ids)->toBe([$matching->id]);
});

test('admin dashboard includes export options', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('exportOptions.columns')
            ->has('exportOptions.campuses')
            ->has('exportOptions.schools')
            ->has('exportOptions.filterValues')
        );
});
