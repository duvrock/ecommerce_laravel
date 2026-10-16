import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

const pages = import.meta.glob<{ default: ComponentType }>(
    './Pages/**/*.tsx',
    { eager: true },
);

createInertiaApp({
    title: (title) => {
        const appName = import.meta.env.VITE_APP_NAME ?? 'Magazin online';

        return title ? `${title} - ${appName}` : appName;
    },
    resolve: (name) => {
        const page = pages[`./Pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Inertia page "${name}" was not found.`);
        }

        return page.default;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
