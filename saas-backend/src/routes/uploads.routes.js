const express = require('express');
const { uploadImage } = require('../controllers/upload.controller');
const { authAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// POST /api/upload/image (admin only, field: image)
router.post('/image', authAdmin, uploadImage);

module.exports = router;

