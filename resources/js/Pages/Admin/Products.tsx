import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type CategoryOption = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    category_id: number;
    category: CategoryOption;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    stock: number;
    image_path: string | null;
    is_active: boolean;
};

type Pagination<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type ProductForm = {
    category_id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    stock: number;
    image_path: string;
    is_active: boolean;
};

type PageProps = {
    products: Pagination<Product>;
    categories: CategoryOption[];
    flash: { status?: string };
};

const emptyForm: ProductForm = {
    category_id: 0,
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: 0,
    image_path: '',
    is_active: true,
};

export default function AdminProducts({ products, categories }: PageProps) {
    const form = useForm<ProductForm>(emptyForm);
    const { flash } = usePage<PageProps>().props;
    const [editingId, setEditingId] = useState<number | null>(null);

    function edit(product: Product) {
        setEditingId(product.id);
        form.setData({
            category_id: product.category_id,
            name: product.name,
            slug: product.slug,
            description: product.description ?? '',
            price: product.price,
            stock: product.stock,
            image_path: product.image_path ?? '',
            is_active: product.is_active,
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
            form.put(`/admin/products/${editingId}`, options);
        } else {
            form.post('/admin/products', options);
        }
    }

    return (
        <>
            <Head title="Produse" />
            <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
                <section className="mx-auto max-w-6xl space-y-6">
                    <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-6 shadow-sm">
                        <div>
                            <Link href="/admin" className="text-sm font-medium text-indigo-600">← Panou administrare</Link>
                            <h1 className="mt-2 text-2xl font-semibold">Produse</h1>
                        </div>
                        <Link href="/admin/categories" className="text-sm font-medium text-indigo-600">Administrare categorii</Link>
                    </header>

                    {flash.status && <p className="rounded-lg bg-green-100 p-3 text-sm text-green-800">{flash.status}</p>}

                    <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">{editingId ? 'Editează produsul' : 'Adaugă un produs'}</h2>
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
                            <label className="block text-sm font-medium">
                                Categorie
                                <select
                                    value={form.data.category_id}
                                    onChange={(event) => form.setData('category_id', Number(event.target.value))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                >
                                    <option value={0} disabled>Alege categoria</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                                {form.errors.category_id && <span className="mt-1 block text-red-700">{form.errors.category_id}</span>}
                            </label>
                            <label className="block text-sm font-medium">
                                Preț (RON)
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.data.price}
                                    onChange={(event) => form.setData('price', event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                />
                                {form.errors.price && <span className="mt-1 block text-red-700">{form.errors.price}</span>}
                            </label>
                            <label className="block text-sm font-medium">
                                Stoc
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.data.stock}
                                    onChange={(event) => form.setData('stock', Number(event.target.value))}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                />
                                {form.errors.stock && <span className="mt-1 block text-red-700">{form.errors.stock}</span>}
                            </label>
                            <label className="block text-sm font-medium">
                                Cale imagine (opțional)
                                <input
                                    value={form.data.image_path}
                                    onChange={(event) => form.setData('image_path', event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                                {form.errors.image_path && <span className="mt-1 block text-red-700">{form.errors.image_path}</span>}
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
                            Activ
                        </label>
                        <div className="flex gap-3">
                            <button disabled={form.processing || categories.length === 0} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                                {editingId ? 'Salvează modificările' : 'Creează produsul'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
                                    Anulează
                                </button>
                            )}
                            {categories.length === 0 && <p className="self-center text-sm text-amber-700">Creează mai întâi o categorie.</p>}
                        </div>
                    </form>

                    <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3">Produs</th>
                                        <th className="px-4 py-3">Categorie</th>
                                        <th className="px-4 py-3">Preț</th>
                                        <th className="px-4 py-3">Stoc</th>
                                        <th className="px-4 py-3">Stare</th>
                                        <th className="px-4 py-3">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.data.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-gray-500">{product.slug}</div>
                                            </td>
                                            <td className="px-4 py-3">{product.category.name}</td>
                                            <td className="px-4 py-3">{Number(product.price).toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}</td>
                                            <td className="px-4 py-3">{product.stock}</td>
                                            <td className="px-4 py-3">{product.is_active ? 'Activ' : 'Inactiv'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-3">
                                                    <button type="button" onClick={() => edit(product)} className="font-medium text-indigo-600">Editează</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm(`Ștergi produsul „${product.name}”?`)) {
                                                                router.delete(`/admin/products/${product.id}`);
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
                                    {products.data.length === 0 && (
                                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Nu există produse.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <nav className="flex flex-wrap gap-2 border-t border-gray-100 p-4" aria-label="Paginare produse">
                            {products.links.map((link, index) => (
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
