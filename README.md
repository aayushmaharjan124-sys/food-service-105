# 🍔 Tap & Grab — Food Ordering System

A full-stack food ordering web application converted from a legacy PHP/MySQL project into a modern **React + Node.js + MySQL** system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL (via XAMPP) |
| ORM | Sequelize |
| Auth | JWT (JSON Web Tokens) |
| Real-time | Socket.io |
| File Upload | Multer |

---

## Project Structure

```
Food-service/
├── server.js               # Express + Socket.io entry point
├── .env                    # Environment variables
├── config/
│   └── db.js               # Sequelize MySQL connection
├── models/                 # Sequelize models
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   ├── Order.js
│   ├── Message.js
│   ├── Review.js
│   ├── Favorite.js
│   ├── Category.js
│   ├── ChatSession.js
│   ├── ChatMessage.js
│   └── index.js            # Associations
├── controllers/            # Route handlers
├── routes/                 # Express routers
├── middlewares/            # Auth, upload
├── services/               # Business logic
├── scripts/
│   ├── seed.js             # Creates admin user
│   └── seedMenu.js         # Seeds 32 menu items with images
├── uploads/                # Uploaded product images
└── client/                 # React frontend (Vite)
    ├── src/
    │   ├── pages/
    │   │   ├── user/       # Home, Menu, Cart, Checkout, Orders, Profile...
    │   │   └── admin/      # Dashboard, Products, Orders, Users, Support...
    │   ├── components/
    │   │   ├── common/     # Navbar, Footer, ProductCard, SupportChat...
    │   │   └── admin/      # AdminLayout
    │   ├── context/        # AuthContext, CartContext
    │   ├── hooks/          # useChat, useDebounce, usePolling, useFormValidation
    │   ├── services/       # API call wrappers
    │   └── utils/          # validators.js
    └── .env                # Frontend env vars
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [XAMPP](https://www.apachefriends.org/) (for MySQL)

---

## Setup & Installation

### 1. Start MySQL
Open **XAMPP Control Panel** → click **Start** next to **MySQL**

### 2. Create the database
```bash
# Using XAMPP MySQL CLI
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS food_service_db;"
```

### 3. Install backend dependencies
```bash
cd C:\Food-service
npm install
```

### 4. Install frontend dependencies
```bash
cd C:\Food-service\client
npm install
```

### 5. Configure environment
Edit `C:\Food-service\.env`:
```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=food_service_db
DB_USER=root
DB_PASS=
JWT_SECRET=change_this_to_a_strong_random_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

Edit `C:\Food-service\client\.env`:
```env
VITE_API_URL=http://localhost:5001/api
VITE_UPLOADS_URL=http://localhost:5001/uploads
VITE_SOCKET_URL=http://localhost:5001
```

### 6. Seed the database
```bash
# From C:\Food-service

# Create admin user
node scripts/seed.js

# Seed 32 menu items with images (optional but recommended)
node scripts/seedMenu.js
```

---

## Running the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd C:\Food-service
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd C:\Food-service\client
npm run dev
```

Then open your browser:

| URL | Description |
|---|---|
| `http://localhost:5173` | User-facing site |
| `http://localhost:5173/admin/login` | Admin panel |

---

## Default Admin Credentials

```
Email:    admin@foodservice.com
Password: admin123
```

> ⚠️ Change these after first login.

---

## Features

### User
- Register / Login with JWT auth
- Browse menu by category
- Smart search with debounced autocomplete
- Add to cart, update quantities
- Checkout (Cash on Delivery)
- Order tracking with live status progress bar
- Order history
- Favorites / Wishlist
- Product reviews & ratings
- Profile management (name, email, phone, address, password)
- Live support chat (Socket.io)

### Admin
- Dashboard (revenue, orders, top products, recent activity)
- Product management (CRUD + image upload)
- Category management (CRUD)
- Order management (status updates, delete)
- User management (view, delete)
- Contact messages with reply
- Live support chat portal (see all active sessions, reply in real-time)

### Smart Features
- **Top-selling algorithm:** `score = (totalOrders × 0.7) + (recentOrders × 1.3)`
- **Delivery estimation:** `Prep Time + (Active Orders × 2 min)`
- **Recommendations:** based on user's most ordered category
- **Real-time support chat** with 1-minute inactivity auto-close

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/admin/login` | Admin login |
| GET | `/api/products` | List products |
| GET | `/api/products/search?q=` | Search products |
| GET | `/api/products/top-selling` | Top selling items |
| GET | `/api/categories` | List categories |
| GET/POST/DELETE | `/api/cart` | Cart operations |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | My orders |
| GET | `/api/admin/dashboard` | Admin stats |
| GET | `/api/admin/orders` | All orders |
| GET | `/api/admin/users` | All users |

---

## Scripts

```bash
npm run dev        # Start backend with nodemon
npm run start      # Start backend (production)
npm run seed       # Create admin user
node scripts/seedMenu.js  # Seed menu items
```

---

## Notes

- Product images are stored in `/uploads/` and served statically
- The legacy PHP project is available at `./food` (symlink) for reference
- Socket.io handles real-time support chat — both user widget and admin portal
- All passwords are hashed with bcryptjs (12 rounds)
- Rate limiting: 20 auth requests / 15 min, 200 general requests / min
