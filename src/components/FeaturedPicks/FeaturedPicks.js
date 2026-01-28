import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import './FeaturedPicks.css';

const FeaturedPicks = ({ title, category = 'men' }) => {
  // Sample products - in a real app, this would come from an API
  const sampleProducts = [
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
    }
  ];

  return (
    <section className="featured-picks">
      <div className="featured-picks-container">
        <h2 className="featured-picks-title">{title}</h2>
        <div className="featured-picks-grid">
          {sampleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Link to={`/${category}`} className="shop-now-btn">
          SHOP NOW
        </Link>
      </div>
    </section>
  );
};

export default FeaturedPicks;

