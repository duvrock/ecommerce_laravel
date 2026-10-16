import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '../../Components/AuthLayout';

type VerifyEmailProps = {
    status?: string;
};

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { post, processing } = useForm({});

    function resend(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/email/verification-notification');
    }

    return (
        <>
            <Head title="Verifică adresa de email" />
            <AuthLayout
                title="Verifică adresa de email"
                footer={
                    <form onSubmit={resend} className="flex items-center justify-between gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="font-medium text-indigo-600 disabled:opacity-50"
                        >
                            Retrimite emailul
                        </button>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Deconectare
                        </Link>
                    </form>
                }
            >
                <p className="text-sm text-gray-600">
                    Ți-am trimis un link de verificare. Confirmă adresa înainte să accesezi contul.
                </p>
                {status === 'verification-link-sent' && (
                    <p className="mt-4 text-sm text-green-700">Un nou link de verificare a fost trimis.</p>
                )}
            </AuthLayout>
        </>
    );
}
