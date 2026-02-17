import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../lib/imageUtils';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
  } = useCart();

  const rawImage = (item) =>
    item.image ||
    (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null);
  const priceNum = (item) =>
    typeof item.price === 'number' ? item.price : Number(item.price || 0);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page" style={{ paddingTop: TOP_NAV_HEIGHT }}>
      <div className="cart-container">
        <h1 className="cart-title">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link to="/c" className="cart-continue-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => {
                const imgUrl = rawImage(item)
                  ? resolveImageUrl(rawImage(item))
                  : `https://api.lorem.space/image/fashion?w=200&h=200&hash=${item.id}`;
                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      <img src={imgUrl} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">
                        ₹{priceNum(item).toLocaleString('en-IN')} each
                      </p>
                      <div className="cart-item-quantity">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="cart-item-total">
                      ₹{(priceNum(item) * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Total ({getCartCount()} items)</span>
                <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
              <button className="cart-checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <Link to="/c" className="cart-continue-link">
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
