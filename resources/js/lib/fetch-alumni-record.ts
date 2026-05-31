import type { AlumniRecord } from '@/types/alumni';

export async function fetchAlumniRecord(id: string): Promise<AlumniRecord> {
    const response = await fetch(route('admin.alumni.show', { alumnus: id }), {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
    });

    if (!response.ok) {
        throw new Error('Failed to load alumni record.');
    }

    const payload = (await response.json()) as { data: AlumniRecord };

    return payload.data;
}
