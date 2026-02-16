import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductDetail from '../../components/ProductDetail/ProductDetail';
import CheckoutModal from '../../components/CheckoutModal/CheckoutModal';
import CategorySidebar from '../../components/CategorySidebar/CategorySidebar';
import ProductCardSkeleton from '../../components/ProductCardSkeleton/ProductCardSkeleton';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  const { data: categories = [], tree } = useCategories();
  const { data: products = [], isLoading, error } = useProducts(
    categoryId ? { categoryId } : {}
  );

  const category = categoryId
    ? tree.flatMap((c) => [c, ...(c.children || [])]).find((c) => c.id === categoryId)
    : null;

  const categoryName = category?.name || 'All Products';
  const title = categoryId ? `${categoryName.toUpperCase()} COLLECTION` : 'ALL PRODUCTS';

  return (
    <div className="category-page">
      <Hero title={title} />

      <div className="category-page-container">
        <CategorySidebar categories={categories} title="Browse" />

        <main className="category-page-main">
          {isLoading && (
            <div className="category-page-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && (
            <motion.div
              className="category-page-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>Unable to load products. Please try again later.</p>
            </motion.div>
          )}

          {!isLoading && !error && products.length === 0 && (
            <motion.div
              className="category-page-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>No products in this category yet.</p>
            </motion.div>
          )}

          {!isLoading && !error && products.length > 0 && (
            <motion.div
              className="category-page-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={setSelectedProduct}
                />
              ))}
            </motion.div>
          )}
        </main>
      </div>

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
    </div>
  );
};

export default CategoryPage;
