import { PHILIPPINE_LOCATIONS, PHILIPPINE_PROVINCES } from '@/data/philippine-locations';
import { RELIGIONS, SELECT_OTHERS } from '@/data/religions';

export function resolveBirthPlaceFields(birthProvince: string, birthCity: string): {
    birthProvince: string;
    birthProvinceOther: string;
    birthCity: string;
    birthCityOther: string;
} {
    const provinceInList = PHILIPPINE_PROVINCES.includes(birthProvince);

    if (birthProvince && !provinceInList) {
        return {
            birthProvince: SELECT_OTHERS,
            birthProvinceOther: birthProvince,
            birthCity: SELECT_OTHERS,
            birthCityOther: birthCity,
        };
    }

    const cities = birthProvince ? PHILIPPINE_LOCATIONS[birthProvince] ?? [] : [];
    const cityInList = cities.includes(birthCity);

    if (birthCity && !cityInList) {
        return {
            birthProvince,
            birthProvinceOther: '',
            birthCity: SELECT_OTHERS,
            birthCityOther: birthCity,
        };
    }

    return {
        birthProvince,
        birthProvinceOther: '',
        birthCity,
        birthCityOther: '',
    };
}

export function resolveReligionField(religion: string): {
    religion: string;
    religionOther: string;
} {
    if (religion && !(RELIGIONS as readonly string[]).includes(religion)) {
        return { religion: SELECT_OTHERS, religionOther: religion };
    }

    return { religion, religionOther: '' };
}
