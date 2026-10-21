import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import AdminLayout from '../../Components/AdminLayout';

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
    images: ProductImage[];
    is_active: boolean;
};

type ProductImage = {
    id: number;
    image_path: string;
};

type Pagination<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

type ProductForm = {
    category_id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    stock: number;
    image_path: string;
    image: File | null;
    images: File[];
    is_active: boolean;
};

type PageProps = {
    products: Pagination<Product>;
    categories: CategoryOption[];
    filters: { search: string; status: string; category: number | null };
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
    image: null,
    images: [],
    is_active: true,
};

function ProductGalleryCarousel({ product }: { product: Product }) {
    const images = [
        ...(product.image_path ? [{ id: `main-${product.id}`, image_path: product.image_path }] : []),
        ...product.images,
    ];
    const [activeIndex, setActiveIndex] = useState(0);
    const activeImage = images[activeIndex];

    useEffect(() => {
        setActiveIndex(0);
    }, [images.length]);

    if (!activeImage) {
        return <span className="text-secondary">Fără imagini</span>;
    }

    return (
        <div className="d-flex align-items-center gap-2" aria-label={`Galerie imagini ${product.name}`}>
            <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                aria-label={`Imaginea anterioară pentru ${product.name}`}
                disabled={images.length < 2}
                onClick={() => setActiveIndex((index) => (index - 1 + images.length) % images.length)}
            >
                ‹
            </button>
            <div className="text-center">
                <img
                    src={imageUrl(activeImage.image_path)}
                    alt={`${product.name} — imagine ${activeIndex + 1} din ${images.length}`}
                    className="rounded object-fit-cover"
                    width="56"
                    height="56"
                />
                <div className="small text-secondary">{activeIndex + 1}/{images.length}</div>
            </div>
            <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                aria-label={`Imaginea următoare pentru ${product.name}`}
                disabled={images.length < 2}
                onClick={() => setActiveIndex((index) => (index + 1) % images.length)}
            >
                ›
            </button>
        </div>
    );
}

function imageUrl(path: string): string {
    return /^https?:\/\//i.test(path) || path.startsWith('/') ? path : `/storage/${path}`;
}

