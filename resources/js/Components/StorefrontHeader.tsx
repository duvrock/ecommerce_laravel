import { Link } from '@inertiajs/react';
import { useState } from 'react';

type StorefrontHeaderProps = {
    appName: string;
    user: {
        name: string;
    } | null;
};

export default function StorefrontHeader({ appName, user }: StorefrontHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="relative z-10 border-b border-stone-200 bg-[#fffdf8]">
            <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-3 text-stone-950"
                    aria-label={`${appName} - pagina principală`}
                >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-950 text-lg font-semibold text-white">
                        {appName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="text-lg font-semibold tracking-tight">{appName}</span>
                </Link>

                <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-stone-300 text-stone-800 md:hidden"
                    aria-label={menuOpen ? 'Închide meniul' : 'Deschide meniul'}
                    aria-expanded={menuOpen}
                    aria-controls="storefront-navigation"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span className="text-xl leading-none">{menuOpen ? '×' : '☰'}</span>
                </button>

                <nav
                    id="storefront-navigation"
                    aria-label="Navigare principală"
                    className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-stone-200 bg-[#fffdf8] p-4 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
                >
                    <Link
                        href="/"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-emerald-800"
                        onClick={() => setMenuOpen(false)}
                    >
                        Acasă
                    </Link>
                    <a
                        href="#magazin"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-emerald-800"
                        onClick={() => setMenuOpen(false)}
                    >
                        Magazin
                    </a>
                    <a
                        href="#despre"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-emerald-800"
                        onClick={() => setMenuOpen(false)}
                    >
                        Despre noi
                    </a>
                    <div className="mt-2 border-t border-stone-200 pt-3 md:mt-0 md:border-0 md:pt-0">
                        {user ? (
                            <Link
                                href="/account"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-stone-300 px-5 text-sm font-semibold text-stone-800 transition hover:border-emerald-900 hover:text-emerald-900 md:w-auto"
                            >
                                Contul meu
                            </Link>
                        ) : (
                            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                <Link
                                    href="/login"
                                    className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
                                >
                                    Autentificare
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                >
                                    Cont client
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
