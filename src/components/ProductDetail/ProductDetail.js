import React, { useState } from 'react';
import { Modal, Button, InputNumber } from 'antd';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../lib/imageUtils';
import { toast } from '../../lib/toast';
import './ProductDetail.css';

const ProductDetail = ({ product, isOpen, onClose, onBuyNow }) => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '#000000');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Added to cart!');
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

  const stock = product.stock ?? 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable
      width={720}
      className="product-detail-modal-antd"
      destroyOnClose
    >
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

            {isOutOfStock && (
              <p className="product-detail-stock-status product-detail-stock-status--out">Out of stock</p>
            )}
            {isLowStock && !isOutOfStock && (
              <p className="product-detail-stock-status product-detail-stock-status--low">Only {stock} left</p>
            )}

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
              <InputNumber
                min={1}
                max={isOutOfStock ? 0 : stock}
                value={quantity}
                onChange={(v) => setQuantity(v ?? 1)}
                size="large"
                className="product-detail-qty-input"
                disabled={isOutOfStock}
              />
            </div>

            <div className="product-detail-actions">
              <Button type="primary" size="large" block className="btn-add-to-cart" onClick={handleAddToCart} disabled={isOutOfStock}>
                Add to Cart
              </Button>
              <Button size="large" block className="btn-buy-now" onClick={handleBuyNow} disabled={isOutOfStock}>
                Buy Now
              </Button>
            </div>
          </div>
        </div>
    </Modal>
  );
};

export default ProductDetail;
