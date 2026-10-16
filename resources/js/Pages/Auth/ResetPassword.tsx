import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '../../Components/AuthLayout';
import FormField from '../../Components/FormField';

type ResetPasswordProps = {
    email: string;
    token: string;
};

export default function ResetPassword({ email, token }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    }

    return (
        <>
            <Head title="Alege o parolă nouă" />
            <AuthLayout
                title="Alege o parolă nouă"
                footer={<Link href="/login" className="font-medium text-indigo-600">Înapoi la autentificare</Link>}
            >
                <form onSubmit={submit} className="space-y-4">
                    <FormField
                        id="email"
                        label="Adresă de email"
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        error={errors.email}
                        onChange={(value) => setData('email', value)}
                    />
                    <FormField
                        id="password"
                        label="Parolă nouă (minimum 12 caractere, litere mari/mici și cifre)"
                        type="password"
                        autoComplete="new-password"
                        value={data.password}
                        error={errors.password}
                        onChange={(value) => setData('password', value)}
                    />
                    <FormField
                        id="password_confirmation"
                        label="Confirmă parola"
                        type="password"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        error={errors.password_confirmation}
                        onChange={(value) => setData('password_confirmation', value)}
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                        Salvează parola nouă
                    </button>
                </form>
            </AuthLayout>
        </>
    );
}
