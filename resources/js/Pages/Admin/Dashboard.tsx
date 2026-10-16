import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard() {
    return (
        <>
            <Head title="Administrare" />
            <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
                <section className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
                    <header className="flex items-center justify-between gap-4">
                        <h1 className="text-2xl font-semibold">Panou de administrare</h1>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-sm font-medium text-indigo-600"
                        >
                            Deconectare
                        </Link>
                    </header>
                    <p className="mt-4 text-gray-600">
                        Accesul este protejat de autentificare, verificarea emailului și permisiunea serverului.
                    </p>
                </section>
            </main>
        </>
    );
}
