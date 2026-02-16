const express = require('express');
const { listPublic, listAdmin, create, update, remove } = require('../controllers/category.controller');
const { requireStore } = require('../middleware/requireStore');
const { authAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// Public: GET /api/categories?storeSlug=slug
router.get('/', requireStore, listPublic);

// Admin: GET /api/categories/admin (must be before /:id to avoid 'admin' matching as id)
router.get('/admin', authAdmin, listAdmin);

// Admin: POST /api/categories
router.post('/', authAdmin, create);

// Admin: PUT /api/categories/:id (specific routes before parameterized)
router.put('/:id', authAdmin, update);

// Admin: DELETE /api/categories/:id
router.delete('/:id', authAdmin, remove);

module.exports = router;

