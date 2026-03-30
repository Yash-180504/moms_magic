# 🍱 Mom's Magic #

> A full-stack marketplace connecting home cooks with people who crave a taste of home — digitizing the informal tiffin/mess service industry one meal at a time.

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [How it Works](#how-it-works)
- [Business Model](#business-model)
- [User Roles](#user-roles)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## The Problem

In Indian cities like Kolkata, there's a massive but completely unorganized market for home-cooked daily meals:

**On the customer side**, students, working professionals, and PG residents face:
- No reliable source for affordable, healthy, home-cooked food
- Canteen food that is repetitive and often unhealthy
- Restaurant meals that are too expensive for a daily habit

**On the home cook side**, thousands of women and home chefs running tiffin/mess services face:
- Managing orders entirely over WhatsApp — no system, no history
- No digital presence or way to attract new customers
- Manual payment tracking with no transparency
- Unable to scale beyond a handful of regular customers

The result: a ₹50,000 Cr+ addressable market running on word-of-mouth and WhatsApp screenshots.

---

## The Solution

**Mom's Magic** is a full-stack web platform that brings this informal economy online.

It connects **home cooks** (providers) with **customers** through a clean, intuitive marketplace — the same way Zomato connects restaurants, but designed specifically for the home-cook model.

The platform handles:
- **Discovery** — customers find verified home kitchens near them
- **Ordering** — cart-based ordering with delivery address and notes
- **Management** — providers manage their menu, accept/reject orders, track earnings
- **Real-time updates** — WebSocket-powered live order status for both sides

---

## How it Works

```
Customer                    Platform                    Provider
   │                           │                           │
   │  Browse kitchens          │                           │
   │──────────────────────────>│                           │
   │                           │                           │
   │  Add items to cart        │                           │
   │  Place order              │                           │
   │──────────────────────────>│  New order notification   │
   │                           │──────────────────────────>│
   │                           │                           │  Accept order
   │  Status: Confirmed        │                           │<──────────────
   │<──────────────────────────│                           │
   │                           │  (preparing → delivered)  │
   │  Live status updates      │<─────────────────────────>│
   │<──────────────────────────│                           │
```

1. **Register** — sign up as a Customer or Home Cook
2. **Browse** — customers search kitchens by location, veg/non-veg, price
3. **Order** — add menu items to cart, enter delivery address, place order
4. **Track** — real-time order status updates via WebSocket (pending → confirmed → preparing → out for delivery → delivered)
5. **Manage** — providers update menu, accept orders, manage their kitchen profile

---

## Business Model

```
Customer pays  ₹80
               ↓
Platform keeps ₹10  (12.5% commission)
               ↓
Provider gets  ₹70
```

| Revenue Stream | Details |
|---|---|
| Per-order commission | ₹5–₹10 per order (~10–12% of meal price) |
| Provider onboarding fee | ₹199–₹499 one-time registration fee |
| Featured listing | Providers pay to appear at the top of search results |

This model keeps the platform lightweight — no delivery fleet, no kitchen infrastructure. Pure marketplace economics.

---

## User Roles

### Customer
- Browse home kitchens by location, diet preference, price
- View full menu for each kitchen
- Add items to cart and place orders
- Track order status in real time
- View full order history

### Home Cook (Provider)
- Create and manage a kitchen profile with photos
- Add, edit, and delete menu items with images
- View and manage incoming orders
- Accept, confirm, and update order delivery status
- Dashboard with order overview

### Admin *(planned)*
- View all users, providers, and orders
- Commission and revenue tracking
- Verify/suspend provider accounts
- Handle disputes

---

## Features

### Live & Working
- **Auth system** — JWT-based registration and login with role separation
- **Kitchen marketplace** — browse all active kitchens with real-time filtering
- **Provider profiles** — full kitchen page with cover photo, menu, and ordering
- **Cart + ordering** — multi-item cart, delivery address, special notes
- **Order management** — providers move orders through a 5-stage status pipeline
- **Provider dashboard** — Kitchen tab (profile), Menu tab (CRUD), Orders tab
- **Image uploads** — kitchen covers and menu item photos via Openinary
- **WebSocket refresh** — all pages auto-refresh every 2 seconds via persistent WS connection
- **Responsive UI** — mobile-first design, works on all screen sizes

### Planned
- Ratings & reviews
- Weekly meal subscriptions
- WhatsApp order notifications
- Razorpay payment integration
- Admin dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL (NeonDB — serverless Postgres) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Real-time** | WebSocket (`ws` package) |
| **Media** | Openinary (custom image CDN) |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Fonts** | Playfair Display SC + Karla (Google Fonts) |

---

## Architecture

```
moms_magic/
├── frontend/           React + Vite + Tailwind web app
│   ├── src/
│   │   ├── components/ Navbar, ProviderCard, HowItWorks, Footer
│   │   ├── pages/      HomePage, ProviderDetailPage, ProviderDashboard,
│   │   │               OrdersPage, LoginPage, RegisterPage
│   │   ├── context/    AuthContext (JWT storage + user state)
│   │   ├── hooks/      useAutoRefresh (WebSocket-based refresh)
│   │   ├── lib/        api.js (all API calls), imgUrl helper
│   │   └── data/       mockProviders.js (seed data reference)
│   └── ...
│
└── backend/            Node.js + Express REST API
    └── src/
        ├── routes/     auth, providers, menu, orders, upload
        ├── middleware/ auth.js (JWT verify + role guard)
        ├── db/         index.js (pg pool), schema.sql, migrate.js
        └── ws/         index.js (WebSocket server + broadcaster)
```

### Request Flow

```
Browser → React (Vite dev / dist)
             │
             │  REST API calls (Axios)
             ▼
         Express (port 3000)
             │
             ├── /api/auth        JWT auth
             ├── /api/providers   Kitchen CRUD
             ├── /api/menu        Menu item CRUD
             ├── /api/orders      Order CRUD + status updates
             └── /api/upload      Openinary image proxy
             │
             ├── pg pool ──────── NeonDB (PostgreSQL, Neon serverless)
             └── WebSocket ─────── ws:// same port, refresh pulse every 2s
```

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | VARCHAR | Full name |
| email | VARCHAR | Unique |
| password_hash | VARCHAR | bcrypt hashed |
| role | VARCHAR | `customer` / `provider` / `admin` |
| phone | VARCHAR | Optional |
| avatar_url | TEXT | Optional |
| created_at | TIMESTAMPTZ | |

### `providers` (kitchen profiles)
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| kitchen_name | VARCHAR | |
| description | TEXT | |
| location | VARCHAR | Area name |
| city | VARCHAR | Default: Kolkata |
| cover_image_url | TEXT | Openinary URL |
| is_veg / is_nonveg | BOOLEAN | Diet flags |
| is_verified | BOOLEAN | Admin-set |
| price_from | INTEGER | Min price in ₹ |
| delivery_time | VARCHAR | e.g. "12pm & 7pm" |
| rating | NUMERIC(2,1) | Avg rating |
| total_orders | INTEGER | Running count |

### `menu_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| provider_id | UUID | FK → providers |
| name | VARCHAR | |
| price | INTEGER | In ₹ |
| image_url | TEXT | Openinary URL |
| is_veg | BOOLEAN | |
| is_available | BOOLEAN | Toggle availability |
| category | VARCHAR | e.g. "Lunch", "Tiffin" |

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| customer_id | UUID | FK → users |
| provider_id | UUID | FK → providers |
| status | VARCHAR | `pending` → `confirmed` → `preparing` → `out_for_delivery` → `delivered` / `cancelled` |
| total_amount | INTEGER | In ₹ |
| delivery_address | TEXT | |
| notes | TEXT | Special instructions |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| order_id | UUID | FK → orders |
| menu_item_id | UUID | FK → menu_items |
| name | VARCHAR | Snapshot of item name |
| quantity | INTEGER | |
| price | INTEGER | Snapshot of price at time of order |

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account (customer or provider) |
| POST | `/login` | — | Login, returns JWT |
| GET | `/me` | JWT | Get current user profile |
| PATCH | `/me` | JWT | Update profile |

### Providers — `/api/providers`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all active kitchens (supports `?search=`, `?city=`, `?veg=true`, `?nonveg=true`) |
| GET | `/:id` | — | Get single kitchen profile |
| GET | `/me/profile` | Provider JWT | Get own kitchen profile |
| POST | `/` | Provider JWT | Create kitchen profile |
| PUT | `/:id` | Provider JWT | Update kitchen profile |
| DELETE | `/:id` | Provider JWT | Delete kitchen profile |

### Menu — `/api`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/providers/:providerId/menu` | — | List menu items for a kitchen |
| POST | `/providers/:providerId/menu` | Provider JWT | Add menu item |
| PUT | `/menu/:id` | Provider JWT | Update menu item |
| DELETE | `/menu/:id` | Provider JWT | Delete menu item |

### Orders — `/api/orders`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | List orders (customers see own; providers see their kitchen's orders) |
| GET | `/:id` | JWT | Get single order with items |
| POST | `/` | Customer JWT | Place new order |
| PUT | `/:id/status` | Provider JWT | Update order status |

### Upload — `/api/upload`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | JWT | Upload image to Openinary, returns `{ url, public_id }` |
| DELETE | `/:id` | JWT | Delete image from Openinary |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [NeonDB](https://neon.tech) account (or any PostgreSQL instance)
- An [Openinary](https://openinary.adityaraj.codes) account for image uploads

### 1. Clone the repo

```bash
git clone https://github.com/Yash-180504/moms_magic.git
cd moms_magic
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables) below), then run the database migration:

```bash
npm run db:migrate
```

Start the backend dev server:

```bash
npm run dev
# Backend + WebSocket server running on http://localhost:3000
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
# App running on http://localhost:5174
```

### 4. Open in browser

Go to `http://localhost:5174`

- Register as a **Customer** to browse and order
- Register as a **Home Cook** to set up a kitchen and manage orders

---

## Environment Variables

### Backend (`backend/.env`)

```env
# PostgreSQL connection (NeonDB)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT
JWT_SECRET=your_super_secret_key_here

# Openinary (image CDN)
OPENINARY_API_URL=https://openinary.adityaraj.codes
OPENINARY_API_KEY=your_openinary_api_key

# Server
PORT=3000
FRONTEND_URL=http://localhost:5174
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

---

## Why Mom's Magic?

- **Real problem** — unorganized tiffin services exist in every Indian city
- **Real market** — millions of PG/hostel residents + thousands of home cooks
- **Clear monetization** — ₹5–₹10 commission per order, simple and proven
- **Multi-user complexity** — three distinct user roles with separate flows
- **Already offline** — we're digitizing something that already works, not creating demand from scratch
- **Easy to demo** — register, list a kitchen, place an order, watch it update live

---

*Made with love in Kolkata 🍛*
