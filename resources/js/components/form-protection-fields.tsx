import { useFormProtection } from '@/hooks/use-form-protection';

export function FormProtectionFields() {
    const { formProtection, fields } = useFormProtection();

    return (
        <>
            <input
                type="text"
                name={formProtection.honeypotField}
                value={fields[formProtection.honeypotField]}
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
                aria-hidden="true"
                readOnly
            />
            <input type="hidden" name="form_started_at" value={fields.form_started_at} readOnly />
        </>
    );
}
