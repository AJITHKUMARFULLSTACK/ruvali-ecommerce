import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Button, Select, Modal } from 'antd';
import { useAdminCategories } from '../../../hooks/useAdminCategories';
import { buildCategoryTree } from '../../../hooks/useCategories';
import { resolveImageUrl } from '../../../lib/imageUtils';
import { toast } from '../../../lib/toast';
import './AdminCategories.css';

const AdminCategories = () => {
  const {
    data: categories = [],
    isLoading,
    create,
    update,
    delete: deleteCat,
    uploadBanner,
    reorder,
    createLoading,
    updateLoading,
    deleteLoading,
    uploadBannerLoading,
    reorderLoading,
  } = useAdminCategories();

  const [editingId, setEditingId] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newParentId, setNewParentId] = useState(null);
  const [error, setError] = useState(null);
  const [uploadingBannerId, setUploadingBannerId] = useState(null);
  const fileInputRefs = useRef({});

  const tree = buildCategoryTree(categories);

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setError(null);
    try {
      await update({ id: editingId, name: editName });
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to update');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleCreate = async () => {
    const name = (newName || '').trim();
    if (!name) {
      setError('Please enter a category name');
      return;
    }
    setError(null);
    try {
      await create({
        name,
        ...(newParentId ? { parentId: newParentId } : {}),
      });
      setNewName('');
      setNewParentId(null);
      setShowNewForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create');
    }
  };

  const handleDelete = (cat) => {
    Modal.confirm({
      title: 'Delete Category',
      content: `Delete "${cat.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteCat(cat.id);
          toast.success('Category deleted');
        } catch (err) {
          toast.error(err.message || 'Failed to delete');
        }
      },
    });
  };

  const handleBannerUpload = async (cat, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingBannerId(cat.id);
    try {
      await uploadBanner({ categoryId: cat.id, file });
    } catch (err) {
      setError(err.message || 'Banner upload failed');
    } finally {
      setUploadingBannerId(null);
      e.target.value = '';
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex == null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    const newOrder = [...tree];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    const orderIds = newOrder.map((c) => c.id);
    setDraggedIndex(null);
    setError(null);
    try {
      await reorder(orderIds);
    } catch (err) {
      setError(err.message || 'Failed to reorder');
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderCategory = (cat, depth = 0, isRoot = false, rootIndex = 0) => (
    <motion.li
      key={cat.id}
      className={`admin-cat-item ${draggedIndex === rootIndex ? 'admin-cat-item--dragging' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingLeft: `${16 + depth * 24}px` }}
      draggable={isRoot && !reorderLoading}
      onDragStart={isRoot ? (e) => handleDragStart(e, rootIndex) : undefined}
      onDragOver={isRoot ? (e) => handleDragOver(e, rootIndex) : undefined}
      onDrop={isRoot ? (e) => handleDrop(e, rootIndex) : undefined}
      onDragEnd={isRoot ? handleDragEnd : undefined}
    >
      <div className="admin-cat-row">
        {editingId === cat.id ? (
          <>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="admin-cat-input"
              autoFocus
              size="small"
            />
            <Button type="primary" size="small" onClick={handleSaveEdit} loading={updateLoading} className="admin-cat-btn save">
              Save
            </Button>
            <Button size="small" onClick={handleCancelEdit} className="admin-cat-btn cancel">
              Cancel
            </Button>
          </>
        ) : (
          <>
            {isRoot && (
              <span className="admin-cat-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
                ⋮⋮
              </span>
            )}
            <span className="admin-cat-name">{cat.name}</span>
            <div className="admin-cat-banner-cell">
              {cat.bannerImage && (
                <img
                  src={resolveImageUrl(cat.bannerImage)}
                  alt={`${cat.name} banner`}
                  className="admin-cat-banner-preview"
                />
              )}
              <input
                ref={(el) => { fileInputRefs.current[cat.id] = el; }}
                type="file"
                accept="image/*"
                onChange={(e) => handleBannerUpload(cat, e)}
                className="admin-cat-banner-input"
                hidden
              />
              <Button
                size="small"
                onClick={() => fileInputRefs.current[cat.id]?.click()}
                loading={uploadingBannerId === cat.id}
                disabled={uploadBannerLoading}
                className="admin-cat-btn banner"
              >
                {cat.bannerImage ? 'Change Banner' : 'Upload Banner'}
              </Button>
            </div>
            <Button size="small" onClick={() => handleStartEdit(cat)} className="admin-cat-btn">
              Edit
            </Button>
            <Button danger size="small" onClick={() => handleDelete(cat)} loading={deleteLoading} className="admin-cat-btn delete">
              Delete
            </Button>
          </>
        )}
      </div>
      {cat.children && cat.children.length > 0 && (
        <ul className="admin-cat-children">
          {cat.children.map((child) => renderCategory(child, depth + 1, false, rootIndex))}
        </ul>
      )}
    </motion.li>
  );

  return (
    <div className="admin-categories">
      <div className="admin-categories-header">
        <h1>Category Manager</h1>
        <Button type="primary" onClick={() => setShowNewForm(!showNewForm)} className="admin-cat-add-btn">
          {showNewForm ? 'Cancel' : '+ New Category'}
        </Button>
      </div>

      {error && (
        <div className="admin-categories-error" role="alert">
          {error}
        </div>
      )}

      <AnimatePresence>
        {showNewForm && (
          <motion.div
            className="admin-categories-new-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3>New Category</h3>
            <div className="admin-cat-form-row">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                className="admin-cat-input"
                size="middle"
              />
              <Select
                value={newParentId || undefined}
                onChange={(v) => setNewParentId(v || null)}
                placeholder="Main category (no parent)"
                allowClear
                className="admin-cat-select"
                style={{ minWidth: 180 }}
                options={tree.flatMap((c) => [
                  { value: c.id, label: c.name },
                  ...(c.children || []).map((child) => ({ value: child.id, label: `― ${child.name}` })),
                ])}
              />
              <Button type="primary" onClick={handleCreate} loading={createLoading} className="admin-cat-btn save">
                Create
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="admin-categories-loading">Loading categories...</div>
      ) : (
        <ul className="admin-categories-tree">
          {tree.length === 0 ? (
            <li className="admin-categories-empty">No categories yet. Add one above.</li>
          ) : (
            tree.map((cat, i) => renderCategory(cat, 0, true, i))
          )}
        </ul>
      )}
    </div>
  );
};

export default AdminCategories;
