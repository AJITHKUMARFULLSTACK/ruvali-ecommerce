import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import ProductDetail from '../ProductDetail/ProductDetail';
import CheckoutModal from '../CheckoutModal/CheckoutModal';
import men1 from '../../Assets/Images/men1.jpg';
import men2 from '../../Assets/Images/men2.jpg';
import women1 from '../../Assets/Images/women1.jpg';
import women2 from '../../Assets/Images/women2.jpg';
import kids0 from '../../Assets/Images/kids0.jpg';
import kids1 from '../../Assets/Images/kids1.jpg';
import './FeaturedPicks.css';

const FeaturedPicks = ({ title, category = 'men', onProductClick }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  // Sample products with images based on category
  const getSampleProducts = () => {
    const baseProducts = [
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

    // Add images based on category
    if (category === 'men') {
      baseProducts[0].image = men1;
      baseProducts[1].image = men2;
    } else if (category === 'women' || category === 'lgbtq') {
      baseProducts[0].image = women1;
      baseProducts[1].image = women2;
    } else if (category === 'kids') {
      baseProducts[0].image = kids0;
      baseProducts[1].image = kids1;
    }

    return baseProducts;
  };

  const sampleProducts = getSampleProducts();

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
            {sampleProducts.map((product) => (
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

