import { Head, Link, router } from '@inertiajs/react';
import StorefrontFooter from '../../Components/StorefrontFooter';
import StorefrontHeader from '../../Components/StorefrontHeader';

type Category = { id: number; name: string; slug: string; products_count: number };
type CartItem = {
    id: number;
    slug: string | null;
    name: string;
    image_path: string | null;
    price: string;
    stock: number;
    quantity: number;
    subtotal: string;
    available: boolean;
};

type CartPageProps = {
    appName: string;
    auth: { user: { name: string } | null };
    categories: Category[];
    cart: { items: CartItem[]; count: number; total: string; available: boolean };
};

function imageUrl(path: string): string {
    return /^https?:\/\//i.test(path) || path.startsWith('/') ? path : `/storage/${path}`;
}

function money(value: string): string {
    return Number(value).toLocaleString('ro-RO', { style: 'currency', currency: 'RON' });
}

export default function CartPage({ appName, auth, categories, cart }: CartPageProps) {
    return (
        <>
            <Head title="Coșul de cumpărături" />
            <div className="shop-page">
                <StorefrontHeader appName={appName} user={auth.user} search="" categories={categories} selectedCategory={null} />
                <main className="shop-container shop-main">
                    <div className="shop-breadcrumb"><Link href="/">Acasă</Link><span>/</span><span>Coșul de cumpărături</span></div>
                    <h1 className="shop-page-title">Coșul de cumpărături</h1>

                    {cart.items.length === 0 ? (
                        <section className="shop-empty-state">
                            <h2>Coșul tău este gol</h2>
                            <p>Adaugă produse din catalog pentru a continua.</p>
                            <Link href="/" className="shop-product-button">Vezi produsele</Link>
                        </section>
                    ) : (
                        <div className="shop-cart-layout">
                            <section className="shop-cart-items" aria-label="Produse în coș">
                                {cart.items.map((item) => (
                                    <article className={`shop-cart-item${item.available ? '' : ' is-unavailable'}`} key={item.id}>
                                        <div className="shop-cart-item-image">
                                            {item.image_path ? (
                                                <img src={imageUrl(item.image_path)} alt={item.name} />
                                            ) : (
                                                <div className="shop-cart-placeholder">{item.name.slice(0, 1)}</div>
                                            )}
                                        </div>
                                        <div className="shop-cart-item-info">
                                            <h2>{item.slug ? <Link href={`/produse/${item.slug}`}>{item.name}</Link> : item.name}</h2>
                                            <p>{item.available ? 'Disponibil în stoc' : 'Produs indisponibil sau stoc insuficient'}</p>
                                            <div className="shop-cart-item-unit-price">
                                                <span>Preț / buc.</span>
                                                <strong>{money(item.price)}</strong>
                                            </div>
                                        </div>
                                        <div className="shop-cart-item-quantity">
                                            {item.available ? (
                                                <div className="shop-quantity-control" aria-label={`Cantitate pentru ${item.name}`}>
                                                    <button
                                                        type="button"
                                                        aria-label="Scade cantitatea"
                                                        disabled={item.quantity <= 1}
                                                        onClick={() => router.patch(`/cos/${item.id}`, { quantity: item.quantity - 1 }, { preserveScroll: true })}
                                                    >−</button>
                                                    <span>{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        aria-label="Crește cantitatea"
                                                        disabled={item.quantity >= Math.min(item.stock, 99)}
                                                        onClick={() => router.patch(`/cos/${item.id}`, { quantity: item.quantity + 1 }, { preserveScroll: true })}
                                                    >+</button>
                                                </div>
                                            ) : (
                                                <span className="shop-cart-quantity">Cantitate: {item.quantity}</span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="shop-remove-item"
                                            aria-label={`Elimină ${item.name} din coș`}
                                            title="Elimină din coș"
                                            onClick={() => router.delete(`/cos/${item.id}`, { preserveScroll: true })}
                                        >
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                                            </svg>
                                        </button>
                                        <div className="shop-cart-subtotal">
                                            <span>Sumă</span>
                                            <strong>{money(item.subtotal)}</strong>
                                        </div>
                                    </article>
                                ))}
                            </section>

                            <aside className="shop-cart-summary">
                                <h2>Sumar comandă</h2>
                                <div><span>Produse ({cart.count})</span><strong>{money(cart.total)}</strong></div>
                                <p>Costul livrării va fi confirmat înainte de expediere.</p>
                                <Link
                                    href="/finalizare-comanda"
                                    className={`shop-product-button${cart.available ? '' : ' is-disabled'}`}
                                    aria-disabled={!cart.available}
                                    onClick={(event) => {
                                        if (!cart.available) event.preventDefault();
                                    }}
                                >
                                    Continuă la checkout
                                </Link>
                                <Link href="/" className="shop-continue-shopping">Continuă cumpărăturile</Link>
                            </aside>
                        </div>
                    )}
                </main>
                <StorefrontFooter appName={appName} />
            </div>
        </>
    );
}
