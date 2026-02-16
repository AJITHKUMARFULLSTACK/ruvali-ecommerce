import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminCategories } from '../../../hooks/useAdminCategories';
import { apiGet, apiPut, apiPost, apiBaseUrl } from '../../../lib/apiClient';
import { resolveImageUrl } from '../../../lib/imageUtils';
import { buildCategoryTree } from '../../../hooks/useCategories';
import './AdminProductForm.css';

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    image: '',
    description: '',
    stock: 0
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useAdminCategories();

  useEffect(() => {
    if (!isEdit || !id) return;
    const fetchProduct = async () => {
      try {
        const data = await apiGet(`/api/products/${id}`, {
          headers: getAuthHeaders(),
        });
        const imageUrl = data.images?.length > 0 ? data.images[0] : '';
        setFormData({
          name: data.name || '',
          categoryId: data.categoryId || '',
          price: Number(data.price) || '',
          image: imageUrl,
          description: data.description || '',
          stock: data.stock ?? 0,
        });
      } catch (err) {
        console.error('Error fetching product:', err);
      }
    };
    fetchProduct();
  }, [id, isEdit]);

  useEffect(() => {
    if (!isEdit && categories.length > 0) {
      setFormData((prev) => (prev.categoryId ? prev : { ...prev, categoryId: categories[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, isEdit]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${apiBaseUrl}/api/upload/image`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: fd,
      });
      const data = await res.json();
      const url = data.url;
      if (url) setFormData((prev) => ({ ...prev, image: url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        categoryId: formData.categoryId,
        images: formData.image ? [formData.image] : [],
      };
      if (isEdit) {
        await apiPut(`/api/products/${id}`, payload, {
          headers: getAuthHeaders(),
        });
      } else {
        await apiPost('/api/products', payload, {
          headers: getAuthHeaders(),
        });
      }
      navigate('/admin/products');
    } catch (err) {
      alert(err?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const categoryTree = buildCategoryTree(categories);
  const flatCategories = categoryTree.flatMap((c) => [
    c,
    ...(c.children || []).map((child) => ({ ...child, _indent: true })),
  ]);

  return (
    <div className="admin-product-form">
      <div className="form-header">
        <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <button onClick={() => navigate('/admin/products')} className="btn-secondary">
          Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                {flatCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat._indent ? `― ${cat.name}` : cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Product Image</h2>
          <div className="image-upload">
            {formData.image && (
              <img src={resolveImageUrl(formData.image)} alt="Preview" className="image-preview" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading && <p>Uploading...</p>}
          </div>
        </div>

        <div className="form-section">
          <h2>Stock</h2>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
