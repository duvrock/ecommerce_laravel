import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

type AuthLayoutProps = {
    title: string;
    children: ReactNode;
    footer: ReactNode;
};

export default function AuthLayout({ title, children, footer }: AuthLayoutProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 text-gray-900">
            <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
                <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Magazin online
                </Link>
                <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
                <div className="mt-6">{children}</div>
                <div className="mt-6 border-t border-gray-200 pt-5 text-sm text-gray-600">
                    {footer}
                </div>
            </section>
        </main>
    );
}
