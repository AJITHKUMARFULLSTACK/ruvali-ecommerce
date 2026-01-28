import React, { useState } from 'react';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import mensBg from '../../Assets/Images/MensBg.png';
import './MensCollection.css';

const MensCollection = () => {
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
      name: 'RUVALI HEADS ON',
      category: 'DRUNKEN MONK PICKS',
      price: 2999.00,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffa500', '#800080', '#8b4513']
    },
    {
      id: 2,
      name: 'RUVALI STYLE UP',
      category: 'DRUNKEN MONK PICKS',
      price: 3499.00,
      colors: ['#ff0000', '#00ff00', '#0000ff']
    },
    {
      id: 3,
      name: 'RUVALI NIGHT WALK',
      category: 'NIGHT LIGHT PICKS',
      price: 2799.00,
      colors: ['#000000', '#ffffff', '#333333']
    },
    {
      id: 4,
      name: 'RUVALI TRIPPER',
      category: 'TRIPPERS PICKS',
      price: 3199.00,
      colors: ['#ff00ff', '#00ffff', '#ffff00']
    },
    {
      id: 5,
      name: 'RUVALI RAVE',
      category: 'RADE RAVE PICKS',
      price: 3299.00,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffa500']
    },
    {
      id: 6,
      name: 'RUVALI CLASSIC',
      category: 'DRUNKEN MONK PICKS',
      price: 2599.00,
      colors: ['#8b4513', '#000000', '#ffffff']
    }
  ];

  const filteredProducts = selectedCategory === 'ALL' 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="mens-collection">
      <Hero image={mensBg} title="RUVALI MEN'S COLLECTIONS" />
      
      <div className="collection-container">
        <aside className="category-sidebar">
          <h3 className="sidebar-title">MEN'S CATEGORY</h3>
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

export default MensCollection;

