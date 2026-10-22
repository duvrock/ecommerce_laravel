import { Link } from '@inertiajs/react';

type StorefrontFooterProps = {
    appName: string;
};

export default function StorefrontFooter({ appName }: StorefrontFooterProps) {
    const brandName = appName === 'Laravel' ? 'Magazin online' : appName;

    return (
        <footer className="shop-footer">
            <div className="shop-footer-trust">
                <div className="shop-container shop-footer-trust-inner">
                    <section className="shop-footer-trust-section" aria-labelledby="footer-payment-title">
                        <h2 id="footer-payment-title">Modalități de plată</h2>
                        <div className="shop-payment-methods">
                            <span className="shop-payment-badge shop-payment-apple">Apple Pay</span>
                            <span className="shop-payment-badge shop-payment-cards">
                                <i aria-hidden="true"><b /><b /></i> VISA
                            </span>
                            <span className="shop-payment-badge shop-payment-transfer">Ordin de plată / transfer bancar</span>
                        </div>
                    </section>

                    <section className="shop-footer-trust-section" aria-labelledby="footer-info-title">
                        <h2 id="footer-info-title">Informații despre magazin</h2>
                        <p>Detaliile comenzii, plății și livrării se confirmă după plasarea comenzii.</p>
                    </section>

                    <section className="shop-footer-trust-section" aria-labelledby="footer-social-title">
                        <h2 id="footer-social-title">Vizitați-ne la</h2>
                        <div className="shop-social-icons">
                            <span aria-label="LinkedIn" title="LinkedIn">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M5 3.5A1.5 1.5 0 1 1 5 6.5a1.5 1.5 0 0 1 0-3ZM3.7 9h2.6v11H3.7V9Zm5 0h2.5v1.5h.1A2.8 2.8 0 0 1 14 8.8c2.7 0 3.2 1.8 3.2 4.1V20h-2.6v-6.3c0-1.5 0-2.8-1.7-2.8s-1.9 1.3-1.9 2.7V20H8.7V9Z" />
                                </svg>
                            </span>
                            <span aria-label="Instagram" title="Instagram">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <rect x="3" y="3" width="18" height="18" rx="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle className="shop-social-dot" cx="17.5" cy="6.8" r="1" />
                                </svg>
                            </span>
                        </div>
                    </section>
                </div>
            </div>
            <div className="shop-container shop-footer-inner">
                <Link href="/" className="shop-footer-brand">{brandName}</Link>
                <p>Catalog pentru proiectele și lucrările tale.</p>
                <nav aria-label="Navigare subsol">
                    <Link href="/">Acasă</Link>
                    <Link href="/login">Cont client</Link>
                    <a href="#produse">Produse</a>
                </nav>
                <small>© {new Date().getFullYear()} {brandName}. Toate drepturile rezervate.</small>
            </div>
        </footer>
    );
}
