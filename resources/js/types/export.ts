export type ExportColumnOption = {
    key: string;
    label: string;
    group: string;
    groupLabel: string;
};

export type ExportProgramOption = {
    id: number;
    name: string;
};

export type ExportCampusOption = {
    id: number;
    name: string;
    programs: ExportProgramOption[];
};

export type ExportSchoolOption = {
    id: number;
    code: string;
    name: string;
};

export type ExportProvinceOption = {
    id: number;
    name: string;
};

export type ExportLocationOption = {
    value: string;
    label: string;
};

export type ExportOptions = {
    columns: ExportColumnOption[];
    columnGroups: Record<string, string>;
    defaultColumns: string[];
    campuses: ExportCampusOption[];
    schools: ExportSchoolOption[];
    provinces: ExportProvinceOption[];
    filterValues: {
        employmentStatuses: string[];
        employmentSectors: string[];
        presentEmploymentStatuses: string[];
        highestAttainments: string[];
        sexOptions: string[];
        locationOptions: ExportLocationOption[];
        yearGraduated: { min: number; max: number };
        submittedAt: { min: string | null; max: string | null };
    };
};

export type AlumniExportFormState = {
    columns: string[];
    submittedFrom: string;
    submittedTo: string;
    yearGraduatedFrom: string;
    yearGraduatedTo: string;
    schoolIds: number[];
    programIds: number[];
    campusIds: number[];
    employmentStatus: string[];
    employmentSector: string[];
    presentEmploymentStatus: string[];
    highestAttainment: string[];
    sex: string[];
    birthProvinceIds: number[];
    location: string;
};
