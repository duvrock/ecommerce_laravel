import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    products_count: number;
};

type Pagination<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type CategoryForm = {
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
};

type PageProps = {
    categories: Pagination<Category>;
    flash: { status?: string };
    errors: Record<string, string>;
};

const emptyForm: CategoryForm = {
    name: '',
    slug: '',
    description: '',
    is_active: true,
};

export default function AdminCategories({ categories }: PageProps) {
    const form = useForm<CategoryForm>(emptyForm);
    const { flash, errors } = usePage<PageProps>().props;
    const [editingId, setEditingId] = useState<number | null>(null);

    function edit(category: Category) {
        setEditingId(category.id);
        form.setData({
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
            is_active: category.is_active,
        });
        form.clearErrors();
    }

    function cancelEdit() {
        setEditingId(null);
        form.reset();
        form.clearErrors();
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                setEditingId(null);
                form.reset();
            },
        };

        if (editingId) {
            form.put(`/admin/categories/${editingId}`, options);
        } else {
            form.post('/admin/categories', options);
        }
    }

    return (
        <>
            <Head title="Categorii" />
            <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
                <section className="mx-auto max-w-5xl space-y-6">
                    <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-6 shadow-sm">
                        <div>
                            <Link href="/admin" className="text-sm font-medium text-indigo-600">← Panou administrare</Link>
                            <h1 className="mt-2 text-2xl font-semibold">Categorii</h1>
                        </div>
                        <Link href="/admin/products" className="text-sm font-medium text-indigo-600">Administrare produse</Link>
                    </header>

                    {flash.status && <p className="rounded-lg bg-green-100 p-3 text-sm text-green-800">{flash.status}</p>}
                    {errors.category && <p className="rounded-lg bg-red-100 p-3 text-sm text-red-800">{errors.category}</p>}

                    <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">{editingId ? 'Editează categoria' : 'Adaugă o categorie'}</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="block text-sm font-medium">
                                Nume
                                <input
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                />
                                {form.errors.name && <span className="mt-1 block text-red-700">{form.errors.name}</span>}
                            </label>
                            <label className="block text-sm font-medium">
                                Slug
                                <input
                                    value={form.data.slug}
                                    onChange={(event) => form.setData('slug', event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                />
                                {form.errors.slug && <span className="mt-1 block text-red-700">{form.errors.slug}</span>}
                            </label>
                        </div>
                        <label className="block text-sm font-medium">
                            Descriere
                            <textarea
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                rows={3}
                            />
                            {form.errors.description && <span className="mt-1 block text-red-700">{form.errors.description}</span>}
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                            />
                            Activă
                        </label>
                        <div className="flex gap-3">
                            <button disabled={form.processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                                {editingId ? 'Salvează modificările' : 'Creează categoria'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
                                    Anulează
                                </button>
                            )}
                        </div>
                    </form>

                    <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3">Categorie</th>
                                        <th className="px-4 py-3">Produse</th>
                                        <th className="px-4 py-3">Stare</th>
                                        <th className="px-4 py-3">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {categories.data.map((category) => (
                                        <tr key={category.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{category.name}</div>
                                                <div className="text-gray-500">{category.slug}</div>
                                            </td>
                                            <td className="px-4 py-3">{category.products_count}</td>
                                            <td className="px-4 py-3">{category.is_active ? 'Activă' : 'Inactivă'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-3">
                                                    <button type="button" onClick={() => edit(category)} className="font-medium text-indigo-600">Editează</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm(`Ștergi categoria „${category.name}”?`)) {
                                                                router.delete(`/admin/categories/${category.id}`);
                                                            }
                                                        }}
                                                        className="font-medium text-red-600"
                                                    >
                                                        Șterge
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.data.length === 0 && (
                                        <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Nu există categorii.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <nav className="flex flex-wrap gap-2 border-t border-gray-100 p-4" aria-label="Paginare categorii">
                            {categories.links.map((link, index) => (
                                <Link
                                    key={`${index}-${link.label}`}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    className={`rounded border px-3 py-1 text-sm ${link.active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                >
                                    {link.label.replace('&laquo; Previous', '← Anterior').replace('Next &raquo;', 'Următoarea →')}
                                </Link>
                            ))}
                        </nav>
                    </section>
                </section>
            </main>
        </>
    );
}
