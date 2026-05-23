import locations from './philippine-locations.json';

export const PHILIPPINE_LOCATIONS = locations as Record<string, string[]>;

export const PHILIPPINE_PROVINCES = Object.keys(PHILIPPINE_LOCATIONS).sort((a, b) =>
    a.localeCompare(b),
);
