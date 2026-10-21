import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type AdminPageProps = {
    auth: {
        user: {
            name: string;
            email: string;
            permissions: {
                manageCategories: boolean;
                manageProducts: boolean;
            };
        } | null;
    };
    url: string;
};

type AdminLayoutProps = {
    children: ReactNode;
    title: string;
};

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const page = usePage<AdminPageProps>();
    const { auth } = page.props;
    const { url } = page;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigation = [
        { label: 'Panou general', symbol: 'PG', href: '/admin', visible: true },
        { label: 'Categorii', symbol: 'CA', href: '/admin/categories', visible: auth.user?.permissions.manageCategories ?? false },
        { label: 'Produse', symbol: 'PR', href: '/admin/products', visible: auth.user?.permissions.manageProducts ?? false },
    ].filter((item) => item.visible);
    const initials = auth.user?.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase() ?? 'A';

    useEffect(() => {
        setSidebarOpen(false);
    }, [url]);

    return (
        <div className={`admin-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
            <aside className="admin-sidebar" aria-label="Navigare administrare">
                <Link href="/admin" className="admin-brand" aria-label="Magazin, panou de administrare">
                    <span className="admin-brand-mark">M</span>
                    <span>
                        <strong>Magazin</strong>
                        <small>Centru de administrare</small>
                    </span>
                </Link>

                <div className="admin-nav-caption">Spațiul de lucru</div>
                <nav className="admin-nav">
                    {navigation.map((item) => {
                        const active = item.href === '/admin'
                            ? url === '/admin' || url.startsWith('/admin?')
                            : url === item.href || url.startsWith(`${item.href}?`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={`admin-nav-link${active ? ' active' : ''}`}
                            >
                                <span className="admin-nav-symbol" aria-hidden="true">{item.symbol}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-bottom">
                    <div className="admin-user">
                        <span className="admin-user-avatar" aria-hidden="true">{initials}</span>
                        <span className="text-truncate">
                            <strong className="d-block text-truncate">{auth.user?.name}</strong>
                            <small className="text-truncate">{auth.user?.email}</small>
                        </span>
                    </div>
                </div>
            </aside>

            <button
                type="button"
                className="admin-overlay border-0"
                aria-label="Închide meniul"
                onClick={() => setSidebarOpen(false)}
            />

            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            type="button"
                            className="btn btn-outline-secondary d-lg-none"
                            aria-label="Deschide meniul"
                            aria-expanded={sidebarOpen}
                            onClick={() => setSidebarOpen((open) => !open)}
                        >
                            <span aria-hidden="true">☰</span>
                        </button>
                        <div>
                            <h1 className="admin-topbar-title">{title}</h1>
                            <p className="admin-topbar-subtitle">Administrare magazin online</p>
                        </div>
                    </div>
                    <Link href="/logout" method="post" as="button" className="btn btn-outline-secondary btn-sm">
                        Deconectare
                    </Link>
                </header>
                <main className="admin-content d-grid align-content-start gap-3">{children}</main>
            </div>
        </div>
    );
}
