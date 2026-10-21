import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';

type RecentProduct = {
    id: number;
    category: { id: number; name: string };
    name: string;
    price: string;
    stock: number;
    is_active: boolean;
    created_at: string;
};

type DashboardProps = {
    stats: {
        products: number;
        activeProducts: number;
        categories: number;
        lowStockProducts: number;
    };
    recentProducts: RecentProduct[];
    auth: {
        user: {
            permissions: {
                manageCategories: boolean;
                manageProducts: boolean;
            };
        } | null;
    };
};

export default function AdminDashboard({ stats, recentProducts }: DashboardProps) {
    const { auth } = usePage<DashboardProps>().props;
    const cards = [
        { label: 'Produse în catalog', value: stats.products, note: `${stats.activeProducts} active`, symbol: 'PR' },
        { label: 'Categorii', value: stats.categories, note: 'Categorii înregistrate', symbol: 'CA' },
        { label: 'Stoc redus', value: stats.lowStockProducts, note: 'Produse active cu maximum 5 bucăți', symbol: 'ST' },
    ];

    return (
        <>
            <Head title="Panou de administrare" />
            <AdminLayout title="Panou general">
                <div className="mb-4">
                    <h2 className="h4 mb-1">Bun venit în administrare</h2>
                    <p className="mb-0 text-secondary">O privire de ansamblu asupra catalogului magazinului.</p>
                </div>

                <div className="row g-3 mb-4">
                    {cards.map((card) => (
                        <div key={card.label} className="col-12 col-md-6 col-xl-4">
                            <section className="admin-stat-card p-3 p-lg-4">
                                <div className="d-flex align-items-start justify-content-between gap-3">
                                    <div>
                                        <div className="admin-stat-label">{card.label}</div>
                                        <p className="admin-stat-value">{card.value.toLocaleString('ro-RO')}</p>
                                        <small className="text-secondary">{card.note}</small>
                                    </div>
                                    <span className="admin-stat-mark" aria-hidden="true">{card.symbol}</span>
                                </div>
                            </section>
                        </div>
                    ))}
                </div>

                <div className="row g-3">
                    <div className="col-12 col-xl-8">
                        <section className="admin-panel h-100">
                            <div className="admin-panel-heading">
                                <div>
                                    <h2>Produse adăugate recent</h2>
                                    <small className="text-secondary">Ultimele produse înregistrate în catalog</small>
                                </div>
                                {auth.user?.permissions.manageProducts && (
                                    <Link href="/admin/products" className="btn btn-outline-primary btn-sm">Vezi produsele</Link>
                                )}
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle admin-table mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Produs</th>
                                            <th scope="col">Categorie</th>
                                            <th scope="col">Preț</th>
                                            <th scope="col">Stoc</th>
                                            <th scope="col">Stare</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td className="fw-semibold">{product.name}</td>
                                                <td>{product.category.name}</td>
                                                <td>{Number(product.price).toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}</td>
                                                <td>{product.stock}</td>
                                                <td>
                                                    <span className={`badge rounded-pill ${product.is_active ? 'text-bg-success' : 'text-bg-secondary'}`}>
                                                        {product.is_active ? 'Activ' : 'Inactiv'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {recentProducts.length === 0 && (
                                            <tr><td colSpan={5} className="admin-empty">Nu există produse în catalog.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <div className="col-12 col-xl-4">
                        <section className="admin-panel h-100">
                            <div className="admin-panel-heading">
                                <div>
                                    <h2>Scurtături</h2>
                                    <small className="text-secondary">Acțiuni pentru catalog</small>
                                </div>
                            </div>
                            <div className="d-grid gap-2 p-3">
                                {auth.user?.permissions.manageProducts && (
                                    <Link href="/admin/products" className="btn btn-primary">Gestionează produsele</Link>
                                )}
                                {auth.user?.permissions.manageCategories && (
                                    <Link href="/admin/categories" className="btn btn-outline-primary">Gestionează categoriile</Link>
                                )}
                                {!auth.user?.permissions.manageProducts && !auth.user?.permissions.manageCategories && (
                                    <p className="mb-0 p-2 text-secondary">Nu ai permisiuni pentru gestionarea catalogului.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
