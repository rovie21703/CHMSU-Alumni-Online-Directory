<?php

namespace App\Services;

use App\Models\Alumni;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class AlumniDashboardRecordsQuery
{
    private const PER_PAGE = 10;

    /**
     * @var list<string>
     */
    private const SORTABLE = ['name', 'degree', 'year_graduated', 'campus'];

    /**
     * @param  array<string, mixed>  $params
     * @return Builder<Alumni>
     */
    public static function base(User $user): Builder
    {
        return Alumni::query()
            ->visibleTo($user)
            ->with(['school.campus', 'program.campus']);
    }

    /**
     * @param  array<string, mixed>  $params
     * @return Builder<Alumni>
     */
    public static function apply(Builder $query, array $params): Builder
    {
        if (! empty($params['search'])) {
            $term = '%'.addcslashes((string) $params['search'], '%_\\').'%';

            $query->where(function (Builder $builder) use ($term) {
                $builder
                    ->where('name', 'like', $term)
                    ->orWhere('degree', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('campus', 'like', $term)
                    ->orWhere('occupation', 'like', $term);
            });
        }

        if (! empty($params['filter_status'])) {
            $query->where('employment_status', (string) $params['filter_status']);
        }

        if (! empty($params['filter_sector'])) {
            $sector = (string) $params['filter_sector'];

            if ($sector === 'ENTREPRENEURIAL') {
                $query->where('employment_sector', 'like', '%ENTREPRENEURIAL%');
            } else {
                $query->where('employment_sector', $sector);
            }
        }

        if (! empty($params['filter_location'])) {
            if ($params['filter_location'] === 'ABROAD') {
                $query->where('location_of_employment', 'like', '%ABROAD%');
            } elseif ($params['filter_location'] === 'LOCAL') {
                $query->whereNotNull('location_of_employment')
                    ->where('location_of_employment', 'not like', '%ABROAD%');
            }
        }

        $sortKey = in_array($params['sort'] ?? '', self::SORTABLE, true)
            ? (string) $params['sort']
            : 'name';
        $sortDir = ($params['dir'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortKey, $sortDir);
    }

    /**
     * @param  array<string, mixed>  $params
     * @return LengthAwarePaginator<int, Alumni>
     */
    public static function paginate(User $user, array $params): LengthAwarePaginator
    {
        $page = max(1, (int) ($params['page'] ?? 1));

        return self::apply(self::base($user), $params)
            ->paginate(self::PER_PAGE, ['*'], 'page', $page)
            ->withQueryString();
    }

    /**
     * @return Builder<Alumni>
     */
    public static function recent(User $user, int $limit = 5): Builder
    {
        return self::base($user)
            ->latest('submitted_at')
            ->limit($limit);
    }

    public static function perPage(): int
    {
        return self::PER_PAGE;
    }
}
