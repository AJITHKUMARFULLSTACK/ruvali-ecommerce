import React, { useState } from 'react';
import { resolveImageUrl } from '../../lib/imageUtils';
import './ProductCard.css';

const FALLBACK_IMAGE =
  'https://via.placeholder.com/400x400.png?text=RUVALI+Product';

const ProductCard = ({ product, onProductClick }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const rawImage =
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);
  const imageUrl = rawImage
    ? resolveImageUrl(rawImage)
    : `https://api.lorem.space/image/fashion?w=400&h=400&hash=${product.id}${(product.name || '')
        .replace(/\s/g, '')
        .substring(0, 10)}` || FALLBACK_IMAGE;

  const categoryLabel =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name || '';

  const priceNumber =
    typeof product.price === 'number'
      ? product.price
      : Number(product.price || 0);

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image-container">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
        <div className="product-image-placeholder" style={{ display: 'none' }}>
          <span>Product Image</span>
        </div>
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label="Add to favorites"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
              fill={isFavorite ? "var(--primary)" : "none"}
              stroke={isFavorite ? "var(--primary)" : "var(--text)"}
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
      
      <div className="product-info">
        <div className="product-price">₹{priceNumber.toLocaleString('en-IN')}</div>
        <h3 className="product-name">{product.name}</h3>
        {categoryLabel && (
          <p className="product-category">{categoryLabel}</p>
        )}
        
        {product.colors && product.colors.length > 0 && (
          <div className="product-colors">
            {product.colors.map((color, index) => (
              <span 
                key={index}
                className="color-dot"
                style={{ backgroundColor: color }}
                aria-label={`Color option ${index + 1}`}
              ></span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

