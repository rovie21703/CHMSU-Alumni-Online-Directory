<?php

namespace App\Services;

use App\Models\Alumni;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class AlumniExportQueryBuilder
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public static function apply(Builder $query, array $filters): Builder
    {
        if (! empty($filters['submitted_from'])) {
            $query->whereDate('submitted_at', '>=', $filters['submitted_from']);
        }

        if (! empty($filters['submitted_to'])) {
            $query->whereDate('submitted_at', '<=', $filters['submitted_to']);
        }

        if (! empty($filters['year_graduated_from'])) {
            $query->where('year_graduated', '>=', (string) $filters['year_graduated_from']);
        }

        if (! empty($filters['year_graduated_to'])) {
            $query->where('year_graduated', '<=', (string) $filters['year_graduated_to']);
        }

        if (! empty($filters['school_ids'])) {
            $query->whereIn('school_id', $filters['school_ids']);
        }

        if (! empty($filters['program_ids'])) {
            $query->whereIn('program_id', $filters['program_ids']);
        }

        if (! empty($filters['campus_ids'])) {
            $query->whereHas('program', fn (Builder $programQuery) => $programQuery->whereIn('campus_id', $filters['campus_ids']));
        }

        if (! empty($filters['employment_status'])) {
            $query->whereIn('employment_status', $filters['employment_status']);
        }

        if (! empty($filters['employment_sector'])) {
            $query->whereIn('employment_sector', $filters['employment_sector']);
        }

        if (! empty($filters['present_employment_status'])) {
            $query->whereIn('present_employment_status', $filters['present_employment_status']);
        }

        if (! empty($filters['highest_attainment'])) {
            $query->whereIn('highest_attainment', $filters['highest_attainment']);
        }

        if (! empty($filters['sex'])) {
            $query->whereIn('sex', $filters['sex']);
        }

        if (! empty($filters['birth_province_ids'])) {
            $query->whereHas('birthCity', fn (Builder $cityQuery) => $cityQuery->whereIn('province_id', $filters['birth_province_ids']));
        }

        if (($filters['location'] ?? null) === 'ABROAD') {
            $query->where('location_of_employment', 'like', '%ABROAD%');
        } elseif (($filters['location'] ?? null) === 'LOCAL') {
            $query->whereNotNull('location_of_employment')
                ->where('location_of_employment', 'not like', '%ABROAD%');
        }

        return $query->orderBy('submitted_at');
    }

    /**
     * @return Builder<Alumni>
     */
    public static function baseQuery(?User $user = null): Builder
    {
        $query = Alumni::query()
            ->with(['school', 'program.campus', 'birthCity.province']);

        if ($user !== null) {
            $query->visibleTo($user);
        }

        return $query;
    }
}
