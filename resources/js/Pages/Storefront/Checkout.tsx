import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import StorefrontFooter from '../../Components/StorefrontFooter';
import StorefrontHeader from '../../Components/StorefrontHeader';

type Category = { id: number; name: string; slug: string; products_count: number };
type CartItem = { id: number; name: string; quantity: number; subtotal: string };

type CheckoutPageProps = {
    appName: string;
    auth: { user: { name: string; email: string } | null };
    categories: Category[];
    cart: { items: CartItem[]; count: number; total: string };
};

function money(value: string): string {
    return Number(value).toLocaleString('ro-RO', { style: 'currency', currency: 'RON' });
}

export default function CheckoutPage({ appName, auth, categories, cart }: CheckoutPageProps) {
    const { errors: sharedErrors } = usePage<{ errors: Record<string, string> }>().props;
    const form = useForm({
        customer_name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        notes: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/finalizare-comanda');
    }

    return (
        <>
            <Head title="Finalizare comandă" />
            <div className="shop-page">
                <StorefrontHeader appName={appName} user={auth.user} search="" categories={categories} selectedCategory={null} />
                <main className="shop-container shop-main">
                    <div className="shop-breadcrumb"><Link href="/">Acasă</Link><span>/</span><Link href="/cos">Coș</Link><span>/</span><span>Finalizare comandă</span></div>
                    <h1 className="shop-page-title">Finalizare comandă</h1>
                    <div className="shop-checkout-layout">
                        <form className="shop-checkout-form" onSubmit={submit}>
                            <h2>Date de contact și livrare</h2>
                            <div className="shop-checkout-fields">
                                <label>
                                    Nume complet
                                    <input value={form.data.customer_name} onChange={(event) => form.setData('customer_name', event.target.value)} autoComplete="name" required />
                                    {form.errors.customer_name && <small>{form.errors.customer_name}</small>}
                                </label>
                                <label>
                                    E-mail
                                    <input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} autoComplete="email" required />
                                    {form.errors.email && <small>{form.errors.email}</small>}
                                </label>
                                <label>
                                    Telefon
                                    <input type="tel" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} autoComplete="tel" required />
                                    {form.errors.phone && <small>{form.errors.phone}</small>}
                                </label>
                                <label className="is-wide">
                                    Adresă
                                    <input value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} autoComplete="street-address" required />
                                    {form.errors.address && <small>{form.errors.address}</small>}
                                </label>
                                <label>
                                    Localitate
                                    <input value={form.data.city} onChange={(event) => form.setData('city', event.target.value)} autoComplete="address-level2" required />
                                    {form.errors.city && <small>{form.errors.city}</small>}
                                </label>
                                <label>
                                    Cod poștal
                                    <input value={form.data.postal_code} onChange={(event) => form.setData('postal_code', event.target.value)} autoComplete="postal-code" required />
                                    {form.errors.postal_code && <small>{form.errors.postal_code}</small>}
                                </label>
                                <label className="is-wide">
                                    Observații pentru comandă (opțional)
                                    <textarea value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} rows={3} />
                                    {form.errors.notes && <small>{form.errors.notes}</small>}
                                </label>
                            </div>
                            {sharedErrors.cart && <p className="shop-notice shop-notice-error" role="alert">{sharedErrors.cart}</p>}
                            <button type="submit" className="shop-product-button shop-checkout-submit" disabled={form.processing}>
                                {form.processing ? 'Se trimite comanda…' : 'Plasează comanda'}
                            </button>
                            <p className="shop-checkout-payment">Nu se efectuează plata online. Detaliile livrării și plata vor fi confirmate ulterior.</p>
                        </form>

                        <aside className="shop-cart-summary">
                            <h2>Comanda ta</h2>
                            {cart.items.map((item) => (
                                <div className="shop-checkout-line" key={item.id}>
                                    <span>{item.name} × {item.quantity}</span><strong>{money(item.subtotal)}</strong>
                                </div>
                            ))}
                            <div className="shop-checkout-total"><span>Total produse</span><strong>{money(cart.total)}</strong></div>
                            <p>Costul livrării va fi confirmat înainte de expediere.</p>
                            <Link href="/cos" className="shop-continue-shopping">Înapoi la coș ({cart.count})</Link>
                        </aside>
                    </div>
                </main>
                <StorefrontFooter appName={appName} />
            </div>
        </>
    );
}
