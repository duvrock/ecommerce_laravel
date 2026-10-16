import { Link } from '@inertiajs/react';

type StorefrontFooterProps = {
    appName: string;
};

export default function StorefrontFooter({ appName }: StorefrontFooterProps) {
    return (
        <footer className="bg-emerald-950 text-emerald-50">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
                <div>
                    <Link href="/" className="text-lg font-semibold tracking-tight">
                        {appName}
                    </Link>
                    <p className="mt-2 max-w-md text-sm leading-6 text-emerald-100/75">
                        Un loc în care descoperi produse alese pentru tine. Magazinul nostru este în pregătire.
                    </p>
                </div>
                <nav aria-label="Navigare subsol" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-emerald-100/85">
                    <a href="#magazin" className="transition hover:text-white">Magazin</a>
                    <a href="#despre" className="transition hover:text-white">Despre noi</a>
                    <Link href="/login" className="transition hover:text-white">Cont client</Link>
                </nav>
            </div>
            <div className="border-t border-white/10">
                <p className="mx-auto max-w-7xl px-5 py-4 text-xs text-emerald-100/60 sm:px-8">
                    © {new Date().getFullYear()} {appName}. Toate drepturile rezervate.
                </p>
            </div>
        </footer>
    );
}
