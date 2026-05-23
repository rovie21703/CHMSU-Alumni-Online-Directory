<?php

namespace App\Support;

class AlumniExportColumns
{
    /**
     * @return array<string, array{label: string, group: string}>
     */
    public static function definitions(): array
    {
        return [
            'id' => ['label' => 'ID', 'group' => 'meta'],
            'submitted_at' => ['label' => 'Submitted At', 'group' => 'meta'],
            'name' => ['label' => 'Name', 'group' => 'personal'],
            'sex' => ['label' => 'Sex', 'group' => 'personal'],
            'date_of_birth' => ['label' => 'Date of Birth', 'group' => 'personal'],
            'age' => ['label' => 'Age', 'group' => 'personal'],
            'birth_province' => ['label' => 'Birth Province', 'group' => 'personal'],
            'birth_city' => ['label' => 'Birth City', 'group' => 'personal'],
            'civil_status' => ['label' => 'Civil Status', 'group' => 'personal'],
            'religion' => ['label' => 'Religion', 'group' => 'personal'],
            'email' => ['label' => 'Email', 'group' => 'personal'],
            'mobile_no' => ['label' => 'Mobile No.', 'group' => 'personal'],
            'address' => ['label' => 'Address', 'group' => 'personal'],
            'school' => ['label' => 'School Attended', 'group' => 'education'],
            'campus' => ['label' => 'Campus', 'group' => 'education'],
            'degree' => ['label' => 'Degree / Course', 'group' => 'education'],
            'year_graduated' => ['label' => 'Year Graduated', 'group' => 'education'],
            'highest_attainment' => ['label' => 'Highest Attainment', 'group' => 'education'],
            'eligibility' => ['label' => 'Eligibility', 'group' => 'education'],
            'employment_status' => ['label' => 'Employment Status', 'group' => 'employment'],
            'employment_sector' => ['label' => 'Employment Sector', 'group' => 'employment'],
            'present_employment_status' => ['label' => 'Present Employment Status', 'group' => 'employment'],
            'occupation' => ['label' => 'Occupation', 'group' => 'employment'],
            'position' => ['label' => 'Position', 'group' => 'employment'],
            'year_employed' => ['label' => 'Year Employed', 'group' => 'employment'],
            'company' => ['label' => 'Company / Organization', 'group' => 'employment'],
            'location_of_employment' => ['label' => 'Location of Employment', 'group' => 'employment'],
        ];
    }

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_keys(self::definitions());
    }

    /**
     * @return array<string, string>
     */
    public static function groupLabels(): array
    {
        return [
            'meta' => 'Record',
            'personal' => 'Personal Information',
            'education' => 'Education',
            'employment' => 'Employment',
        ];
    }

    /**
     * @return list<array{key: string, label: string, group: string, groupLabel: string}>
     */
    public static function forFrontend(): array
    {
        $definitions = self::definitions();
        $groupLabels = self::groupLabels();

        return array_map(
            fn (string $key): array => [
                'key' => $key,
                'label' => $definitions[$key]['label'],
                'group' => $definitions[$key]['group'],
                'groupLabel' => $groupLabels[$definitions[$key]['group']],
            ],
            self::keys(),
        );
    }

    public static function label(string $key): string
    {
        return self::definitions()[$key]['label'];
    }

}
