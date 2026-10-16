import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '../../Components/AuthLayout';
import FormField from '../../Components/FormField';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/register', { onFinish: () => reset('password', 'password_confirmation') });
    }

    return (
        <>
            <Head title="Creare cont" />
            <AuthLayout
                title="Creează un cont"
                footer={
                    <>
                        Ai deja cont? <Link href="/login" className="font-medium text-indigo-600">Autentifică-te</Link>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-4">
                    <FormField
                        id="name"
                        label="Nume"
                        autoComplete="name"
                        value={data.name}
                        error={errors.name}
                        onChange={(name) => setData('name', name)}
                    />
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
                        label="Parolă (minimum 12 caractere, litere mari/mici și cifre)"
                        type="password"
                        autoComplete="new-password"
                        value={data.password}
                        error={errors.password}
                        onChange={(password) => setData('password', password)}
                    />
                    <FormField
                        id="password_confirmation"
                        label="Confirmă parola"
                        type="password"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        error={errors.password_confirmation}
                        onChange={(password) => setData('password_confirmation', password)}
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                        {processing ? 'Se creează contul...' : 'Creează cont'}
                    </button>
                </form>
            </AuthLayout>
        </>
    );
}
