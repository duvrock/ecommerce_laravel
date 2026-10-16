import { Head, Link } from '@inertiajs/react';
import StorefrontFooter from '../Components/StorefrontFooter';
import StorefrontHeader from '../Components/StorefrontHeader';

type WelcomeProps = {
    appName: string;
    auth: {
        user: {
            name: string;
        } | null;
    };
};

export default function Welcome({ appName, auth }: WelcomeProps) {
    return (
        <>
            <Head title="Acasă" />
            <div className="min-h-screen bg-[#fffdf8] text-stone-950">
                <StorefrontHeader appName={appName} user={auth.user} />

                <main>
                    <section className="overflow-hidden bg-[#f1eee5]">
                        <div className="mx-auto grid min-h-[580px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-20">
                            <div className="relative z-[1] max-w-xl">
                                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-950">
                                    <span className="size-2 rounded-full bg-emerald-700" />
                                    Bine ai venit
                                </p>
                                <h1 className="mt-7 text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                                    Descoperă lucrurile care ți se potrivesc.
                                </h1>
                                <p className="mt-6 max-w-lg text-lg leading-8 text-stone-600">
                                    Pregătim un magazin online simplu de explorat, cu produse și colecții pentru tine.
                                </p>
                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <a
                                        href="#magazin"
                                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-950 px-7 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                    >
                                        Descoperă magazinul
                                        <span aria-hidden="true" className="ml-3 text-lg">→</span>
                                    </a>
                                    {!auth.user && (
                                        <Link
                                            href="/register"
                                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-400 bg-white/40 px-7 text-sm font-semibold text-stone-800 transition hover:bg-white"
                                        >
                                            Creează un cont
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div aria-hidden="true" className="relative mx-auto flex aspect-square w-full max-w-[480px] items-center justify-center">
                                <div className="absolute inset-[8%] rounded-full bg-[#e2d8c4]" />
                                <div className="absolute right-[7%] top-[14%] size-20 rounded-full bg-[#c5d4c1]" />
                                <div className="absolute bottom-[12%] left-[8%] size-14 rounded-full bg-[#d3a16d]" />
                                <div className="relative flex aspect-[0.82] w-[62%] rotate-[-5deg] flex-col justify-between rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#fdfbf4] via-[#e6e2d6] to-[#b8c5b3] p-7 shadow-[0_35px_80px_rgba(42,50,35,0.18)] sm:p-9">
                                    <div className="flex items-center justify-between">
                                        <span className="size-3 rounded-full bg-emerald-950" />
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                                            {appName}
                                        </span>
                                    </div>
                                    <svg viewBox="0 0 220 220" className="mx-auto w-[90%] text-emerald-950" fill="none">
                                        <path d="M43 87h134l-12 104H55L43 87Z" fill="currentColor" opacity=".92" />
                                        <path d="M75 91V70a35 35 0 0 1 70 0v21" stroke="#f1eee5" strokeWidth="9" strokeLinecap="round" />
                                        <path d="M66 117h88M73 136h74" stroke="#f1eee5" strokeWidth="4" strokeLinecap="round" opacity=".65" />
                                        <path d="m96 158 10 10 21-25" stroke="#f1eee5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Alegeri inspirate</p>
                                        <p className="mt-1 text-xl font-semibold tracking-tight text-emerald-950">Pentru zi de zi</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="magazin" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24">
                        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                                    În pregătire
                                </p>
                                <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                                    Un magazin nou, construit cu grijă.
                                </h2>
                            </div>
                            <div className="flex flex-col justify-between gap-6 border-t border-stone-200 pt-6 sm:flex-row sm:items-end md:border-l md:border-t-0 md:pl-8 md:pt-0">
                                <p className="max-w-lg leading-7 text-stone-600">
                                    Lucrăm la catalogul de produse. Până atunci, îți poți crea un cont pentru a avea acces rapid la zona ta de client.
                                </p>
                                <Link
                                    href={auth.user ? '/account' : '/register'}
                                    className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
                                >
                                    {auth.user ? 'Mergi la cont' : 'Creează cont client'}
                                    <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section id="despre" className="border-y border-stone-200 bg-[#f7f5ef]">
                        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3 md:gap-12 md:py-14">
                            <div>
                                <p className="text-sm font-semibold text-emerald-950">Simplu de folosit</p>
                                <p className="mt-2 text-sm leading-6 text-stone-600">
                                    O experiență clară, de la prima vizită până la contul tău de client.
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-emerald-950">Gândit pentru tine</p>
                                <p className="mt-2 text-sm leading-6 text-stone-600">
                                    Pagini ușor de parcurs pe telefon, tabletă și calculator.
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-emerald-950">Cont personal</p>
                                <p className="mt-2 text-sm leading-6 text-stone-600">
                                    Creează un cont și gestionează-ți datele într-un singur loc.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                <StorefrontFooter appName={appName} />
            </div>
        </>
    );
}
