import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import StorefrontFooter from '../Components/StorefrontFooter';
import StorefrontHeader from '../Components/StorefrontHeader';

type Category = {
    id: number;
    name: string;
    slug: string;
    products_count: number;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    stock: number;
    image_path: string | null;
    category: Category;
};

type Pagination<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number | null;
    to: number | null;
};

type Filters = {
    search: string;
    category: number | null;
    min_price: string;
    max_price: string;
    availability: string;
    sort: string;
};

type WelcomeProps = {
    appName: string;
    auth: { user: { name: string } | null };
    categories: Category[];
    products: Pagination<Product>;
    filters: Filters;
};

function imageUrl(path: string): string {
    return /^https?:\/\//i.test(path) || path.startsWith('/') ? path : `/storage/${path}`;
}

function ProductCard({ product }: { product: Product }) {
    return (
        <article className="shop-product-card">
            <div className="shop-product-media">
                {product.image_path ? (
                    <img src={imageUrl(product.image_path)} alt={product.name} loading="lazy" />
                ) : (
                    <div className="shop-image-placeholder" aria-label="Produs fără imagine">
                        <span>{product.name.slice(0, 1).toUpperCase()}</span>
                        <small>Imagine în curând</small>
                    </div>
                )}
            </div>

            <div className="shop-product-info">
                <Link href={`/?category=${product.category.id}#produse`} className="shop-product-category">
                    {product.category.name}
                </Link>
                <h3><Link href={`/produse/${product.slug}`}>{product.name}</Link></h3>
                {product.description && (
                    <p className="shop-product-description">
                        {product.description}
                    </p>
                )}
                <div className="shop-product-price">
                    {Number(product.price).toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
                </div>
                <div className={`shop-stock${product.stock > 0 ? '' : ' is-out'}`}>
                    <span aria-hidden="true" />
                    {product.stock > 0 ? 'Disponibil în stoc' : 'Stoc epuizat'}
                </div>
                <div className="shop-product-actions">
                    <Link href={`/produse/${product.slug}`} className="shop-product-button">Afișare produs</Link>
                    <button
                        type="button"
                        className="shop-product-button shop-cart-button"
                        aria-label={`Adaugă ${product.name} în coș (disponibil în curând)`}
                        title="Coșul de cumpărături va fi disponibil în curând"
                        disabled
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
                            <circle cx="10" cy="20" r="1" />
                            <circle cx="18" cy="20" r="1" />
                        </svg>
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function Welcome({ appName, auth, categories, products, filters }: WelcomeProps) {
    const [formFilters, setFormFilters] = useState(filters);

    useEffect(() => {
        setFormFilters(filters);
    }, [filters]);

    function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
        setFormFilters((current) => ({ ...current, [key]: value }));
    }

    function submitFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/', formFilters, { preserveState: true, replace: true, preserveScroll: true });
    }

    function clearFilters() {
        const cleared: Filters = {
            search: '',
            category: null,
            min_price: '',
            max_price: '',
            availability: 'all',
            sort: 'relevant',
        };
        setFormFilters(cleared);
        router.get('/', cleared, { preserveState: true, replace: true, preserveScroll: true });
    }

    const selectedCategory = categories.find((category) => category.id === filters.category);

    return (
        <>
            <Head title={selectedCategory?.name ?? 'Produse'} />
            <div className="shop-page">
                <StorefrontHeader
                    appName={appName}
                    user={auth.user}
                    search={filters.search}
                    categories={categories}
                    selectedCategory={filters.category}
                />

                <main id="produse" className="shop-container shop-main">
                    <div className="shop-breadcrumb">
                        <Link href="/">Acasă</Link>
                        <span aria-hidden="true">/</span>
                        <span>{selectedCategory?.name ?? 'Catalog produse'}</span>
                    </div>

                    <section className="shop-intro">
                        <div>
                            <p className="shop-eyebrow">Selecția magazinului</p>
                            <h1>{selectedCategory?.name ?? 'Produse pentru proiectele tale'}</h1>
                            <p className="shop-intro-copy">
                                Explorează catalogul, compară produsele și găsește echipamentul potrivit pentru următoarea ta lucrare.
                            </p>
                        </div>
                        <div className="shop-results-summary">
                            <strong>{products.total}</strong>
                            <span>{products.total === 1 ? 'produs disponibil' : 'produse disponibile'}</span>
                        </div>
                    </section>

                    {categories.length > 0 && (
                        <nav className="shop-category-chips" aria-label="Categorii disponibile">
                            <Link href="/#produse" className={!filters.category ? 'is-active' : ''}>Toate produsele</Link>
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/?category=${category.id}#produse`}
                                    className={filters.category === category.id ? 'is-active' : ''}
                                >
                                    {category.name} <span>{category.products_count}</span>
                                </Link>
                            ))}
                        </nav>
                    )}

                    <div className="shop-catalog-layout">
                        <aside className="shop-filter-panel">
                            <form onSubmit={submitFilters}>
                                <div className="shop-filter-heading">
                                    <h2>Filtrează produsele</h2>
                                    <button type="button" onClick={clearFilters}>Resetează</button>
                                </div>

                                <fieldset className="shop-filter-group">
                                    <legend>Categorie</legend>
                                    <label className="shop-check-option">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={!formFilters.category}
                                            onChange={() => updateFilter('category', null)}
                                        />
                                        <span>Toate categoriile</span>
                                    </label>
                                    {categories.map((category) => (
                                        <label key={category.id} className="shop-check-option">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={formFilters.category === category.id}
                                                onChange={() => updateFilter('category', category.id)}
                                            />
                                            <span>{category.name}</span>
                                            <small>{category.products_count}</small>
                                        </label>
                                    ))}
                                </fieldset>

                                <fieldset className="shop-filter-group">
                                    <legend>Disponibilitate</legend>
                                    <label className="shop-check-option">
                                        <input
                                            type="checkbox"
                                            checked={formFilters.availability === 'in_stock'}
                                            onChange={(event) => updateFilter('availability', event.target.checked ? 'in_stock' : 'all')}
                                        />
                                        <span>Doar produse în stoc</span>
                                    </label>
                                </fieldset>

                                <fieldset className="shop-filter-group">
                                    <legend>Preț (RON)</legend>
                                    <div className="shop-price-inputs">
                                        <label>
                                            <span className="sr-only">Preț minim</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="Min."
                                                value={formFilters.min_price}
                                                onChange={(event) => updateFilter('min_price', event.target.value)}
                                            />
                                        </label>
                                        <span aria-hidden="true">—</span>
                                        <label>
                                            <span className="sr-only">Preț maxim</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="Max."
                                                value={formFilters.max_price}
                                                onChange={(event) => updateFilter('max_price', event.target.value)}
                                            />
                                        </label>
                                    </div>
                                </fieldset>

                                <button type="submit" className="shop-filter-submit">Aplică filtrele</button>
                            </form>
                        </aside>

                        <section className="shop-results" aria-label="Lista de produse">
                            <div className="shop-results-toolbar">
                                <p>
                                    {products.total > 0
                                        ? `Afișăm ${products.from}–${products.to} din ${products.total} produse`
                                        : 'Nu există produse pentru filtrele selectate'}
                                </p>
                                <label className="shop-sort">
                                    <span>Sortează:</span>
                                    <select
                                        value={formFilters.sort}
                                        onChange={(event) => {
                                            const nextFilters = { ...formFilters, sort: event.target.value };
                                            setFormFilters(nextFilters);
                                            router.get('/', nextFilters, { preserveState: true, replace: true, preserveScroll: true });
                                        }}
                                    >
                                        <option value="relevant">Relevante</option>
                                        <option value="newest">Cele mai noi</option>
                                        <option value="price_asc">Preț crescător</option>
                                        <option value="price_desc">Preț descrescător</option>
                                        <option value="name">Nume</option>
                                    </select>
                                </label>
                            </div>

                            {products.data.length > 0 ? (
                                <div className="shop-product-grid">
                                    {products.data.map((product) => <ProductCard key={product.id} product={product} />)}
                                </div>
                            ) : (
                                <div className="shop-empty-state">
                                    <span aria-hidden="true">⌕</span>
                                    <h2>Nu am găsit produse</h2>
                                    <p>Încearcă alți termeni de căutare sau resetează filtrele.</p>
                                    <button type="button" onClick={clearFilters}>Resetează filtrele</button>
                                </div>
                            )}

                            {products.links.length > 3 && (
                                <nav className="shop-pagination" aria-label="Paginare produse">
                                    {products.links.map((link, index) => (
                                        <Link
                                            key={`${index}-${link.label}`}
                                            href={link.url ?? '#produse'}
                                            preserveScroll
                                            aria-current={link.active ? 'page' : undefined}
                                            className={`${link.active ? 'is-active' : ''}${!link.url ? ' is-disabled' : ''}`}
                                        >
                                            {link.label.replace('&laquo; Previous', '←').replace('Next &raquo;', '→')}
                                        </Link>
                                    ))}
                                </nav>
                            )}
                        </section>
                    </div>
                </main>

                <StorefrontFooter appName={appName} />
            </div>
        </>
    );
}
