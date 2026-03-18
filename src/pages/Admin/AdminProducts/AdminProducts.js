import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Select, Modal } from 'antd';
import { toast } from '../../../lib/toast';
import { useAdminProducts } from '../../../hooks/useAdminProducts';
import { useAdminCategories } from '../../../hooks/useAdminCategories';
import { resolveImageUrl } from '../../../lib/imageUtils';
import ProductCardSkeleton from '../../../components/ProductCardSkeleton/ProductCardSkeleton';
import './AdminProducts.css';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState('');
  const { data: products = [], isLoading, delete: deleteProduct, deleteLoading } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();

  const filteredProducts = categoryFilter
    ? products.filter((p) => p.categoryId === categoryFilter)
    : products;

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteProduct(id);
          toast.success('Product deleted');
        } catch (err) {
          toast.error(err.message || 'Failed to delete');
        }
      },
    });
  };

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h1>Products</h1>
        <Button type="primary" size="large" onClick={() => navigate('/admin/products/new')} className="admin-products-add-btn">
          Add New Product
        </Button>
      </div>

      <div className="admin-products-filters">
        <Select
          value={categoryFilter || undefined}
          onChange={(v) => setCategoryFilter(v || '')}
          placeholder="All Categories"
          allowClear
          className="admin-products-filter-select"
          style={{ minWidth: 200 }}
          options={[{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
        />
      </div>

      {isLoading ? (
        <div className="admin-products-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-products-empty">
          No products yet. Add one to get started.
        </div>
      ) : (
        <motion.div
          className="admin-products-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredProducts.map((product) => (
            <div key={product.id} className="admin-product-card">
              <img
                src={
                  product.images?.length > 0
                    ? resolveImageUrl(product.images[0])
                    : 'https://via.placeholder.com/400x400?text=No+Image'
                }
                alt={product.name}
              />
              <div className="admin-product-info">
                <h3>{product.name}</h3>
                <p>{product.category?.name}</p>
                <p className="admin-product-price">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </p>
                <p className="admin-product-stock">
                  Stock: {product.stock ?? 0}
                </p>
                <div className="admin-product-actions">
                  <Button onClick={() => navigate(`/admin/products/${product.id}/edit`)}>Edit</Button>
                  <Button danger onClick={() => handleDelete(product.id)} loading={deleteLoading}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AdminProducts;
