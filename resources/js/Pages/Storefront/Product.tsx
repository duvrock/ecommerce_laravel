import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import StorefrontFooter from '../../Components/StorefrontFooter';
import StorefrontHeader from '../../Components/StorefrontHeader';

type Category = {
    id: number;
    name: string;
    slug: string;
    products_count: number;
};

type ProductImage = {
    id: number;
    image_path: string;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    stock: number;
    image_path: string | null;
    images: ProductImage[];
    category: Category;
};

type ProductPageProps = {
    appName: string;
    auth: { user: { name: string } | null };
    categories: Category[];
    product: Product;
};

function imageUrl(path: string): string {
    return /^https?:\/\//i.test(path) || path.startsWith('/') ? path : `/storage/${path}`;
}

export default function ProductPage({ appName, auth, categories, product }: ProductPageProps) {
    const images = [
        ...(product.image_path ? [{ id: `main-${product.id}`, image_path: product.image_path }] : []),
        ...product.images,
    ];
    const [activeImage, setActiveImage] = useState(0);
    const selectedImage = images[activeImage];

    function moveImage(direction: number) {
        setActiveImage((index) => (index + direction + images.length) % images.length);
    }

    return (
        <>
            <Head title={product.name} />
            <div className="shop-page">
                <StorefrontHeader
                    appName={appName}
                    user={auth.user}
                    search=""
                    categories={categories}
                    selectedCategory={product.category.id}
                />

                <main className="shop-container shop-main">
                    <div className="shop-breadcrumb">
                        <Link href="/">Acasă</Link>
                        <span aria-hidden="true">/</span>
                        <Link href={`/?category=${product.category.id}#produse`}>{product.category.name}</Link>
                        <span aria-hidden="true">/</span>
                        <span>{product.name}</span>
                    </div>

                    <section className="shop-product-detail">
                        <div className="shop-detail-gallery">
                            <div className="shop-detail-image">
                                {selectedImage ? (
                                    <img src={imageUrl(selectedImage.image_path)} alt={product.name} />
                                ) : (
                                    <div className="shop-image-placeholder" aria-label="Produs fără imagine">
                                        <span>{product.name.slice(0, 1).toUpperCase()}</span>
                                        <small>Imagine în curând</small>
                                    </div>
                                )}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            className="shop-carousel-arrow shop-carousel-prev"
                                            aria-label="Imaginea anterioară"
                                            onClick={() => moveImage(-1)}
                                        >
                                            ‹
                                        </button>
                                        <button
                                            type="button"
                                            className="shop-carousel-arrow shop-carousel-next"
                                            aria-label="Imaginea următoare"
                                            onClick={() => moveImage(1)}
                                        >
                                            ›
                                        </button>
                                        <span className="shop-carousel-count">{activeImage + 1} / {images.length}</span>
                                    </>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="shop-detail-thumbnails" aria-label="Imagini produs">
                                    {images.map((image, index) => (
                                        <button
                                            key={image.id}
                                            type="button"
                                            className={index === activeImage ? 'is-active' : ''}
                                            aria-label={`Arată imaginea ${index + 1}`}
                                            aria-pressed={index === activeImage}
                                            onClick={() => setActiveImage(index)}
                                        >
                                            <img src={imageUrl(image.image_path)} alt="" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="shop-detail-info">
                            <p className="shop-eyebrow">{product.category.name}</p>
                            <h1>{product.name}</h1>
                            <p className="shop-detail-code">Cod produs: {product.slug}</p>
                            <div className="shop-product-price">
                                {Number(product.price).toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
                            </div>
                            <div className={`shop-stock${product.stock > 0 ? '' : ' is-out'}`}>
                                <span aria-hidden="true" />
                                {product.stock > 0 ? 'Disponibil în stoc' : 'Stoc epuizat'}
                            </div>
                            {product.description && <p className="shop-detail-description">{product.description}</p>}
                            <Link href="/" className="shop-product-button shop-detail-back">Înapoi la produse</Link>
                        </div>
                    </section>
                </main>

                <StorefrontFooter appName={appName} />
            </div>
        </>
    );
}
