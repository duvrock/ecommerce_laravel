import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import AdminLayout from '../../Components/AdminLayout';

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
    total: number;
};

type CategoryForm = {
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
};

type PageProps = {
    categories: Pagination<Category>;
    filters: { search: string; status: string };
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
    const { flash, errors, filters } = usePage<PageProps>().props;
    const [editingId, setEditingId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);

    useEffect(() => {
        setSearch(filters.search);
        setStatus(filters.status);
    }, [filters.search, filters.status]);

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

    function filter(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/admin/categories', { search, status }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Categorii" />
            <AdminLayout title="Categorii">
                    {flash.status && <div className="alert alert-success mb-0" role="status">{flash.status}</div>}
                    {errors.category && <div className="alert alert-danger mb-0" role="alert">{errors.category}</div>}

                    <form onSubmit={filter} className="admin-panel row g-3 align-items-end p-3 p-lg-4">
                        <label className="col-12 col-md form-label mb-0">
                            Caută categorie
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="form-control mt-1"
                                placeholder="Nume sau slug"
                            />
                        </label>
                        <label className="col-12 col-md-auto form-label mb-0">
                            Stare
                            <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-select mt-1">
                                <option value="all">Toate</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </label>
                        <div className="col-12 col-md-auto d-flex gap-2">
                            <button className="btn btn-primary">Filtrează</button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('all');
                                    router.get('/admin/categories', { search: '', status: 'all' }, { preserveState: true, replace: true });
                                }}
                                className="btn btn-outline-secondary"
                            >
                                Resetează
                            </button>
                        </div>
                    </form>

                    <form onSubmit={submit} className="admin-panel p-3 p-lg-4">
                        <h2 className="h5 mb-3">{editingId ? 'Editează categoria' : 'Adaugă o categorie'}</h2>
                        <div className="row g-3 mb-3">
                            <label className="col-12 col-md-6 form-label">
                                Nume
                                <input
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    className={`form-control${form.errors.name ? ' is-invalid' : ''}`}
                                    required
                                />
                                {form.errors.name && <span className="invalid-feedback d-block">{form.errors.name}</span>}
                            </label>
                            <label className="col-12 col-md-6 form-label">
                                Slug <span className="text-secondary fw-normal">(opțional)</span>
                                <input
                                    value={form.data.slug}
                                    onChange={(event) => form.setData('slug', event.target.value)}
                                    className={`form-control${form.errors.slug ? ' is-invalid' : ''}`}
                                    placeholder="Se generează automat din nume"
                                />
                                <span className="form-text">Lasă câmpul gol pentru generare automată din numele categoriei.</span>
                                {form.errors.slug && <span className="invalid-feedback d-block">{form.errors.slug}</span>}
                            </label>
                        </div>
                        <label className="form-label d-block mb-3">
                            Descriere
                            <textarea
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                                className={`form-control${form.errors.description ? ' is-invalid' : ''}`}
                                rows={3}
                            />
                            {form.errors.description && <span className="invalid-feedback d-block">{form.errors.description}</span>}
                        </label>
                        <label className="form-check form-switch mb-3">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                                className="form-check-input"
                            />
                            <span className="form-check-label">Activă</span>
                        </label>
                        <div className="d-flex gap-2">
                            <button disabled={form.processing} className="btn btn-primary">
                                {editingId ? 'Salvează modificările' : 'Creează categoria'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="btn btn-outline-secondary">
                                    Anulează
                                </button>
                            )}
                        </div>
                    </form>

                    <section className="admin-panel overflow-hidden">
                        <p className="px-3 pt-3 small text-secondary">{categories.total} categorii găsite</p>
                        <div className="overflow-x-auto">
                            <table className="table table-hover align-middle admin-table mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Categorie</th>
                                        <th>Produse</th>
                                        <th>Stare</th>
                                        <th>Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.data.map((category) => (
                                        <tr key={category.id}>
                                            <td>
                                                <div className="fw-semibold">{category.name}</div>
                                                <div className="small text-secondary">{category.slug}</div>
                                            </td>
                                            <td>{category.products_count}</td>
                                            <td><span className={`badge rounded-pill ${category.is_active ? 'text-bg-success' : 'text-bg-secondary'}`}>{category.is_active ? 'Activă' : 'Inactivă'}</span></td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button type="button" onClick={() => edit(category)} className="btn btn-sm btn-outline-primary">Editează</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm(`Ștergi categoria „${category.name}”?`)) {
                                                                router.delete(`/admin/categories/${category.id}`);
                                                            }
                                                        }}
                                                        className="btn btn-sm btn-outline-danger"
                                                    >
                                                        Șterge
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.data.length === 0 && (
                                        <tr><td colSpan={4} className="admin-empty">Nu există categorii.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <nav className="d-flex flex-wrap gap-2 border-top p-3" aria-label="Paginare categorii">
                            {categories.links.map((link, index) => (
                                <Link
                                    key={`${index}-${link.label}`}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    className={`btn btn-sm ${link.active ? 'btn-primary' : 'btn-outline-secondary'} ${!link.url ? 'disabled' : ''}`}
                                >
                                    {link.label.replace('&laquo; Previous', '← Anterior').replace('Next &raquo;', 'Următoarea →')}
                                </Link>
                            ))}
                        </nav>
                    </section>
            </AdminLayout>
        </>
    );
}
