export type AlumniFormField =
    | 'name'
    | 'sex'
    | 'dateOfBirth'
    | 'age'
    | 'birthProvince'
    | 'birthProvinceOther'
    | 'birthCity'
    | 'birthCityOther'
    | 'mobileNo'
    | 'address'
    | 'civilStatus'
    | 'religion'
    | 'religionOther'
    | 'email'
    | 'yearGraduated'
    | 'campus'
    | 'degree'
    | 'highestAttainment'
    | 'eligibility'
    | 'employmentStatus'
    | 'employmentSector'
    | 'presentEmploymentStatus'
    | 'occupation'
    | 'position'
    | 'yearEmployed'
    | 'company'
    | 'companyAddress'
    | 'locationOfEmployment';

export type SubmissionInfo = {
    title: string;
    message: string;
    step: number;
};

export type ResolvedSubmissionErrors = SubmissionInfo & {
    formFieldErrors: Partial<Record<AlumniFormField, string>>;
    schoolError?: string;
};

const SERVER_TO_FORM_FIELD: Record<string, AlumniFormField> = {
    name: 'name',
    sex: 'sex',
    date_of_birth: 'dateOfBirth',
    mobile_no: 'mobileNo',
    address: 'address',
    civil_status: 'civilStatus',
    religion: 'religion',
    email: 'email',
    campus: 'campus',
    year_graduated: 'yearGraduated',
    degree: 'degree',
    highest_attainment: 'highestAttainment',
    eligibility: 'eligibility',
    employment_status: 'employmentStatus',
    employment_sector: 'employmentSector',
    present_employment_status: 'presentEmploymentStatus',
    occupation: 'occupation',
    position: 'position',
    year_employed: 'yearEmployed',
    company: 'company',
    company_address: 'companyAddress',
    location_of_employment: 'locationOfEmployment',
    birth_province: 'birthProvince',
    birth_city: 'birthCity',
    birth_province_custom: 'birthProvinceOther',
    birth_city_custom: 'birthCityOther',
    religion_other: 'religionOther',
    birth_city_id: 'birthCity',
    program_id: 'degree',
};

const STEP_1_FIELDS = new Set([
    'name',
    'sex',
    'date_of_birth',
    'mobile_no',
    'address',
    'civil_status',
    'religion',
    'email',
    'birth_city_id',
    'birth_province',
    'birth_city',
    'birth_province_custom',
    'birth_city_custom',
    'religion_other',
]);

const STEP_2_FIELDS = new Set([
    'campus',
    'year_graduated',
    'degree',
    'highest_attainment',
    'school_attended',
    'school_id',
    'program_id',
    'eligibility',
]);

function stepForField(field: string): number {
    if (STEP_1_FIELDS.has(field)) {
        return 1;
    }

    if (STEP_2_FIELDS.has(field)) {
        return 2;
    }

    return 3;
}

function modalContentForField(field: string, message: string): SubmissionInfo {
    if (field === 'email') {
        return {
            title: 'Email Already Registered',
            message:
                message ||
                'This email address is already registered in the alumni directory. Each email can only be used once. Please use a different email address or contact the administrator if you believe this is an error.',
            step: 1,
        };
    }

    if (field === 'form_started_at') {
        const expired = message.toLowerCase().includes('expired');

        return {
            title: expired ? 'Form Session Expired' : 'Please Wait Before Submitting',
            message: expired
                ? 'Your registration form has been open too long. Please refresh the page, fill in your details again, and submit.'
                : message || 'Please take a moment to review your information before submitting again.',
            step: 1,
        };
    }

    if (field === 'program_id' || field === 'degree') {
        return {
            title: 'Degree / Course Required',
            message:
                message ||
                'Please select a valid degree or course for your campus. If your program is not listed, contact the administrator.',
            step: 2,
        };
    }

    if (field === 'school_id' || field === 'school_attended') {
        return {
            title: 'School Selection Required',
            message: message || 'Please select the school you attended before submitting.',
            step: 2,
        };
    }

    if (field === 'birth_city_id' || field === 'birth_city') {
        return {
            title: 'Place of Birth Required',
            message:
                message ||
                'Please select a valid province and city or municipality for your place of birth.',
            step: 1,
        };
    }

    return {
        title: 'Unable to Submit Registration',
        message: message || 'Please review your information and try again.',
        step: stepForField(field),
    };
}

function pickPrimaryField(serverErrors: Record<string, string>): string {
    const priority = ['email', 'form_started_at', 'school_id', 'school_attended', 'program_id', 'birth_city_id'];

    for (const field of priority) {
        if (serverErrors[field]) {
            return field;
        }
    }

    return Object.keys(serverErrors)[0] ?? 'submission';
}

export function resolveSubmissionErrors(serverErrors: Record<string, string>): ResolvedSubmissionErrors {
    const primaryField = pickPrimaryField(serverErrors);
    const modal = modalContentForField(primaryField, serverErrors[primaryField] ?? '');

    const formFieldErrors: Partial<Record<AlumniFormField, string>> = {};
    let schoolError: string | undefined;

    for (const [field, message] of Object.entries(serverErrors)) {
        if (field === 'school_id' || field === 'school_attended') {
            schoolError = message;
            continue;
        }

        const formField = SERVER_TO_FORM_FIELD[field];

        if (formField) {
            formFieldErrors[formField] = message;
        }
    }

    return {
        ...modal,
        formFieldErrors,
        schoolError,
    };
}
