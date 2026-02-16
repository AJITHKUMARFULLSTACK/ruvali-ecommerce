const express = require('express');
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get settings (public for theme, admin for all)
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update settings (admin only)
router.put('/', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Error updating settings', error: error.message });
  }
});

// Update theme colors (admin only)
router.put('/theme', authMiddleware, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.theme = { ...settings.theme, ...req.body };
    await settings.save();
    res.json(settings.theme);
  } catch (error) {
    res.status(400).json({ message: 'Error updating theme', error: error.message });
  }
});

module.exports = router;
