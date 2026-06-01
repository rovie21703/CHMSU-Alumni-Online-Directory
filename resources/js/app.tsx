import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { type Config, route as routeFn } from 'ziggy-js';
import { ErrorBoundary } from './components/error-boundary';
import { initializeTheme } from './hooks/use-appearance';
import { bindRouteGlobal, configureZiggy } from './lib/ziggy';

declare global {
    // eslint-disable-next-line no-var
    var route: typeof routeFn;
    // eslint-disable-next-line no-var
    var Ziggy: Config;
}

bindRouteGlobal();

function syncZiggyFromPageProps(props: Record<string, unknown>): void {
    if (props.ziggy && typeof props.ziggy === 'object') {
        configureZiggy(props.ziggy as Config);
    }
}

router.on('error', () => {
    console.error('A network or server error occurred while loading the page.');
});

router.on('invalid', (event) => {
    if (event.detail.response.status === 419) {
        window.location.reload();
    }
});

router.on('navigate', (event) => {
    syncZiggyFromPageProps(event.detail.page.props);
});

createInertiaApp({
    title: (title) => title,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        syncZiggyFromPageProps(props.initialPage.props);

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
