const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'ruvali-simple-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Data storage directory
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');

// Initialize data files
async function initDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });

    // Initialize products
    try {
      await fs.access(PRODUCTS_FILE);
    } catch {
      await fs.writeFile(PRODUCTS_FILE, JSON.stringify([], null, 2));
    }

    // Initialize orders
    try {
      await fs.access(ORDERS_FILE);
    } catch {
      await fs.writeFile(ORDERS_FILE, JSON.stringify([], null, 2));
    }

    // Initialize settings
    try {
      await fs.access(SETTINGS_FILE);
    } catch {
      const defaultSettings = {
        theme: {
          primaryColor: '#ff0000',
          secondaryColor: '#000000',
          textColor: '#ffffff',
          accentColor: '#ff0000'
        },
        hero: {
          home: {
            title: 'ELEGANCE/MEETS ARTISTRY',
            bodyText: 'Step into a world of refined craftsmanship and timeless silhouettes.',
            secondaryText: 'Each piece is thoughtfully designed to embody grace, confidence, and quiet luxury.',
            ctaText1: 'Rave design 2026',
            ctaText2: 'Discover the Collection'
          },
          men: { title: "RUVALI MEN'S COLLECTIONS" },
          women: { title: "RUVALI WOMEN'S COLLECTIONS" },
          kids: { title: 'RUVALI KIDS COLLECTIONS' },
          lgbtq: { title: 'RUVALI LGBTQ COLLECTIONS' }
        }
      };
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    }

    // Initialize admin (default admin)
    try {
      await fs.access(ADMINS_FILE);
    } catch {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const defaultAdmin = [{
        id: 1,
        username: 'admin',
        email: 'admin@ruvali.com',
        password: hashedPassword,
        role: 'superadmin'
      }];
      await fs.writeFile(ADMINS_FILE, JSON.stringify(defaultAdmin, null, 2));
      console.log('✅ Default admin created: admin / admin123');
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

// Helper functions
async function readJSON(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJSON(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admins = await readJSON(ADMINS_FILE);
    const admin = admins.find(a => a.username === username);

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Products (Public)
app.get('/api/products', async (req, res) => {
  try {
    const { collectionType, category } = req.query;
    let products = await readJSON(PRODUCTS_FILE);
    
    products = products.filter(p => p.isActive !== false);
    if (collectionType) products = products.filter(p => p.collectionType === collectionType);
    if (category && category !== 'ALL') products = products.filter(p => p.category === category);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Single Product (Public)
app.get('/api/products/:id', async (req, res) => {
  try {
    const products = await readJSON(PRODUCTS_FILE);
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product || product.isActive === false) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Products (Admin)
app.get('/api/products/admin/all', authMiddleware, async (req, res) => {
  try {
    const products = await readJSON(PRODUCTS_FILE);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Product (Admin)
app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const products = await readJSON(PRODUCTS_FILE);
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const product = { id: newId, ...req.body };
    products.push(product);
    await writeJSON(PRODUCTS_FILE, products);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

// Update Product (Admin)
app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const products = await readJSON(PRODUCTS_FILE);
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    products[index] = { ...products[index], ...req.body };
    await writeJSON(PRODUCTS_FILE, products);
    res.json(products[index]);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete Product (Admin)
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const products = await readJSON(PRODUCTS_FILE);
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    products[index].isActive = false;
    await writeJSON(PRODUCTS_FILE, products);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Order (Public)
app.post('/api/orders', async (req, res) => {
  try {
    const orders = await readJSON(ORDERS_FILE);
    const orderId = `RUVALI-${Date.now()}`;
    const order = { id: orders.length + 1, orderId, ...req.body, createdAt: new Date().toISOString() };
    orders.push(order);
    await writeJSON(ORDERS_FILE, orders);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
});

// Get Orders (Admin)
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await readJSON(ORDERS_FILE);
    res.json(orders.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Order Status (Admin)
app.put('/api/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const orders = await readJSON(ORDERS_FILE);
    const index = orders.findIndex(o => o.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (req.body.orderStatus) orders[index].orderStatus = req.body.orderStatus;
    if (req.body.paymentStatus) orders[index].paymentStatus = req.body.paymentStatus;
    await writeJSON(ORDERS_FILE, orders);
    res.json(orders[index]);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error: error.message });
  }
});

// Get Order Stats (Admin)
app.get('/api/orders/stats/overview', authMiddleware, async (req, res) => {
  try {
    const orders = await readJSON(ORDERS_FILE);
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'completed')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    const ordersByStatus = {};
    orders.forEach(o => {
      const status = o.orderStatus || 'pending';
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    });

    res.json({
      totalOrders,
      totalRevenue,
      ordersByStatus: Object.entries(ordersByStatus).map(([_id, count]) => ({ _id, count }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Settings (Public)
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await readJSON(SETTINGS_FILE);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Settings (Admin)
app.put('/api/settings', authMiddleware, async (req, res) => {
  try {
    const currentSettings = await readJSON(SETTINGS_FILE);
    const updatedSettings = { ...currentSettings, ...req.body };
    await writeJSON(SETTINGS_FILE, updatedSettings);
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: 'Error updating settings', error: error.message });
  }
});

// Update Theme (Admin)
app.put('/api/settings/theme', authMiddleware, async (req, res) => {
  try {
    const settings = await readJSON(SETTINGS_FILE);
    settings.theme = { ...settings.theme, ...req.body };
    await writeJSON(SETTINGS_FILE, settings);
    res.json(settings.theme);
  } catch (error) {
    res.status(400).json({ message: 'Error updating theme', error: error.message });
  }
});

// Upload Image (Admin)
app.post('/api/upload/image', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      message: 'File uploaded successfully',
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload error', error: error.message });
  }
});

// Get Categories (Public)
app.get('/api/categories', (req, res) => {
  res.json([
    'DRUNKEN MONK PICKS',
    'TRIPPERS PICKS',
    'NIGHT LIGHT PICKS',
    'RADE RAVE PICKS',
    'SHOES & SNEAKERS',
    'ACCESSORIES'
  ]);
});

// Start server
async function startServer() {
  await initDataFiles();
  app.listen(PORT, () => {
    console.log(`🚀 Simple Backend Server running on port ${PORT}`);
    console.log(`📁 Data stored in: ${DATA_DIR}`);
    console.log(`✅ No database setup needed!`);
    console.log(`\n🔑 Default Admin Login:`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
  });
}

startServer();
