import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import ProductDetail from '../ProductDetail/ProductDetail';
import CheckoutModal from '../CheckoutModal/CheckoutModal';
import './FeaturedPicks.css';
import { useStore } from '../../context/StoreContext';

const FeaturedPicks = ({ title, category = 'men', onProductClick }) => {
  const { storeSlug, backendUrl } = useStore();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        console.log('[FeaturedPicks] Store slug', storeSlug);
        const res = await fetch(
          `${backendUrl}/api/products?storeSlug=${encodeURIComponent(storeSlug)}`
        );
        const data = await res.json();
        console.log('[FeaturedPicks] Products response', data);

        if (!Array.isArray(data)) return;

        // For now, just show all products; category-specific filtering can be added later.
        if (data.length === 0) {
          console.warn('[FeaturedPicks] No products returned for store', storeSlug);
        }

        setProducts(data.slice(0, 4));
      } catch (err) {
        console.error('[FeaturedPicks] failed to fetch products', err);
      }
    };

    fetchFeatured();
  }, [backendUrl, storeSlug, title]);

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
          <h2 className="featured-picks-title">{title}</h2>
          <div className="featured-picks-grid">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
          <Link to={`/${category}`} className="shop-now-btn">
            SHOP NOW
          </Link>
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

