import React from 'react';
import { Link } from 'react-router-dom';
import { getCategorySlug } from '../../lib/slugUtils';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {items.map((item, i) => (
          <li key={i} className="breadcrumbs-item">
            {i > 0 && <span className="breadcrumbs-sep" aria-hidden>/</span>}
            {item.href ? (
              <Link to={item.href} className="breadcrumbs-link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumbs-current">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export function buildBreadcrumbItems(category, categories, isAllProducts) {
  const items = [{ label: 'Home', href: '/' }];

  if (isAllProducts) {
    items.push({ label: 'All Products' });
    return items;
  }

  if (!category) return items;

  const flat = categories || [];
  const getParent = (cat) =>
    cat?.parentId ? flat.find((c) => c.id === cat.parentId) : null;

  const chain = [];
  let curr = category;
  while (curr) {
    chain.unshift(curr);
    curr = getParent(curr);
  }

  chain.forEach((cat, i) => {
    const isLast = i === chain.length - 1;
    const parent = chain[i - 1];
    const href = parent
      ? `/c/${encodeURIComponent(getCategorySlug(parent))}/${encodeURIComponent(getCategorySlug(cat))}`
      : `/c/${encodeURIComponent(getCategorySlug(cat))}`;
    items.push(isLast ? { label: cat.name } : { label: cat.name, href });
  });

  return items;
}

export default Breadcrumbs;
