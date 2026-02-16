# RUVALI Backend API

Node.js/Express backend for RUVALI E-commerce application with MongoDB.

## Features

- RESTful API for products, orders, categories
- Admin authentication with JWT
- Image upload functionality
- Settings management (theme colors, hero sections, page content)
- Order management
- Product CRUD operations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ruvali-ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Make sure MongoDB is running on your system

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## Creating Admin User

Run the create admin script:
```bash
node scripts/createAdmin.js [username] [email] [password] [role]
```

Example:
```bash
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin
```

Default credentials (if no arguments provided):
- Username: `admin`
- Email: `admin@ruvali.com`
- Password: `admin123`
- Role: `superadmin`

## API Endpoints

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get current admin (protected)
- `POST /api/admin/create` - Create new admin (superadmin only)

### Products
- `GET /api/products` - Get all active products (public)
- `GET /api/products/:id` - Get single product (public)
- `GET /api/products/admin/all` - Get all products including inactive (admin)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order (public)
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get single order (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)
- `GET /api/orders/stats/overview` - Get order statistics (admin)

### Settings
- `GET /api/settings` - Get settings (public)
- `PUT /api/settings` - Update settings (admin)
- `PUT /api/settings/theme` - Update theme colors (admin)

### Pages
- `GET /api/pages/:pageName` - Get page content (public)
- `PUT /api/pages/:pageName` - Update page content (admin)

### Upload
- `POST /api/upload/image` - Upload single image (admin)
- `POST /api/upload/images` - Upload multiple images (admin)

### Categories
- `GET /api/categories` - Get all categories (public)

## Authentication

Most admin endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Database Models

### Product
- name, category, collectionType, price, image, colors, description, stock, isActive, featured

### Order
- orderId, products, shippingAddress, paymentMethod, paymentStatus, orderStatus, totalAmount

### Admin
- username, email, password, role, isActive

### Settings
- theme (colors), hero sections, pages content, site settings

## File Structure

```
backend/
├── models/          # MongoDB models
├── routes/          # API routes
├── middleware/      # Auth middleware
├── uploads/         # Uploaded images
├── scripts/         # Utility scripts
├── server.js        # Main server file
└── package.json
```

## Notes

- Uploaded images are stored in the `uploads/` directory
- Make sure to create the `uploads/` directory if it doesn't exist
- In production, use environment variables for sensitive data
- Consider using a cloud storage service (AWS S3, Cloudinary) for image uploads in production
