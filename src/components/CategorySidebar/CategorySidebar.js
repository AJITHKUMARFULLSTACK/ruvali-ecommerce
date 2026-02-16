import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { buildCategoryTree } from '../../hooks/useCategories';
import './CategorySidebar.css';

const CategorySidebar = ({ categories, title = 'Categories' }) => {
  const { categoryId } = useParams();
  const [expandedIds, setExpandedIds] = useState(new Set());

  const tree = buildCategoryTree(categories);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderCategory = (cat, depth = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedIds.has(cat.id);
    const isActive = categoryId === cat.id;

    return (
      <li key={cat.id} className="category-sidebar-item">
        <div
          className="category-sidebar-row"
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {hasChildren && (
            <button
              type="button"
              className="category-sidebar-expand"
              onClick={() => toggleExpand(cat.id)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
          {!hasChildren && <span className="category-sidebar-spacer" />}
          <Link
            to={`/c/${encodeURIComponent(cat.id)}`}
            className={`category-sidebar-link ${isActive ? 'active' : ''}`}
          >
            {cat.name}
          </Link>
        </div>
        {hasChildren && (
          <AnimatePresence>
            {isExpanded && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="category-sidebar-children"
              >
                {cat.children.map((child) => renderCategory(child, depth + 1))}
              </motion.ul>
            )}
          </AnimatePresence>
        )}
      </li>
    );
  };

  return (
    <aside className="category-sidebar">
      <h3 className="category-sidebar-title">{title}</h3>
      <ul className="category-sidebar-list">
        <li className="category-sidebar-item">
          <div className="category-sidebar-row">
            <span className="category-sidebar-spacer" />
            <Link
              to="/c"
              className={`category-sidebar-link ${!categoryId ? 'active' : ''}`}
            >
              All Products
            </Link>
          </div>
        </li>
        {tree.map((cat) => renderCategory(cat))}
      </ul>
    </aside>
  );
};

export default CategorySidebar;
