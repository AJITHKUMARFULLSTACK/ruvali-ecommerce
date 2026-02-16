# RUVALI Admin Panel Setup Guide

## Overview

A complete Node.js backend with MongoDB and a comprehensive Admin Panel has been implemented for the RUVALI e-commerce application. The admin can manage every aspect of the application including products, orders, colors, hero sections, and page content.

## Backend Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Setup MongoDB

Make sure MongoDB is installed and running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in `.env`.

### 3. Create Admin User

```bash
cd backend
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin
```

Default credentials:
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@ruvali.com`

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Frontend Dependencies (if not already done)

```bash
npm install
```

### 2. Start Frontend Development Server

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Admin Panel Access

1. Navigate to `http://localhost:3000/admin/login`
2. Login with your admin credentials
3. You'll be redirected to the admin dashboard

## Admin Panel Features

### Dashboard
- View order statistics
- Total revenue overview
- Quick actions for common tasks

### Products Management
- **View All Products:** See all products with filtering by collection type
- **Add New Product:** Create products with images, colors, pricing, and stock
- **Edit Product:** Update product details
- **Delete Product:** Soft delete products (sets isActive to false)
- **Image Upload:** Upload product images directly from admin panel

### Orders Management
- View all orders with detailed information
- Filter orders by status (pending, processing, shipped, delivered, cancelled)
- Update order status
- View customer shipping addresses
- Track payment status

### Settings & Colors
- **Theme Colors:** Change primary, secondary, text, and accent colors
- **Hero Sections:** Customize hero section titles and content for:
  - Home page
  - Men's collection
  - Women's collection
  - Kids collection
  - LGBTQ collection
- Real-time color preview

### Pages Content (Coming Soon)
- Edit About page content
- Edit Contact page information
- Edit Donate page content

## API Endpoints

### Public Endpoints
- `GET /api/products` - Get all active products
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get all categories
- `GET /api/settings` - Get settings (for theme colors)
- `POST /api/orders` - Create new order

### Admin Protected Endpoints
All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

- `POST /api/admin/login` - Admin login
- `GET /api/products/admin/all` - Get all products (including inactive)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/orders` - Get all orders
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/settings/theme` - Update theme colors
- `PUT /api/settings` - Update all settings
- `POST /api/upload/image` - Upload image

## Database Models

### Product Model
```javascript
{
  name: String,
  category: String, // DRUNKEN MONK PICKS, TRIPPERS PICKS, etc.
  collectionType: String, // men, women, kids, lgbtq
  price: Number,
  image: String, // URL path
  colors: [String], // Array of hex colors
  description: String,
  stock: Number,
  isActive: Boolean,
  featured: Boolean
}
```

### Order Model
```javascript
{
  orderId: String,
  products: [{
    product: ObjectId,
    quantity: Number,
    price: Number,
    selectedColor: String
  }],
  shippingAddress: Object,
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: String,
  totalAmount: Number
}
```

### Settings Model
```javascript
{
  theme: {
    primaryColor: String,
    secondaryColor: String,
    textColor: String,
    accentColor: String
  },
  hero: {
    home: Object,
    men: Object,
    women: Object,
    kids: Object,
    lgbtq: Object
  },
  pages: {
    about: Object,
    contact: Object,
    donate: Object
  }
}
```

## File Structure

```
ruvali-ecommerce/
├── backend/
│   ├── models/          # MongoDB models
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Admin.js
│   │   └── Settings.js
│   ├── routes/          # API routes
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── admin.js
│   │   ├── settings.js
│   │   ├── categories.js
│   │   ├── pages.js
│   │   └── upload.js
│   ├── middleware/      # Auth middleware
│   │   └── auth.js
│   ├── scripts/         # Utility scripts
│   │   └── createAdmin.js
│   ├── uploads/         # Uploaded images
│   ├── server.js        # Main server
│   └── package.json
│
└── src/
    ├── pages/
    │   └── Admin/
    │       ├── AdminLogin/
    │       ├── AdminDashboard/
    │       ├── AdminProducts/
    │       ├── AdminProductForm/
    │       ├── AdminOrders/
    │       └── AdminSettings/
    └── components/
        └── ProtectedRoute/
```

## Key Features

### 1. Complete Product Management
- Add/edit/delete products
- Upload product images
- Manage product colors
- Set stock quantities
- Mark products as featured
- Filter by collection type

### 2. Order Management
- View all orders
- Update order status
- Track payment status
- View customer details

### 3. Theme Customization
- Change all theme colors
- Preview color changes
- Customize hero sections
- Update page content

### 4. Security
- JWT-based authentication
- Protected admin routes
- Role-based access (superadmin/admin)

## Next Steps

1. **Connect Frontend to Backend:** Update frontend components to fetch data from API instead of hardcoded data
2. **Image Storage:** Consider using cloud storage (AWS S3, Cloudinary) for production
3. **Email Notifications:** Add email notifications for orders
4. **Analytics:** Add analytics dashboard for sales reports
5. **Inventory Management:** Add low stock alerts
6. **Customer Management:** Add customer accounts and order history

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check if port 5000 is available

### Can't login to admin
- Make sure admin user was created
- Check backend server is running
- Verify JWT_SECRET in `.env` matches

### Images not uploading
- Check `uploads/` directory exists
- Verify file size is under 10MB
- Check file type is image (jpeg, jpg, png, gif, webp)

### CORS errors
- Backend CORS is configured to allow all origins in development
- In production, update CORS settings in `server.js`

## Support

For issues or questions, check the backend README.md or frontend documentation.
