import React, { useState } from 'react';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductDetail from '../../components/ProductDetail/ProductDetail';
import CheckoutModal from '../../components/CheckoutModal/CheckoutModal';
import lgbtqBg from '../../Assets/Images/LGBTQBg.png';
import women1 from '../../Assets/Images/women1.jpg';
import women2 from '../../Assets/Images/women2.jpg';
import women3 from '../../Assets/Images/women3.jpg';
import './LGBTQCollection.css';

const LGBTQCollection = () => {
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

  // Sample products - in a real app, this would come from an API
  const allProducts = [
    {
      id: 1,
      name: 'RUVALI PRIDE',
      category: 'DRUNKEN MONK PICKS',
      price: 3299.00,
      image: women1,
      colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#9400d3']
    },
    {
      id: 2,
      name: 'RUVALI UNITY',
      category: 'TRIPPERS PICKS',
      price: 3599.00,
      image: women2,
      colors: ['#ff69b4', '#00ffff', '#ffff00']
    },
    {
      id: 3,
      name: 'RUVALI FREEDOM',
      category: 'NIGHT LIGHT PICKS',
      price: 3099.00,
      image: women3,
      colors: ['#000000', '#ffffff', '#ff69b4']
    },
    {
      id: 4,
      name: 'RUVALI TRIPPER',
      category: 'TRIPPERS PICKS',
      price: 3399.00,
      image: women1,
      colors: ['#ff00ff', '#00ffff', '#ffff00', '#ff1493']
    },
    {
      id: 5,
      name: 'RUVALI RAVE',
      category: 'RADE RAVE PICKS',
      price: 3499.00,
      image: women2,
      colors: ['#ff69b4', '#00ffff', '#ff1493', '#9370db']
    },
    {
      id: 6,
      name: 'RUVALI CLASSIC',
      category: 'DRUNKEN MONK PICKS',
      price: 2799.00,
      image: women3,
      colors: ['#9370db', '#000000', '#ffffff']
    }
  ];

  const filteredProducts = selectedCategory === 'ALL' 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="lgbtq-collection">
      <Hero image={lgbtqBg} title="RUVALI LGBTQ COLLECTIONS" />
      
      <div className="collection-container">
        <aside className="category-sidebar">
          <h3 className="sidebar-title">LGBTQ CATEGORY</h3>
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

export default LGBTQCollection;

