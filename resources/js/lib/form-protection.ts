export interface FormProtectionProps {
    honeypotField: string;
    formStartedAt: string;
}

export function formProtectionFields(formProtection: FormProtectionProps): Record<string, string> {
    return {
        [formProtection.honeypotField]: '',
        form_started_at: formProtection.formStartedAt,
    };
}

export function mergeFormProtection<T extends Record<string, unknown>>(
    data: T,
    formProtection: FormProtectionProps,
): T & Record<string, string> {
    return {
        ...data,
        ...formProtectionFields(formProtection),
    };
}
