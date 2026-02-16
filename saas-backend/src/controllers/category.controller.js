const { asyncHandler } = require('../utils/asyncHandler');
const {
  listCategoriesForStore,
  createCategoryForStore,
  updateCategoryForStore,
  deleteCategoryForStore
} = require('../services/category.service');

// Public: list by store slug (requireStore)
const listPublic = asyncHandler(async (req, res) => {
  const cats = await listCategoriesForStore(req.store.id);

  console.log('[CATEGORIES:listPublic]', {
    storeId: req.store.id,
    storeSlug: req.store.slug,
    count: cats.length
  });

  res.json(cats);
});

// Admin: list by admin's store
const listAdmin = asyncHandler(async (req, res) => {
  const cats = await listCategoriesForStore(req.adminUser.storeId);

  console.log('[CATEGORIES:listAdmin]', {
    storeId: req.adminUser.storeId,
    count: cats.length
  });

  res.json(cats);
});

const create = asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    const { HttpError } = require('../utils/httpError');
    throw new HttpError(400, 'Category name is required');
  }
  const cat = await createCategoryForStore(req.adminUser.storeId, body);

  console.log('[CATEGORIES:create]', {
    storeId: req.adminUser.storeId,
    categoryId: cat.id,
    name: cat.name
  });

  res.status(201).json(cat);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const storeId = req.adminUser?.storeId;
  if (!storeId) {
    const { HttpError } = require('../utils/httpError');
    throw new HttpError(401, 'Admin store not found');
  }
  console.log('[CATEGORIES:update]', { categoryId: id, storeId, body: req.body });
  const cat = await updateCategoryForStore(storeId, id, req.body);
  res.json(cat);
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteCategoryForStore(req.adminUser.storeId, id);
  res.status(204).send();
});

module.exports = { listPublic, listAdmin, create, update, remove };

