import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'antd';
import { useCart } from '../../context/CartContext';
import { toast } from '../../lib/toast';
import { resolveImageUrl } from '../../lib/imageUtils';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import './Cart.css';

const itemVariants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

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
    <motion.div
      className="cart-page"
      style={{ paddingTop: TOP_NAV_HEIGHT }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="cart-container">
        <motion.h1
          className="cart-title"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Your Cart
        </motion.h1>

        {cartItems.length === 0 ? (
          <ScrollReveal>
            <div className="cart-empty">
              <p>Your cart is empty.</p>
              <Link to="/c" className="cart-continue-btn">
                Continue Shopping
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            <div className="cart-items">
              <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => {
                const imgUrl = rawImage(item)
                  ? resolveImageUrl(rawImage(item))
                  : `https://api.lorem.space/image/fashion?w=200&h=200&hash=${item.id}`;
                return (
                  <ScrollReveal key={item.id} delay={index * 0.05}>
                    <motion.div
                    key={item.id}
                    className="cart-item"
                    variants={itemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                  >
                    <div className="cart-item-image">
                      <img src={imgUrl} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">
                        ₹{priceNum(item).toLocaleString('en-IN')} each
                      </p>
                      <div className="cart-item-quantity">
                        <Button
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        type="link"
                        size="small"
                        className="cart-item-remove"
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.info('Item removed from cart');
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="cart-item-total">
                      ₹{(priceNum(item) * item.quantity).toLocaleString('en-IN')}
                    </div>
                    </motion.div>
                  </ScrollReveal>
                );
              })}
              </AnimatePresence>
            </div>

            <ScrollReveal direction="left" delay={0.2}>
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Total ({getCartCount()} items)</span>
                  <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                </div>
                <Button type="primary" size="large" block className="cart-checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
                <Link to="/c" className="cart-continue-link">
                  Continue Shopping
                </Link>
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;
