import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';

const ProductDetail = ({ product, isOpen, onClose, onBuyNow }) => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '#000000');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity, selectedColor);
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="product-detail-close" onClick={onClose}>×</button>
        
        <div className="product-detail-content">
          <div className="product-detail-image-section">
            <img 
              src={product.image || `https://api.lorem.space/image/fashion?w=600&h=600&hash=${product.id}`}
              alt={product.name}
              className="product-detail-image"
            />
          </div>

          <div className="product-detail-info">
            <h2 className="product-detail-name">{product.name}</h2>
            <p className="product-detail-category">{product.category}</p>
            <div className="product-detail-price">₹{product.price.toLocaleString('en-IN')}</div>

            {product.colors && product.colors.length > 0 && (
              <div className="product-detail-colors">
                <h3>Select Color</h3>
                <div className="color-options">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Color ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="product-detail-quantity">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button onClick={() => handleQuantityChange(-1)}>-</button>
                <span>{quantity}</span>
                <button onClick={() => handleQuantityChange(1)}>+</button>
              </div>
            </div>

            <div className="product-detail-actions">
              <button className="btn-add-to-cart" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="btn-buy-now" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
