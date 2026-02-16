import React, { useEffect, useState } from 'react';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductDetail from '../../components/ProductDetail/ProductDetail';
import CheckoutModal from '../../components/CheckoutModal/CheckoutModal';
import lgbtqBg from '../../Assets/Images/LGBTQBg.png';
import { useStore } from '../../context/StoreContext';
import './WomensCollection.css';

const WomensCollection = () => {
  const { backendUrl, storeSlug } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  const categories = [
    'ALL',
    'DRUNKEN MONK PICKS',
    'TRIPPERS PICKS',
    'NIGHT LIGHT PICKS',
    'RADE RAVE PICKS',
    'SHOES & SNEAKERS',
    'ACCESSORIES'
  ];

  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/api/products?storeSlug=${encodeURIComponent(storeSlug)}`
        );
        const data = await res.json();
        console.log('[WomensCollection] products', data);
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      } catch (err) {
        console.error('[WomensCollection] failed to fetch products', err);
      }
    };

    fetchProducts();
  }, [backendUrl, storeSlug]);

  const filteredProducts = selectedCategory === 'ALL' 
    ? allProducts 
    : allProducts.filter((product) => {
        const catName = product.category?.name || '';
        return catName.toUpperCase() === selectedCategory.toUpperCase();
      });

  return (
    <div className="womens-collection">
      <Hero image={lgbtqBg} title="RUVALI WOMEN'S COLLECTIONS" />
      
      <div className="collection-container">
        <aside className="category-sidebar">
          <h3 className="sidebar-title">WOMEN'S CATEGORY</h3>
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category}>
                <button
                  className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="products-section">
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onProductClick={setSelectedProduct}
              />
            ))}
          </div>
        </main>
      </div>

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
    </div>
  );
};

export default WomensCollection;

