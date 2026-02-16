const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  theme: {
    primaryColor: { type: String, default: '#ff0000' },
    secondaryColor: { type: String, default: '#000000' },
    textColor: { type: String, default: '#ffffff' },
    accentColor: { type: String, default: '#ff0000' }
  },
  hero: {
    home: {
      title: { type: String, default: 'ELEGANCE MEETS ARTISTRY' },
      subtitle: { type: String, default: '' },
      backgroundImage: { type: String, default: '' },
      bodyText: { type: String, default: 'Step into a world of refined craftsmanship and timeless silhouettes.' },
      secondaryText: { type: String, default: 'Each piece is thoughtfully designed to embody grace, confidence, and quiet luxury.' },
      ctaText1: { type: String, default: 'Rave design 2026' },
      ctaText2: { type: String, default: 'Discover the Collection' }
    },
    men: {
      title: { type: String, default: "RUVALI MEN'S COLLECTIONS" },
      backgroundImage: { type: String, default: '' }
    },
    women: {
      title: { type: String, default: "RUVALI WOMEN'S COLLECTIONS" },
      backgroundImage: { type: String, default: '' }
    },
    kids: {
      title: { type: String, default: 'RUVALI KIDS COLLECTIONS' },
      backgroundImages: [{ type: String }]
    },
    lgbtq: {
      title: { type: String, default: 'RUVALI LGBTQ COLLECTIONS' },
      backgroundImage: { type: String, default: '' }
    }
  },
  pages: {
    about: {
      title: { type: String, default: 'About Us' },
      content: { type: String, default: '' },
      image: { type: String, default: '' }
    },
    contact: {
      title: { type: String, default: 'Contact Us' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      backgroundImage: { type: String, default: '' }
    },
    donate: {
      title: { type: String, default: 'Donate' },
      content: { type: String, default: '' },
      backgroundImages: [{ type: String }]
    }
  },
  site: {
    name: { type: String, default: 'RUVALI' },
    logo: { type: String, default: '' },
    footerText: { type: String, default: '© 2024 RUVALI. All rights reserved.' }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
