export const CAMPUSES = [
    'TALISAY (MAIN) CAMPUS',
    'FORTUNE TOWNE CAMPUS',
    'BINALBAGAN CAMPUS',
    'ALIJIS CAMPUS',
] as const;

export const CAMPUS_SCHOOLS: Record<string, string[]> = {
    'TALISAY (MAIN) CAMPUS': ['CHMSU', 'CHMSC', 'PSC', 'NOCAT', 'NOSAT'],
    'ALIJIS CAMPUS': ['BCNTS', 'PSC', 'CHMSC', 'CHMSU'],
    'FORTUNE TOWNE CAMPUS': ['NOPCC', 'CHMSC', 'CHMSU'],
    'BINALBAGAN CAMPUS': ['NOSOF', 'CHMSC', 'CHMSU'],
};

export function schoolsForCampus(campus: string): string[] {
    return CAMPUS_SCHOOLS[campus] ?? [];
}
