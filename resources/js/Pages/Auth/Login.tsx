import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '../../Components/AuthLayout';
import FormField from '../../Components/FormField';

type LoginProps = {
    status?: string;
};

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    }

    return (
        <>
            <Head title="Autentificare" />
            <AuthLayout
                title="Autentificare"
                footer={
                    <>
                        Nu ai cont? <Link href="/register" className="font-medium text-indigo-600">Creează unul</Link>
                    </>
                }
            >
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
                    <FormField
                        id="password"
                        label="Parolă"
                        type="password"
                        autoComplete="current-password"
                        value={data.password}
                        error={errors.password}
                        onChange={(password) => setData('password', password)}
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(event) => setData('remember', event.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Ține-mă minte
                    </label>
                    <div className="flex items-center justify-between">
                        <Link href="/forgot-password" className="text-sm font-medium text-indigo-600">
                            Ai uitat parola?
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Se autentifică...' : 'Autentificare'}
                        </button>
                    </div>
                </form>
            </AuthLayout>
        </>
    );
}
