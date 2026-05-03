# RUVALI E-commerce Store

A modern, responsive React e-commerce application for RUVALI - "Where Elegance Meets Artistry".

## Features

- 🎨 Modern, dark-themed UI matching Figma designs
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🛍️ Product listings with categories
- ❤️ Favorite/Wishlist functionality
- 🎯 Category filtering
- 🧭 Navigation between Men's and Women's collections
- 🎭 Hero sections with branding
- 📄 Footer with product links, customer care, and payment methods

## Tech Stack

- React 18.2.0
- React Router DOM 6.20.0
- CSS3 with modern styling
- Google Fonts (Outfit, Didot)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd ruvali-ecommerce
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
ruvali-ecommerce/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Header/
│   │   ├── Hero/
│   │   ├── ProductCard/
│   │   ├── FeaturedPicks/
│   │   └── Footer/
│   ├── pages/
│   │   ├── Home/
│   │   ├── MensCollection/
│   │   └── WomensCollection/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner

## Design Features

- Dark theme (#000000 background)
- Red accent color (#ff0000) for branding
- Typography: Outfit (sans-serif) and Didot (serif)
- Product cards with hover effects
- Category sidebars with active states
- Responsive grid layouts

## API & deployment

- Copy **`.env.example`** to **`.env.local`**. Defaults target production **`https://ruvali.co.in`**; override if needed.

- Optional: **`REACT_APP_USE_LOCAL_API=true`** to use **`http://localhost:5005`** during local **`ruvali-backend`** development (see CRA **`package.json`** **`proxy`**).
- The storefront uses **`src/lib/apiClient.js`** (`x-store-slug` on every request; admin JWT only on admin routes). Backend source of truth lives in **`ruvali_backend`** (`https://github.com/AJITHKUMARFULLSTACK/ruvali_backend`): configure **`CORS_ORIGINS`** on the server so your frontend origin is allowed.


## Future Enhancements

- Shopping cart functionality
- Product detail pages
- User authentication
- Payment integration
- Search functionality
- Product reviews and ratings
- Image gallery
- Backend API integration

## License

© 2024 RUVALI. All rights reserved.

