import { Head, Link } from '@inertiajs/react';
import StorefrontFooter from '../../Components/StorefrontFooter';
import StorefrontHeader from '../../Components/StorefrontHeader';

type Category = { id: number; name: string; slug: string; products_count: number };

type OrderCompleteProps = {
    appName: string;
    auth: { user: { name: string } | null };
    categories: Category[];
    order: { reference: string; total: string };
};

export default function OrderCompletePage({ appName, auth, categories, order }: OrderCompleteProps) {
    return (
        <>
            <Head title="Comandă înregistrată" />
            <div className="shop-page">
                <StorefrontHeader appName={appName} user={auth.user} search="" categories={categories} selectedCategory={null} />
                <main className="shop-container shop-main">
                    <section className="shop-order-complete">
                        <span aria-hidden="true">✓</span>
                        <h1>Comanda a fost înregistrată</h1>
                        <p>Îți vom confirma detaliile comenzii și ale livrării.</p>
                        <dl>
                            <div><dt>Referință comandă</dt><dd>{order.reference}</dd></div>
                            <div><dt>Total produse</dt><dd>{Number(order.total).toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}</dd></div>
                        </dl>
                        <Link href="/" className="shop-product-button">Înapoi la magazin</Link>
                    </section>
                </main>
                <StorefrontFooter appName={appName} />
            </div>
        </>
    );
}
