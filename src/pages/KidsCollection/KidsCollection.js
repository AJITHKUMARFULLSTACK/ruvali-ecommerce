import React, { useState } from 'react';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductDetail from '../../components/ProductDetail/ProductDetail';
import CheckoutModal from '../../components/CheckoutModal/CheckoutModal';
import landingBg from '../../Assets/Images/LandingBg.png';
import commonBg from '../../Assets/Images/CommonBg.png';
import kids0 from '../../Assets/Images/kids0.jpg';
import kids1 from '../../Assets/Images/kids1.jpg';
import kids2 from '../../Assets/Images/kids2.jpg';
import kids3 from '../../Assets/Images/kids3.jpg';
import kids4 from '../../Assets/Images/kids4.jpg';
import kids5 from '../../Assets/Images/kids5.jpg';
import kids6 from '../../Assets/Images/kids6.jpg';
import './KidsCollection.css';

const KidsCollection = () => {
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
      name: 'RUVALI KIDS PLAY',
      category: 'DRUNKEN MONK PICKS',
      price: 1999.00,
      image: kids0,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffa500', '#800080', '#8b4513']
    },
    {
      id: 2,
      name: 'RUVALI KIDS FUN',
      category: 'TRIPPERS PICKS',
      price: 2199.00,
      image: kids1,
      colors: ['#ff0000', '#00ff00', '#0000ff']
    },
    {
      id: 3,
      name: 'RUVALI KIDS ADVENTURE',
      category: 'NIGHT LIGHT PICKS',
      price: 1899.00,
      image: kids2,
      colors: ['#000000', '#ffffff', '#333333']
    },
    {
      id: 4,
      name: 'RUVALI KIDS TRIPPER',
      category: 'TRIPPERS PICKS',
      price: 2099.00,
      image: kids3,
      colors: ['#ff00ff', '#00ffff', '#ffff00']
    },
    {
      id: 5,
      name: 'RUVALI KIDS RAVE',
      category: 'RADE RAVE PICKS',
      price: 2199.00,
      image: kids4,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffa500']
    },
    {
      id: 6,
      name: 'RUVALI KIDS CLASSIC',
      category: 'DRUNKEN MONK PICKS',
      price: 1799.00,
      image: kids5,
      colors: ['#8b4513', '#000000', '#ffffff']
    },
    {
      id: 7,
      name: 'RUVALI KIDS STYLE',
      category: 'NIGHT LIGHT PICKS',
      price: 1999.00,
      image: kids6,
      colors: ['#ff69b4', '#00ffff', '#ffff00']
    }
  ];

  const filteredProducts = selectedCategory === 'ALL' 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="kids-collection">
      <Hero 
        images={[landingBg, commonBg]} 
        title="RUVALI KIDS COLLECTIONS" 
      />
      
      <div className="collection-container">
        <aside className="category-sidebar">
          <h3 className="sidebar-title">KIDS CATEGORY</h3>
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

export default KidsCollection;

