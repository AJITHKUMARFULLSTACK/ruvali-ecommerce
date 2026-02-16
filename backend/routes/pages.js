const express = require('express');
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get page content (public)
router.get('/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;
    const settings = await Settings.getSettings();
    
    if (settings.pages[pageName]) {
      res.json(settings.pages[pageName]);
    } else {
      res.status(404).json({ message: 'Page not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update page content (admin only)
router.put('/:pageName', authMiddleware, async (req, res) => {
  try {
    const { pageName } = req.params;
    const settings = await Settings.getSettings();
    
    if (settings.pages[pageName]) {
      settings.pages[pageName] = { ...settings.pages[pageName], ...req.body };
      await settings.save();
      res.json(settings.pages[pageName]);
    } else {
      res.status(404).json({ message: 'Page not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating page', error: error.message });
  }
});

module.exports = router;
