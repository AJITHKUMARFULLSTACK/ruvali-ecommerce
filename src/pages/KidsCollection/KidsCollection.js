import React, { useState } from 'react';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import landingBg from '../../Assets/Images/LandingBg.png';
import commonBg from '../../Assets/Images/CommonBg.png';
import './KidsCollection.css';

const KidsCollection = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffa500', '#800080', '#8b4513']
    },
    {
      id: 2,
      name: 'RUVALI KIDS FUN',
      category: 'TRIPPERS PICKS',
      price: 2199.00,
      colors: ['#ff0000', '#00ff00', '#0000ff']
    },
    {
      id: 3,
      name: 'RUVALI KIDS ADVENTURE',
      category: 'NIGHT LIGHT PICKS',
      price: 1899.00,
      colors: ['#000000', '#ffffff', '#333333']
    },
    {
      id: 4,
      name: 'RUVALI KIDS TRIPPER',
      category: 'TRIPPERS PICKS',
      price: 2099.00,
      colors: ['#ff00ff', '#00ffff', '#ffff00']
    },
    {
      id: 5,
      name: 'RUVALI KIDS RAVE',
      category: 'RADE RAVE PICKS',
      price: 2199.00,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffa500']
    },
    {
      id: 6,
      name: 'RUVALI KIDS CLASSIC',
      category: 'DRUNKEN MONK PICKS',
      price: 1799.00,
      colors: ['#8b4513', '#000000', '#ffffff']
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default KidsCollection;

