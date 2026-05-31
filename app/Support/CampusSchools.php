<?php

namespace App\Support;

class CampusSchools
{
    /**
     * @var array<string, list<string>>
     */
    public const CAMPUS_SCHOOLS = [
        'TALISAY (MAIN) CAMPUS' => ['CHMSU', 'CHMSC', 'PSC', 'NOCAT', 'NOSAT'],
        'ALIJIS CAMPUS' => ['BCNTS', 'PSC', 'CHMSC', 'CHMSU'],
        'FORTUNE TOWNE CAMPUS' => ['NOPCC', 'CHMSC', 'CHMSU'],
        'BINALBAGAN CAMPUS' => ['NOSOF', 'CHMSC', 'CHMSU'],
    ];

    public static function defaultCampusForSchool(?string $schoolCode): ?string
    {
        if (! is_string($schoolCode) || $schoolCode === '') {
            return null;
        }

        $schoolCode = strtoupper(trim($schoolCode));
        $matches = [];

        foreach (self::CAMPUS_SCHOOLS as $campus => $schools) {
            if (in_array($schoolCode, $schools, true)) {
                $matches[] = $campus;
            }
        }

        return count($matches) === 1 ? $matches[0] : null;
    }
}
