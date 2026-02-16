const { prisma } = require('../config/prisma');

async function getProductForStore(storeId, productId) {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
    include: { category: true }
  });
  if (!product) {
    const { HttpError } = require('../utils/httpError');
    throw new HttpError(404, 'Product not found');
  }
  return product;
}

async function listProductsForStore(storeId, { categoryId } = {}) {
  const where = { storeId };
  if (categoryId) {
    where.categoryId = categoryId;
  }
  return prisma.product.findMany({
    where,
    include: { category: true }
  });
}

async function createProductForStore(storeId, payload) {
  return prisma.product.create({
    data: {
      storeId,
      categoryId: payload.categoryId,
      name: payload.name,
      description: payload.description || null,
      price: payload.price,
      images: payload.images || [],
      stock: payload.stock ?? 0
    }
  });
}

async function updateProductForStore(storeId, productId, payload) {
  // Ensure product belongs to this store
  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId }
  });
  if (!existing) {
    const { HttpError } = require('../utils/httpError');
    throw new HttpError(404, 'Product not found for this store');
  }

  return prisma.product.update({
    where: { id: productId },
    data: {
      categoryId: payload.categoryId,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      images: payload.images,
      stock: payload.stock
    }
  });
}

async function deleteProductForStore(storeId, productId) {
  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId }
  });
  if (!existing) {
    const { HttpError } = require('../utils/httpError');
    throw new HttpError(404, 'Product not found for this store');
  }

  await prisma.product.delete({
    where: { id: productId }
  });
}

module.exports = {
  getProductForStore,
  listProductsForStore,
  createProductForStore,
  updateProductForStore,
  deleteProductForStore
};

