import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { ErrorBoundary } from './components/error-boundary';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

router.on('error', () => {
    console.error('A network or server error occurred while loading the page.');
});

router.on('invalid', (event) => {
    if (event.detail.response.status === 419) {
        window.location.reload();
    }
});

createInertiaApp({
    title: (title) => title,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ErrorBoundary>
                <App {...props} />
            </ErrorBoundary>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();
