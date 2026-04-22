# 🍔 Tap & Grab — Food Ordering System

A full-stack food ordering web application built with **React + Node.js + MySQL**.

---

## 📦 What Your Friend Needs to Install First

### Step 1 — Install Node.js
1. Go to → https://nodejs.org
2. Download **LTS version** (the green button)
3. Run the installer → keep all defaults → click Next until Finish
4. Verify: open Command Prompt and type:
   ```
   node --version
   npm --version
   ```
   Both should show version numbers.

### Step 2 — Install XAMPP (for MySQL)
1. Go to → https://www.apachefriends.org
2. Download **XAMPP for Windows**
3. Run the installer → keep all defaults
4. After install, open **XAMPP Control Panel**
5. Click **Start** next to **MySQL** (you only need MySQL, not Apache)

---

## 🚀 Project Setup

### Step 3 — Clone the project
Open Command Prompt or PowerShell:
```bash
git clone https://github.com/aayushmaharjan124-sys/food-service-105.git
cd food-service-105
```

> Don't have Git? Download from https://git-scm.com and install it first.

### Step 4 — Install dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd client
npm install
cd ..
```

### Step 5 — Create environment files
```bash
# Copy the example files
copy .env.example .env
copy client\.env.example client\.env
```

### Step 6 — Create and import the database
```bash
# Create the database
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE food_service_db;"

# Import all data (products, categories, users, orders, everything)
C:\xampp\mysql\bin\mysql.exe -u root food_service_db < food_service_db.sql
```

---

## ▶️ Running the App

Make sure **XAMPP MySQL is running** first, then open **two terminals**:

**Terminal 1 — Backend:**
```bash
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Then open your browser:

| URL | Description |
|---|---|
| `http://localhost:5173` | User-facing site |
| `http://localhost:5173/admin/login` | Admin panel |

---

## 🔑 Login Credentials

**Admin:**
```
Email:    admin@foodservice.com
Password: admin123
```

**Test User:**
```
Email:    test@gmail.com
Password: 123
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL (XAMPP) |
| ORM | Sequelize |
| Auth | JWT |
| Real-time | Socket.io |

---

## ✨ Features

**User**
- Register / Login
- Browse menu by category
- Search with autocomplete
- Cart & Checkout (Cash on Delivery)
- Order tracking with live status
- Favorites, Reviews, Profile
- Live support chat

**Admin**
- Dashboard with stats & revenue
- Product, Category, Order, User management
- Contact message replies
- Live support chat portal

---

## 📁 Project Structure

```
food-service-105/
├── server.js            # Backend entry point
├── .env.example         # Copy this to .env
├── food_service_db.sql  # Database dump (import this)
├── uploads/             # Product images
├── config/              # Database connection
├── models/              # Database models
├── controllers/         # Route logic
├── routes/              # API routes
├── middlewares/         # Auth, upload
├── services/            # Business logic
├── scripts/             # Seed scripts
└── client/              # React frontend
    ├── .env.example     # Copy this to client/.env
    └── src/
        ├── pages/       # All pages (user + admin)
        ├── components/  # Reusable components
        ├── context/     # Auth, Cart state
        ├── hooks/       # Custom hooks
        └── services/    # API calls
```

---

## ❓ Troubleshooting

**"DB connection error"**
→ MySQL is not running. Open XAMPP Control Panel and start MySQL.

**"Port 5001 already in use"**
→ Run `taskkill /F /IM node.exe` in terminal, then restart.

**"npm is not recognized"**
→ Node.js is not installed. Go back to Step 1.

**Images not showing**
→ Make sure backend is running on port 5001.
