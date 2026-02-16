const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = [
      'DRUNKEN MONK PICKS',
      'TRIPPERS PICKS',
      'NIGHT LIGHT PICKS',
      'RADE RAVE PICKS',
      'SHOES & SNEAKERS',
      'ACCESSORIES'
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
