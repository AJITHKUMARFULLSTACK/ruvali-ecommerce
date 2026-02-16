import React from 'react';
import { Link } from 'react-router-dom';
import { buildCategoryTree } from '../../hooks/useCategories';
import { getCategorySlug } from '../../lib/slugUtils';
import './CategorySidebar.css';

const CategorySidebar = ({ categories, parentCategory, title = 'Categories', activeCategoryId }) => {
  const tree = buildCategoryTree(categories);

  const getCategoryUrl = (cat, parent) => {
    const catSlug = getCategorySlug(cat);
    if (!parent) return `/c/${encodeURIComponent(catSlug)}`;
    const parentSlug = getCategorySlug(parent);
    return `/c/${encodeURIComponent(parentSlug)}/${encodeURIComponent(catSlug)}`;
  };

  const isLinkActive = (cat) => activeCategoryId === cat.id;

  if (parentCategory) {
    const subcategories = categories.filter((c) => c.parentId === parentCategory.id);
    const parentSlug = getCategorySlug(parentCategory);

    return (
      <aside className="category-sidebar category-sidebar--subs">
        <h3 className="category-sidebar-title">{parentCategory.name}</h3>
        <ul className="category-sidebar-list">
          <li className="category-sidebar-item">
            <Link
              to="/c"
              className="category-sidebar-link category-sidebar-link--all"
            >
              All Products
            </Link>
          </li>
          <li className="category-sidebar-item">
            <Link
              to={`/c/${encodeURIComponent(parentSlug)}`}
              className={`category-sidebar-link ${isLinkActive(parentCategory) ? 'active' : ''}`}
            >
              All {parentCategory.name}
            </Link>
          </li>
          {subcategories.map((child) => (
            <li key={child.id} className="category-sidebar-item">
              <Link
                to={getCategoryUrl(child, parentCategory)}
                className={`category-sidebar-link category-sidebar-link--sub ${isLinkActive(child) ? 'active' : ''}`}
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  return (
    <aside className="category-sidebar">
      <h3 className="category-sidebar-title">{title}</h3>
      <ul className="category-sidebar-list">
        <li className="category-sidebar-item">
          <Link
            to="/c"
            className={`category-sidebar-link ${!activeCategoryId ? 'active' : ''}`}
          >
            All Products
          </Link>
        </li>
        {tree.map((cat) => (
          <li key={cat.id} className="category-sidebar-item">
            <Link
              to={`/c/${encodeURIComponent(getCategorySlug(cat))}`}
              className={`category-sidebar-link ${isLinkActive(cat) ? 'active' : ''}`}
            >
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategorySidebar;