export default function AdminProducts({ products, categories }: PageProps) {
    const form = useForm<ProductForm>(emptyForm);
    const { flash, filters } = usePage<PageProps>().props;
    const [editingId, setEditingId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [category, setCategory] = useState(filters.category?.toString() ?? '');
    const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
    const [selectedGalleryPreviews, setSelectedGalleryPreviews] = useState<string[]>([]);

    useEffect(() => {
        setSearch(filters.search);
        setStatus(filters.status);
        setCategory(filters.category?.toString() ?? '');
    }, [filters.search, filters.status, filters.category]);

    useEffect(() => {
        if (!form.data.image) {
            setSelectedImagePreview(null);

            return;
        }

        const previewUrl = URL.createObjectURL(form.data.image);
        setSelectedImagePreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [form.data.image]);

    useEffect(() => {
        const previewUrls = form.data.images.map((image) => URL.createObjectURL(image));
        setSelectedGalleryPreviews(previewUrls);

        return () => previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    }, [form.data.images]);

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
            image: null,
            images: [],
            is_active: product.is_active,
        });
        form.clearErrors();
    }

    function cancelEdit() {
        setEditingId(null);
        form.reset();
        form.clearErrors();
        form.transform((data) => data);
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                form.transform((data) => data);
                setEditingId(null);
                form.reset();
            },
        };

        if (editingId) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/products/${editingId}`, { ...options, forceFormData: true });
        } else {
            form.post('/admin/products', { ...options, forceFormData: true });
        }
    }

    function filter(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/admin/products', {
            search,
            status,
            category,
        }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Produse" />
            <AdminLayout title="Produse">
                    {flash.status && <div className="alert alert-success mb-0" role="status">{flash.status}</div>}

                    <form onSubmit={filter} className="admin-panel row g-3 align-items-end p-3 p-lg-4">
                        <label className="col-12 col-lg form-label mb-0">
                            Caută produs
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="form-control mt-1"
                                placeholder="Nume, slug sau categorie"
                            />
                        </label>
                        <label className="col-12 col-sm form-label mb-0">
                            Categorie
                            <select value={category} onChange={(event) => setCategory(event.target.value)} className="form-select mt-1">
                                <option value="">Toate</option>
                                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                        </label>
                        <label className="col-12 col-sm form-label mb-0">
                            Stare
                            <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-select mt-1">
                                <option value="all">Toate</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </label>
                        <div className="col-12 col-lg-auto d-flex gap-2">
                            <button className="btn btn-primary">Filtrează</button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('all');
                                    setCategory('');
                                    router.get('/admin/products', { search: '', status: 'all', category: '' }, { preserveState: true, replace: true });
                                }}
                                className="btn btn-outline-secondary"
                            >
                                Resetează
                            </button>
                        </div>
                    </form>

                    <form onSubmit={submit} className="admin-panel p-3 p-lg-4">
                        <h2 className="h5 mb-3">{editingId ? 'Editează produsul' : 'Adaugă un produs'}</h2>
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
                                <span className="form-text">Lasă câmpul gol pentru generare automată din numele produsului.</span>
                                {form.errors.slug && <span className="invalid-feedback d-block">{form.errors.slug}</span>}
                            </label>
                            <label className="col-12 col-md-6 form-label">
                                Categorie
                                <select
                                    value={form.data.category_id}
                                    onChange={(event) => form.setData('category_id', Number(event.target.value))}
                                    className={`form-select${form.errors.category_id ? ' is-invalid' : ''}`}
                                    required
                                >
                                    <option value={0} disabled>Alege categoria</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                                {form.errors.category_id && <span className="invalid-feedback d-block">{form.errors.category_id}</span>}
                            </label>
                            <label className="col-12 col-md-6 form-label">
                                Preț (RON)
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.data.price}
                                    onChange={(event) => form.setData('price', event.target.value)}
                                    className={`form-control${form.errors.price ? ' is-invalid' : ''}`}
                                    required
                                />
                                {form.errors.price && <span className="invalid-feedback d-block">{form.errors.price}</span>}
                            </label>
                            <label className="col-12 col-md-6 form-label">
                                Stoc
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.data.stock}
                                    onChange={(event) => form.setData('stock', Number(event.target.value))}
                                    className={`form-control${form.errors.stock ? ' is-invalid' : ''}`}
                                    required
                                />
                                {form.errors.stock && <span className="invalid-feedback d-block">{form.errors.stock}</span>}
                            </label>
                            <label className="col-12 col-md-6 form-label">
                                Imagine principală (JPG, PNG sau WebP; maximum 5 MB)
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(event) => form.setData('image', event.target.files?.[0] ?? null)}
                                    className={`form-control${form.errors.image ? ' is-invalid' : ''}`}
                                />
                                {form.errors.image && <span className="invalid-feedback d-block">{form.errors.image}</span>}
                                {(selectedImagePreview || form.data.image_path) && (
                                    <img
                                        src={selectedImagePreview ?? imageUrl(form.data.image_path)}
                                        alt={`Previzualizare ${form.data.name || 'produs'}`}
                                        className="mt-2 rounded border object-fit-cover"
                                        width="120"
                                        height="120"
                                    />
                                )}
                                {!selectedImagePreview && !form.data.image_path && (
                                    <span className="form-text d-block">Imaginea principală apare prima în galeria produsului.</span>
                                )}
                            </label>
                            <label className="col-12 form-label">
                                Imagini pentru carusel (până la 10 imagini, maximum 5 MB fiecare)
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={(event) => form.setData('images', Array.from(event.target.files ?? []))}
                                    className={`form-control${form.errors.images || form.errors['images.0'] ? ' is-invalid' : ''}`}
                                />
                                {form.errors.images && <span className="invalid-feedback d-block">{form.errors.images}</span>}
                                {form.errors['images.0'] && <span className="invalid-feedback d-block">{form.errors['images.0']}</span>}
                                {selectedGalleryPreviews.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                        {selectedGalleryPreviews.map((preview, index) => (
                                            <img
                                                key={preview}
                                                src={preview}
                                                alt={`Previzualizare imagine carusel ${index + 1}`}
                                                className="rounded border object-fit-cover"
                                                width="88"
                                                height="88"
                                            />
                                        ))}
                                    </div>
                                )}
                                {editingId && (products.data.find((product) => product.id === editingId)?.images.length ?? 0) > 0 && (
                                    <div className="mt-3">
                                        <span className="form-text d-block mb-2">Imagini deja salvate:</span>
                                        <div className="d-flex flex-wrap gap-2">
                                            {products.data.find((product) => product.id === editingId)?.images.map((image) => (
                                                <div key={image.id} className="position-relative">
                                                    <img
                                                        src={imageUrl(image.image_path)}
                                                        alt={`Imagine existentă pentru ${form.data.name}`}
                                                        className="rounded border object-fit-cover"
                                                        width="88"
                                                        height="88"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle"
                                                        aria-label="Șterge imaginea din carusel"
                                                        onClick={() => {
                                                            if (window.confirm('Ștergi această imagine din carusel?')) {
                                                                router.delete(`/admin/products/${editingId}/images/${image.id}`);
                                                            }
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <span className="form-text d-block">Imaginile încărcate se adaugă la carusel; imaginea principală rămâne separată.</span>
                            </label>
                            <label className="col-12 col-md-6 form-label">
                                URL sau cale imagine (opțional)
                                <input
                                    value={form.data.image_path}
                                    onChange={(event) => form.setData('image_path', event.target.value)}
                                    className={`form-control${form.errors.image_path ? ' is-invalid' : ''}`}
                                />
                                {form.errors.image_path && <span className="invalid-feedback d-block">{form.errors.image_path}</span>}
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
                            <span className="form-check-label">Activ</span>
                        </label>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <button disabled={form.processing || categories.length === 0} className="btn btn-primary">
                                {editingId ? 'Salvează modificările' : 'Creează produsul'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="btn btn-outline-secondary">
                                    Anulează
                                </button>
                            )}
                            {categories.length === 0 && <p className="mb-0 text-warning-emphasis">Creează mai întâi o categorie.</p>}
                        </div>
                    </form>

                    <section className="admin-panel overflow-hidden">
                        <p className="px-3 pt-3 small text-secondary">{products.total} produse găsite</p>
                        <div className="overflow-x-auto">
                            <table className="table table-hover align-middle admin-table mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Carusel imagini</th>
                                        <th>Produs</th>
                                        <th>Categorie</th>
                                        <th>Preț</th>
                                        <th>Stoc</th>
                                        <th>Stare</th>
                                        <th>Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.map((product) => (
                                        <tr key={product.id}>
                                            <td><ProductGalleryCarousel product={product} /></td>
                                            <td>
                                                <div className="fw-semibold">{product.name}</div>
                                                <div className="small text-secondary">{product.slug}</div>
                                            </td>
                                            <td>{product.category.name}</td>
                                            <td>{Number(product.price).toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}</td>
                                            <td>{product.stock}</td>
                                            <td><span className={`badge rounded-pill ${product.is_active ? 'text-bg-success' : 'text-bg-secondary'}`}>{product.is_active ? 'Activ' : 'Inactiv'}</span></td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button type="button" onClick={() => edit(product)} className="btn btn-sm btn-outline-primary">Editează</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm(`Ștergi produsul „${product.name}”?`)) {
                                                                router.delete(`/admin/products/${product.id}`);
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
                                    {products.data.length === 0 && (
                                        <tr><td colSpan={7} className="admin-empty">Nu există produse.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <nav className="d-flex flex-wrap gap-2 border-top p-3" aria-label="Paginare produse">
                            {products.links.map((link, index) => (
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
