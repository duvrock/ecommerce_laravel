import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type StorefrontHeaderProps = {
    appName: string;
    user: {
        name: string;
    } | null;
    search: string;
    categories: { id: number; name: string; products_count: number }[];
    selectedCategory: number | null;
};

export default function StorefrontHeader({
    appName,
    user,
    search,
    categories,
    selectedCategory,
}: StorefrontHeaderProps) {
    const [searchTerm, setSearchTerm] = useState(search);
    const [menuOpen, setMenuOpen] = useState(false);
    const brandName = appName === 'Laravel' ? 'Magazin online' : appName;

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/', { search: searchTerm }, { preserveState: true, replace: true });
    }

    return (
        <header className="shop-header">
            <div className="shop-contactbar">
                <p>Instrumente și soluții pentru proiectele tale. <a href="#produse">Descoperă catalogul</a></p>
            </div>
            <div className="shop-header-main shop-container">
                <Link href="/" className="shop-brand" aria-label={`${brandName} - pagina principală`}>
                    <span className="shop-brand-mark" aria-hidden="true">+</span>
                    <span className="shop-brand-name">
                        {brandName}
                        <small>magazin online</small>
                    </span>
                </Link>

                <form className="shop-search" role="search" onSubmit={submitSearch}>
                    <label className="sr-only" htmlFor="store-search">Caută produse</label>
                    <input
                        id="store-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Caută după produs, categorie..."
                    />
                    <button type="submit" aria-label="Caută">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
                    </button>
                </form>

                <div className="shop-header-actions">
                    {user ? (
                        <Link href="/account" className="shop-header-action">
                            <span className="shop-action-icon" aria-hidden="true">♙</span>
                            <span><strong>{user.name}</strong><small>Contul meu</small></span>
                        </Link>
                    ) : (
                        <Link href="/login" className="shop-header-action">
                            <span className="shop-action-icon" aria-hidden="true">♙</span>
                            <span><strong>Cont</strong><small>Autentificare</small></span>
                        </Link>
                    )}
                    <Link href="/register" className="shop-quick-order">Creează cont</Link>
                </div>

                <button
                    type="button"
                    className="shop-menu-toggle"
                    aria-label={menuOpen ? 'Închide meniul' : 'Deschide meniul'}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {menuOpen ? '×' : '☰'}
                </button>
            </div>

            <nav className={`shop-nav${menuOpen ? ' is-open' : ''}`} aria-label="Categorii de produse">
                <div className="shop-container shop-nav-inner">
                    <Link
                        href="/#produse"
                        className={!selectedCategory ? 'is-active' : ''}
                        onClick={() => setMenuOpen(false)}
                    >
                        Toate produsele
                    </Link>
                    {categories.slice(0, 7).map((category) => (
                        <Link
                            key={category.id}
                            href={`/?category=${category.id}#produse`}
                            className={selectedCategory === category.id ? 'is-active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            {category.name}
                        </Link>
                    ))}
                    <a className="shop-nav-highlight" href="#produse" onClick={() => setMenuOpen(false)}>Vezi catalogul</a>
                </div>
            </nav>
            <div className="shop-promo-strip">
                Catalogul este în continuă dezvoltare. <a href="#produse">Explorează produsele disponibile</a>
            </div>
        </header>
    );
}
