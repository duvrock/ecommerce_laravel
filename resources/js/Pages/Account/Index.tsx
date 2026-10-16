import { Head, Link, usePage } from '@inertiajs/react';

type AccountProps = {
    status?: string;
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
};

export default function AccountIndex({ status }: AccountProps) {
    const { auth } = usePage<AccountProps>().props;

    return (
        <>
            <Head title="Contul meu" />
            <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
                <section className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm">
                    <header className="flex items-center justify-between gap-4">
                        <h1 className="text-2xl font-semibold">Contul meu</h1>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-sm font-medium text-indigo-600"
                        >
                            Deconectare
                        </Link>
                    </header>
                    {status === 'email-verified' && (
                        <p className="mt-4 text-sm text-green-700">Adresa de email a fost verificată.</p>
                    )}
                    <dl className="mt-6 space-y-3 text-sm">
                        <div>
                            <dt className="font-medium text-gray-500">Nume</dt>
                            <dd>{auth.user.name}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">Email</dt>
                            <dd>{auth.user.email}</dd>
                        </div>
                    </dl>
                </section>
            </main>
        </>
    );
}
