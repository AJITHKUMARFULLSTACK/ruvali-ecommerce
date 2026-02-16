import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../lib/imageUtils';
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

  const rawImage =
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);
  const imageUrl = rawImage
    ? resolveImageUrl(rawImage)
    : `https://api.lorem.space/image/fashion?w=600&h=600&hash=${product.id}`;

  const categoryLabel =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name || '';

  const priceNumber =
    typeof product.price === 'number' ? product.price : Number(product.price || 0);

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="product-detail-close" onClick={onClose}>×</button>
        
        <div className="product-detail-content">
          <div className="product-detail-image-section">
            <img 
              src={imageUrl}
              alt={product.name}
              className="product-detail-image"
            />
          </div>

          <div className="product-detail-info">
            <h2 className="product-detail-name">{product.name}</h2>
            {categoryLabel && (
              <p className="product-detail-category">{categoryLabel}</p>
            )}
            <div className="product-detail-price">
              ₹{priceNumber.toLocaleString('en-IN')}
            </div>

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
