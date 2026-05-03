import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button } from 'antd';
import { useAdminCategories } from '../../../hooks/useAdminCategories';
import { apiGet, apiPost, apiPatch } from '../../../lib/apiClient';
import { resolveImageUrl, pickGalleryImageSrc } from '../../../lib/imageUtils';
import { buildCategoryTree } from '../../../hooks/useCategories';
import { toast } from '../../../lib/toast';
import './AdminProductForm.css';

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    stock: 0,
  });
  const [loading, setLoading] = useState(false);
  /** New file chosen in this session; uploaded on save */
  const [pendingImageFile, setPendingImageFile] = useState(null);
  /** Resolved URL for `<img src>` (server path, full URL, or blob) */
  const [previewSrc, setPreviewSrc] = useState('');
  const blobUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: categories = [] } = useAdminCategories();

  const revokeBlobIfAny = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => revokeBlobIfAny();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    const fetchProduct = async () => {
      try {
        const data = await apiGet(`/api/products/${id}`);
        const first = data.images?.length ? data.images[0] : null;
        const imageStr =
          typeof first === 'string' ? first : pickGalleryImageSrc(first);
        revokeBlobIfAny();
        setPendingImageFile(null);
        setFormData({
          name: data.name || '',
          categoryId: data.categoryId || '',
          price: Number(data.price) || '',
          description: data.description || '',
          stock: data.stock ?? 0,
        });
        setPreviewSrc(imageStr ? resolveImageUrl(imageStr) : '');
        if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    revokeBlobIfAny();
    const objectUrl = URL.createObjectURL(file);
    blobUrlRef.current = objectUrl;
    setPendingImageFile(file);
    setPreviewSrc(objectUrl);
  };

  const buildProductFormData = () => {
    const fd = new FormData();
    fd.append('name', (formData.name ?? '').toString().trim());
    fd.append('categoryId', (formData.categoryId ?? '').toString().trim());
    fd.append('price', String(formData.price ?? ''));
    fd.append('stock', String(formData.stock ?? 0));
    const desc =
      formData.description === undefined || formData.description === ''
        ? ''
        : String(formData.description);
    fd.append('description', desc);
    if (pendingImageFile) {
      fd.append('images', pendingImageFile);
    }
    return fd;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId || formData.price === '' || formData.price == null) {
      toast.error('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await apiPatch(`/api/products/${id}`, buildProductFormData());
      } else {
        await apiPost('/api/products', buildProductFormData());
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
          <p style={{ opacity: 0.75, fontSize: 13, marginBottom: 12 }}>
            {isEdit
              ? 'Pick a file to add an image when you save. Existing images stay unless you replace them elsewhere.'
              : 'Optional: choose image(s); upload happens when you create the product.'}
          </p>
          <div className="image-upload">
            {previewSrc ? (
              <img src={previewSrc} alt="Preview" className="image-preview" />
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={handleImageFileChange}
              disabled={loading}
            />
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
