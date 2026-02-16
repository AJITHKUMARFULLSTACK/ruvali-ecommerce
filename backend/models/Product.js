const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['DRUNKEN MONK PICKS', 'TRIPPERS PICKS', 'NIGHT LIGHT PICKS', 'RADE RAVE PICKS', 'SHOES & SNEAKERS', 'ACCESSORIES']
  },
  collectionType: {
    type: String,
    required: true,
    enum: ['men', 'women', 'kids', 'lgbtq']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  colors: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
