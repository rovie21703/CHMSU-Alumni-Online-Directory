import { useEffect, useState } from 'react';

const COMPACT_QUERY = '(max-width: 639px)';

/** True on phone-sized viewports (below Tailwind `sm`). */
export function useCompactViewport(): boolean {
    const [compact, setCompact] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia(COMPACT_QUERY).matches : false,
    );

    useEffect(() => {
        const media = window.matchMedia(COMPACT_QUERY);
        const onChange = () => setCompact(media.matches);
        onChange();
        media.addEventListener('change', onChange);

        return () => media.removeEventListener('change', onChange);
    }, []);

    return compact;
}
