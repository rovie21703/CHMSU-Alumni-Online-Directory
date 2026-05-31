import { usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

import { formProtectionFields, mergeFormProtection, type FormProtectionProps } from '@/lib/form-protection';
import type { SharedData } from '@/types';

export function useFormProtection() {
    const { formProtection } = usePage<SharedData>().props;

    const protection = formProtection as FormProtectionProps;

    const fields = useMemo(() => formProtectionFields(protection), [protection]);

    const merge = useCallback(
        <T extends Record<string, unknown>>(data: T) => mergeFormProtection(data, protection),
        [protection],
    );

    return {
        fields,
        merge,
        formProtection: protection,
    };
}
