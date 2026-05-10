import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pagination } from 'antd';
import LuxuryHero from '../../components/LuxuryHero/LuxuryHero';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductDetail from '../../components/ProductDetail/ProductDetail';
import CategorySidebar from '../../components/CategorySidebar/CategorySidebar';
import Breadcrumbs, { buildBreadcrumbItems } from '../../components/Breadcrumbs/Breadcrumbs';
import ProductCardSkeleton from '../../components/ProductCardSkeleton/ProductCardSkeleton';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import { StaggerGrid, StaggerItem } from '../../components/ScrollReveal/StaggerGrid';
import splashFallback from '../../Assets/Images/landingpageBg.png';
import { useStore } from '../../context/StoreContext';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { resolveImageUrl } from '../../lib/imageUtils';
import { findCategoryBySlug } from '../../lib/slugUtils';
import './CategoryPage.css';

const CategoryPage = () => {
  const { slug, parentSlug, subSlug } = useParams();
  const navigate = useNavigate();
  const effectiveSlug = parentSlug ?? slug;
  const effectiveSubSlug = subSlug;
  const categorySlug = effectiveSlug;

  const shouldShowSplash = !!categorySlug;
  const [splashDone, setSplashDone] = useState(false);
  const [splashVisible, setSplashVisible] = useState(shouldShowSplash);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const gridRef = useRef(null);

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
  const categoriesLoaded = categories.length > 0;

  useEffect(() => {
    if (effectiveSlug && categoriesLoaded && !category) {
      navigate('/c', { replace: true });
    }
  }, [effectiveSlug, categoriesLoaded, category, navigate]);

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  useEffect(() => {
    if (!shouldShowSplash) {
      setSplashDone(true);
      setSplashVisible(false);
      document.body.style.overflow = '';
      return () => {};
    }

    setSplashDone(false);
    setSplashVisible(true);

    document.body.style.overflow = 'hidden';

    const slideTimer = setTimeout(() => setSplashDone(true), 1800);
    const removeTimer = setTimeout(() => {
      setSplashVisible(false);
      document.body.style.overflow = '';
    }, 2800);

    return () => {
      clearTimeout(slideTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = '';
    };
  }, [categorySlug, shouldShowSplash]);

  const parentCategory = useMemo(() => {
    if (!category) return null;
    if (category.parentId) {
      return categories.find((c) => c.id === category.parentId) || null;
    }
    return category;
  }, [category, categories]);

  const { data, isLoading, error } = useProducts(
    categoryId ? { categoryId, page, limit: 40 } : { page, limit: 40 }
  );

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  const handlePageChange = (newPage) => {
    setPage(newPage);
    gridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const categoryName = category?.name || 'All Products';
  const title = categoryId ? `${categoryName.toUpperCase()}` : 'ALL PRODUCTS';
  const storeBg = store?.backgroundImage ? resolveImageUrl(store.backgroundImage) : null;
  const bannerImage = parentCategory?.bannerImage ? resolveImageUrl(parentCategory.bannerImage) : null;
  const heroImage = effectiveSlug
    ? (parentCategory ? bannerImage || storeBg : storeBg)
    : storeBg;
  const splashImage = heroImage || splashFallback;
  const splashTitle = category?.name || (categorySlug ? categorySlug.toUpperCase() : title);
  const splashSub = category?.description || 'Collection';
  const breadcrumbItems = buildBreadcrumbItems(
    category,
    categories,
    !effectiveSlug
  );

  return (
    <div className="category-page">
      {splashVisible && (
        <motion.div
          className="category-splash"
          initial={{ y: 0 }}
          animate={{ y: splashDone ? '-100%' : 0 }}
          transition={{
            duration: 0.9,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          <div className="category-splash-bg">
            {splashImage ? (
              <img
                src={splashImage}
                alt={splashTitle}
                className="category-splash-img"
              />
            ) : (
              <div className="category-splash-fallback" />
            )}
            <div className="category-splash-overlay" />
          </div>

          <div className="category-splash-content">
            <motion.h1
              className="category-splash-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              {splashTitle}
            </motion.h1>

            <motion.p
              className="category-splash-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {splashSub}
            </motion.p>
          </div>

        </motion.div>
      )}

      <LuxuryHero
        image={heroImage}
        title={title}
        categoryName={effectiveSlug ? categoryName : null}
      />

      <div className="category-page-container luxury-content-spacer" style={{ paddingTop: TOP_NAV_HEIGHT }}>
        <div className={`category-sidebar-wrapper${showFilters ? ' sidebar-open' : ''}`}>
          <CategorySidebar
            categories={categories}
            parentCategory={parentCategory}
            title="Browse"
            activeCategoryId={categoryId}
          />
        </div>

        <main className="category-page-main">
          <button
            className="category-filter-toggle"
            type="button"
            onClick={() => setShowFilters((v) => !v)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <ScrollReveal>
            <Breadcrumbs items={breadcrumbItems} />
          </ScrollReveal>
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
            <>
              <StaggerGrid
                ref={gridRef}
                className="category-page-grid"
              >
                {products.map((product) => (
                  <StaggerItem key={product.id}>
                    <ProductCard
                      product={product}
                      onProductClick={setSelectedProduct}
                    />
                  </StaggerItem>
                ))}
              </StaggerGrid>
              {total > 40 && (
                <ScrollReveal>
                  <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={40}
                    onChange={handlePageChange}
                    showTotal={(t) => `${t} products`}
                  />
                  </div>
                </ScrollReveal>
              )}
            </>
          )}
        </main>
      </div>

      <ProductDetail
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default CategoryPage;
