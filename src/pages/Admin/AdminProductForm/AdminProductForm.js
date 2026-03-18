import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button } from 'antd';
import { useAdminCategories } from '../../../hooks/useAdminCategories';
import { apiGet, apiPut, apiPost, apiBaseUrl } from '../../../lib/apiClient';
import { resolveImageUrl } from '../../../lib/imageUtils';
import { buildCategoryTree } from '../../../hooks/useCategories';
import { toast } from '../../../lib/toast';
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
      if (!res.ok) {
        const msg = data?.error?.message || 'Upload failed';
        throw new Error(msg);
      }
      const url = data.url;
      if (url) setFormData((prev) => ({ ...prev, image: url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId || formData.price === '' || formData.price == null) {
      toast.error('Please fill required fields');
      return;
    }
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
      toast.error(err?.message || 'Error saving product');
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
        <Button onClick={() => navigate('/admin/products')} className="btn-secondary">
          Back to Products
        </Button>
      </div>

      <Form layout="vertical" onFinish={handleSubmit} className="product-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          <Form.Item label="Product Name" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              size="large"
              placeholder="Product name"
            />
          </Form.Item>
          <Form.Item label="Category" required>
            <Select
              value={formData.categoryId}
              onChange={(v) => setFormData({ ...formData, categoryId: v })}
              size="large"
              placeholder="Select category"
              options={flatCategories.map((cat) => ({
                value: cat.id,
                label: cat._indent ? `― ${cat.name}` : cat.name,
              }))}
            />
          </Form.Item>
          <Form.Item label="Price (₹)" required>
            <InputNumber
              value={formData.price}
              onChange={(v) => setFormData({ ...formData, price: v })}
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </Form.Item>
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
          <Form.Item label="Stock Quantity">
            <InputNumber
              value={formData.stock}
              onChange={(v) => setFormData({ ...formData, stock: v ?? 0 })}
              min={0}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>
        </div>

        <div className="form-actions">
          <Button type="default" onClick={() => navigate('/admin/products')} className="btn-secondary">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="btn-primary">
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AdminProductForm;
