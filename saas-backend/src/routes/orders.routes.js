const express = require('express');
const { create, listAdmin, updateStatus } = require('../controllers/order.controller');
const { requireStore } = require('../middleware/requireStore');
const { authAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// Public: POST /api/orders (create order for store)
router.post('/', requireStore, create);

// Admin: GET /api/orders
router.get('/', authAdmin, listAdmin);

// Admin: PUT /api/orders/:id/status
router.put('/:id/status', authAdmin, updateStatus);

module.exports = router;

