export const GRADUATION_YEAR_START = 1950;

export function graduationYearOptions(endYear: number = new Date().getFullYear()): number[] {
    return Array.from(
        { length: endYear - GRADUATION_YEAR_START + 1 },
        (_, index) => endYear - index,
    );
}
