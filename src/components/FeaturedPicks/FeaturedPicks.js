import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import ProductDetail from '../ProductDetail/ProductDetail';
import CheckoutModal from '../CheckoutModal/CheckoutModal';
import ScrollReveal from '../ScrollReveal/ScrollReveal';
import { StaggerGrid, StaggerItem } from '../ScrollReveal/StaggerGrid';
import './FeaturedPicks.css';
import { useStore } from '../../context/StoreContext';
import { apiGet } from '../../lib/apiClient';

const FeaturedPicks = ({
  title,
  categoryId,
  categorySlug = 'c',
  onProductClick
}) => {
  const { storeSlug } = useStore();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const params = new URLSearchParams({ storeSlug });
        if (categoryId) params.set('categoryId', categoryId);
        const data = await apiGet(`/api/products?${params.toString()}`);
        const list = Array.isArray(data) ? data : data?.products ?? [];
        setProducts(list.slice(0, 4));
      } catch (err) {
        console.error('[FeaturedPicks] failed to fetch products', err);
      }
    };

    fetchFeatured();
  }, [storeSlug, categoryId]);

  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      setSelectedProduct(product);
    }
  };

  return (
    <>
      <section className="featured-picks">
        <div className="featured-picks-container">
          <ScrollReveal>
            <h2 className="featured-picks-title">{title}</h2>
          </ScrollReveal>

          <StaggerGrid className="featured-picks-grid">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard
                  product={product}
                  onProductClick={handleProductClick}
                />
              </StaggerItem>
            ))}
          </StaggerGrid>

          <ScrollReveal delay={0.1}>
            <Link to={`/c/${encodeURIComponent(categorySlug)}`} className="shop-now-btn">
              SHOP NOW
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {!onProductClick && (
        <>
          <ProductDetail
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onBuyNow={(product, quantity, color) => {
              setSelectedProduct(null);
              setCheckoutData({ product, quantity, color });
              setIsCheckoutOpen(true);
            }}
          />

          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            product={checkoutData?.product}
            quantity={checkoutData?.quantity}
            selectedColor={checkoutData?.color}
          />
        </>
      )}
    </>
  );
};

export default FeaturedPicks;

