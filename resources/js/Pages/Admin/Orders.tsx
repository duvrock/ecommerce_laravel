import { Fragment } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import AdminLayout from '../../Components/AdminLayout';

type OrderItem = {
    id: number;
    product_id: number | null;
    product_name: string;
    unit_price: string;
    quantity: number;
};

type Order = {
    id: number;
    public_id: string;
    customer_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    notes: string | null;
    total: string;
    status: string;
    created_at: string;
    items: OrderItem[];
};

type PageProps = {
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: { search: string; status: string };
    statuses: string[];
    flash: { status?: string };
    errors: Record<string, string>;
};

const statusLabels: Record<string, string> = {
    pending: 'În așteptare',
    processing: 'În procesare',
    shipped: 'Expediată',
    completed: 'Finalizată',
    cancelled: 'Anulată',
};

function formatDate(value: string): string {
    return new Date(value).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatMoney(value: string): string {
    return Number(value).toLocaleString('ro-RO', { style: 'currency', currency: 'RON' });
}

export default function AdminOrders({ orders, filters, statuses }: PageProps) {
    const { flash, errors } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    useEffect(() => {
        setSearch(filters.search);
        setStatus(filters.status);
    }, [filters.search, filters.status]);

    function filter(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/admin/orders', { search, status }, { preserveState: true, replace: true });
    }

    function updateStatus(order: Order, nextStatus: string) {
        if (nextStatus === 'cancelled' && !window.confirm(`Anulezi comanda ${order.public_id}? Stocul produselor va fi restituit.`)) {
            return;
        }

        router.patch(`/admin/orders/${order.public_id}`, { status: nextStatus }, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Comenzi" />
            <AdminLayout title="Comenzi">
                {flash.status && <div className="alert alert-success mb-0" role="status">{flash.status}</div>}
                {errors.status && <div className="alert alert-danger mb-0" role="alert">{errors.status}</div>}

                <form onSubmit={filter} className="admin-panel row g-3 align-items-end p-3 p-lg-4">
                    <label className="col-12 col-md form-label mb-0">
                        Caută comandă sau client
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="form-control mt-1"
                            placeholder="Referință, nume sau e-mail"
                        />
                    </label>
                    <label className="col-12 col-md-auto form-label mb-0">
                        Status
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-select mt-1">
                            <option value="all">Toate</option>
                            {statuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
                        </select>
                    </label>
                    <div className="col-12 col-md-auto d-flex gap-2">
                        <button className="btn btn-primary">Filtrează</button>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setStatus('all');
                                router.get('/admin/orders', { search: '', status: 'all' }, { preserveState: true, replace: true });
                            }}
                            className="btn btn-outline-secondary"
                        >
                            Resetează
                        </button>
                    </div>
                </form>

                <section className="admin-panel overflow-hidden">
                    <p className="px-3 pt-3 small text-secondary">{orders.total} comenzi găsite</p>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle admin-table mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Comandă</th>
                                    <th>Client</th>
                                    <th>Data</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Detalii</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.map((order) => (
                                    <Fragment key={order.id}>
                                        <tr key={order.id}>
                                            <td>
                                                <div className="fw-semibold">#{order.public_id.slice(0, 8).toUpperCase()}</div>
                                                <div className="small text-secondary">{order.items.length} produse</div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{order.customer_name}</div>
                                                <div className="small text-secondary">{order.email}</div>
                                            </td>
                                            <td>{formatDate(order.created_at)}</td>
                                            <td className="fw-semibold">{formatMoney(order.total)}</td>
                                            <td>
                                                <select
                                                    value={order.status}
                                                    onChange={(event) => updateStatus(order, event.target.value)}
                                                    className="form-select form-select-sm"
                                                    aria-label={`Status pentru comanda ${order.public_id}`}
                                                    disabled={order.status === 'cancelled'}
                                                >
                                                    {statuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    aria-expanded={expandedOrder === order.id}
                                                    onClick={() => setExpandedOrder((current) => current === order.id ? null : order.id)}
                                                >
                                                    {expandedOrder === order.id ? 'Închide' : 'Vezi'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrder === order.id && (
                                            <tr key={`${order.id}-details`} className="table-light">
                                                <td colSpan={6}>
                                                    <div className="row g-3 p-2">
                                                        <div className="col-12 col-lg-5">
                                                            <h3 className="h6">Livrare și contact</h3>
                                                            <p className="mb-1">{order.customer_name}</p>
                                                            <p className="mb-1">{order.phone} · {order.email}</p>
                                                            <p className="mb-1">{order.address}, {order.city}, {order.postal_code}</p>
                                                            {order.notes && <p className="mb-0 text-secondary">Observații: {order.notes}</p>}
                                                        </div>
                                                        <div className="col-12 col-lg-7">
                                                            <h3 className="h6">Produse comandate</h3>
                                                            <ul className="list-unstyled mb-0">
                                                                {order.items.map((item) => (
                                                                    <li key={item.id} className="d-flex justify-content-between gap-3 py-1">
                                                                        <span>{item.product_name} × {item.quantity}</span>
                                                                        <strong>{formatMoney((Number(item.unit_price) * item.quantity).toFixed(2))}</strong>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                                {orders.data.length === 0 && (
                                    <tr><td colSpan={6} className="admin-empty">Nu există comenzi pentru filtrele selectate.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <nav className="d-flex flex-wrap gap-2 border-top p-3" aria-label="Paginare comenzi">
                        {orders.links.map((link, index) => (
                            <Link
                                key={`${index}-${link.label}`}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`btn btn-sm ${link.active ? 'btn-primary' : 'btn-outline-secondary'} ${!link.url ? 'disabled' : ''}`}
                            >
                                {link.label.replace('&laquo; Previous', '← Anterior').replace('Next &raquo;', 'Următoarea →')}
                            </Link>
                        ))}
                    </nav>
                </section>
            </AdminLayout>
        </>
    );
}
