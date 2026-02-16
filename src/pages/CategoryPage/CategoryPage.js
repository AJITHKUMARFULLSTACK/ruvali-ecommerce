import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import LuxuryHero from '../../components/LuxuryHero/LuxuryHero';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductDetail from '../../components/ProductDetail/ProductDetail';
import CheckoutModal from '../../components/CheckoutModal/CheckoutModal';
import CategorySidebar from '../../components/CategorySidebar/CategorySidebar';
import Breadcrumbs, { buildBreadcrumbItems } from '../../components/Breadcrumbs/Breadcrumbs';
import ProductCardSkeleton from '../../components/ProductCardSkeleton/ProductCardSkeleton';
import { useStore } from '../../context/StoreContext';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { resolveImageUrl } from '../../lib/imageUtils';
import { findCategoryBySlug } from '../../lib/slugUtils';
import './CategoryPage.css';

const CategoryPage = () => {
  const { slug, parentSlug, subSlug } = useParams();
  const effectiveSlug = parentSlug ?? slug;
  const effectiveSubSlug = subSlug;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  const { store } = useStore();
  const { data: categories = [] } = useCategories();

  const category = useMemo(() => {
    if (!effectiveSlug) return null;
    const parent = findCategoryBySlug(categories, effectiveSlug, null);
    if (!parent) return null;
    if (effectiveSubSlug) {
      const sub = findCategoryBySlug(categories, effectiveSubSlug, parent.id);
      return sub || parent;
    }
    return parent;
  }, [categories, effectiveSlug, effectiveSubSlug]);

  const categoryId = category?.id ?? null;

  const parentCategory = useMemo(() => {
    if (!category) return null;
    if (category.parentId) {
      return categories.find((c) => c.id === category.parentId) || null;
    }
    return category;
  }, [category, categories]);

  const { data: products = [], isLoading, error } = useProducts(
    categoryId ? { categoryId } : {}
  );

  const categoryName = category?.name || 'All Products';
  const title = categoryId ? `${categoryName.toUpperCase()}` : 'ALL PRODUCTS';
  const storeBg = store?.backgroundImage ? resolveImageUrl(store.backgroundImage) : null;
  const bannerImage = parentCategory?.bannerImage ? resolveImageUrl(parentCategory.bannerImage) : null;
  const heroImage = effectiveSlug
    ? (parentCategory ? bannerImage || storeBg : storeBg)
    : storeBg;
  const breadcrumbItems = buildBreadcrumbItems(
    category,
    categories,
    !effectiveSlug
  );

  return (
    <div className="category-page">
      <LuxuryHero
        image={heroImage}
        title={title}
        categoryName={effectiveSlug ? categoryName : null}
      />

      <div className="category-page-container luxury-content-spacer" style={{ paddingTop: TOP_NAV_HEIGHT }}>
        <CategorySidebar
          categories={categories}
          parentCategory={parentCategory}
          title="Browse"
          activeCategoryId={categoryId}
        />

        <main className="category-page-main">
          <Breadcrumbs items={breadcrumbItems} />
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
