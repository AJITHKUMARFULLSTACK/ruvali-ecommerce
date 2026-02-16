const { asyncHandler } = require('../utils/asyncHandler');
const {
  createOrderForStore,
  listOrdersForStore,
  updateOrderStatusForStore
} = require('../services/order.service');

// Public create order (requireStore sets req.store)
const create = asyncHandler(async (req, res) => {
  const order = await createOrderForStore(req.store, req.body);
  res.status(201).json(order);
});

// Admin: list orders for admin's store
const listAdmin = asyncHandler(async (req, res) => {
  const orders = await listOrdersForStore(req.adminUser.storeId);
  res.json(orders);
});

// Admin: update status (triggers WhatsApp)
const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  // eslint-disable-next-line no-console
  console.log('[ORDERS] updateStatus controller', {
    orderId: id,
    newStatus: status,
    adminStoreId: req.adminUser?.storeId
  });
  const order = await updateOrderStatusForStore(req.store || { id: req.adminUser.storeId }, id, status);
  res.json(order);
});

module.exports = { create, listAdmin, updateStatus };

