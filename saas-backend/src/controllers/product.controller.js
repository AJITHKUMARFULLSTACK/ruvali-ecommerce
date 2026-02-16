const { asyncHandler } = require('../utils/asyncHandler');
const {
  getProductForStore,
  listProductsForStore,
  createProductForStore,
  updateProductForStore,
  deleteProductForStore
} = require('../services/product.service');

// Public: list by store slug (middleware requireStore sets req.store)
const listPublic = asyncHandler(async (req, res) => {
  const categoryId = req.query.categoryId || null;
  const products = await listProductsForStore(req.store.id, { categoryId });

  console.log('[PRODUCTS:listPublic]', {
    storeId: req.store.id,
    storeSlug: req.store.slug,
    query: req.query,
    categoryId,
    count: products.length
  });

  res.json(products);
});

// Admin: get single product
const getAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await getProductForStore(req.adminUser.storeId, id);
  res.json(product);
});

// Admin: list by admin's store
const listAdmin = asyncHandler(async (req, res) => {
  const products = await listProductsForStore(req.adminUser.storeId);

  console.log('[PRODUCTS:listAdmin]', {
    storeId: req.adminUser.storeId,
    count: products.length
  });

  res.json(products);
});

const create = asyncHandler(async (req, res) => {
  const product = await createProductForStore(req.adminUser.storeId, req.body);

  console.log('[PRODUCTS:create]', {
    storeId: req.adminUser.storeId,
    productId: product.id,
    name: product.name
  });

  res.status(201).json(product);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await updateProductForStore(req.adminUser.storeId, id, req.body);
  res.json(product);
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteProductForStore(req.adminUser.storeId, id);
  res.status(204).send();
});

module.exports = { listPublic, getAdmin, listAdmin, create, update, remove };

