import { Link } from '@inertiajs/react';

type StorefrontFooterProps = {
    appName: string;
};

export default function StorefrontFooter({ appName }: StorefrontFooterProps) {
    const brandName = appName === 'Laravel' ? 'Magazin online' : appName;

    return (
        <footer className="shop-footer">
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
