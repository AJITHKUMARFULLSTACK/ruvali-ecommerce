import React from 'react';
import { motion } from 'framer-motion';
import './ProductCardSkeleton.css';

const ProductCardSkeleton = () => (
  <motion.div
    className="product-card-skeleton"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="skeleton-image" />
    <div className="skeleton-content">
      <div className="skeleton-price" />
      <div className="skeleton-name" />
      <div className="skeleton-category" />
    </div>
  </motion.div>
);

export default ProductCardSkeleton;
