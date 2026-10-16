import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '../../Components/AuthLayout';
import FormField from '../../Components/FormField';

type ForgotPasswordProps = {
    status?: string;
};

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/forgot-password');
    }

    return (
        <>
            <Head title="Resetare parolă" />
            <AuthLayout
                title="Ai uitat parola?"
                footer={<Link href="/login" className="font-medium text-indigo-600">Înapoi la autentificare</Link>}
            >
                <p className="mb-4 text-sm text-gray-600">
                    Introdu adresa de email și îți vom trimite un link pentru resetarea parolei.
                </p>
                {status && <p className="mb-4 text-sm text-green-700">{status}</p>}
                <form onSubmit={submit} className="space-y-4">
                    <FormField
                        id="email"
                        label="Adresă de email"
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        error={errors.email}
                        onChange={(email) => setData('email', email)}
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                        Trimite linkul de resetare
                    </button>
                </form>
            </AuthLayout>
        </>
    );
}
