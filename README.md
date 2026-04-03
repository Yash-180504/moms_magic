# Mom's Magic

Home-cooked food marketplace built with Next.js (App Router) + PostgreSQL.

This repo contains a full-stack app with:

- **Customer** experience: browse kitchens by city, view menus, add to cart, checkout, track/cancel orders.
- **Provider (Home Cook)** dashboard: create a kitchen profile, manage menu items, view and update order statuses.
- **Delivery partner** dashboard: see currently “available” orders to deliver.
- **Admin** portal: login via server-configured credentials, view summary analytics + tabbed datasets.

> The Next.js app lives inside the **project/** folder.

---

## Table of contents

- Linked web manifest (used by Next.js metadata): `project/public/favicon/site.webmanifest`
- Additional manifest present in repo: `project/public/manifest.json`
- [Tech stack](#tech-stack)
- [Roles & permissions](#roles--permissions)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [Database](#database)
- [API overview](#api-overview)
- [Frontend routes](#frontend-routes)
- [Client state & persistence](#client-state--persistence)
- [Fees: GST + delivery](#fees-gst--delivery)
- [Real-time refresh (SSE)](#real-time-refresh-sse)
- [Uploads (Openinary proxy)](#uploads-openinary-proxy)
- [Maps, geolocation & pincodes](#maps-geolocation--pincodes)
- [PWA install prompt](#pwa-install-prompt)
- [Seeding & migrations](#seeding--migrations)
- [Known gaps / notes](#known-gaps--notes)

---

## Repo structure

```
.
├─ README.md
└─ project/
	 ├─ app/                      # Next.js App Router pages + API routes
	 │  ├─ api/                   # Backend (route handlers)
	 │  ├─ admin/                 # Admin portal page
	 │  ├─ cart/                  # Cart + checkout
	 │  ├─ dashboard/             # Provider dashboard
	 │  ├─ delivery/              # Delivery partner dashboard
	 │  ├─ login/                 # Login page
	 │  ├─ orders/                # Customer orders page
	 │  ├─ profile/               # Profile + (mobile) address book entry point
	 │  ├─ provider/[id]/         # Public kitchen page + menu + add-to-cart
	 │  └─ register/              # Register page (customer/provider/delivery)
	 ├─ components/               # UI components
	 ├─ context/                  # Auth + Cart providers
	 ├─ db/migrations/            # SQL migrations
	 ├─ hooks/                    # Client hooks (SSE refresh, PWA install prompt)
	 ├─ lib/                      # Server/client shared helpers
	 ├─ public/                   # PWA manifest + icons
	 ├─ scripts/                  # Node scripts (DB seed)
	 ├─ next.config.mjs
	 ├─ package.json
	 └─ ...
```

Path alias:

- `@/*` maps to `project/*` (see `project/jsconfig.json`).

---

## Tech stack

- **Next.js 15.x** (App Router)
- **React 19.x**
- **PostgreSQL** via `pg` Pool
- **JWT auth** (`jsonwebtoken`) with `Authorization: Bearer <token>`
- **Tailwind CSS v4** (via PostCSS)
- **Recharts** for admin analytics charts
- **Leaflet + React-Leaflet** for address selection map
- **Lucide** icons

---

## Roles & permissions

The app is role-based. Role is stored on the user row and also embedded inside the JWT.

Roles used in code:

- `customer`
- `provider`
- `delivery_partner`
- `admin`

Where role checks happen:

- Server helpers in `project/lib/auth.js`:
  - `getAuth(request)` parses the `Authorization` header
  - `checkRole(payload, ...roles)` returns a 403 if the JWT role is not allowed

Client behavior:

- On login/register, the UI redirects based on role:
  - `provider` → `/dashboard`
  - `delivery_partner` → `/delivery`
  - `customer` → `/`

---

## Run locally

From the repo root:

```bash
cd project
npm install
npm run dev
```

Build:

```bash
cd project
npm run build
npm run start
```

---

## Environment variables

Create `project/.env.local` (Next.js reads this automatically).

### Required

- `DATABASE_URL`
  - Postgres connection string.
  - Used by `project/lib/db.js`.

- `JWT_SECRET`
  - Used to sign/verify JWTs in `project/lib/auth.js`.

### Admin portal

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Used by `POST /api/admin/login`.

### Uploads (Openinary)

- `OPENINARY_BASE_URL`
  - Example format: `https://openinary.example.com`
- `OPENINARY_API_KEY`
  - Sent as `Authorization: ApiKey <key>` to Openinary.

### Client-side image URL helper

- `NEXT_PUBLIC_OPENINARY_BASE_URL` (optional)
  - Used by `project/lib/api.js` `imgUrl()`.
  - Defaults to `https://openinary.adityaraj.codes` if not set.

---

## Database

### Connection

DB access is via a singleton `pg.Pool` in `project/lib/db.js` to avoid creating too many connections during Next.js hot reloads.

The pool is created with:

- `connectionString: process.env.DATABASE_URL`
- `ssl: { rejectUnauthorized: false }`
- `max: 10`

### Expected tables (minimum schema)

This repo doesn’t include full `CREATE TABLE` migrations, but the API routes expect at least the following tables/columns.

**users**

- `id` (string/uuid)
- `name`, `email`, `password_hash`, `phone`, `role`
- optional: `avatar_url`
- timestamps: `created_at`

**providers**

- `id`, `user_id`
- `kitchen_name`, `description`, `location`, `city`, `address`, `phone`
- image: `cover_image_url`, `cover_image_id`
- flags: `is_veg`, `is_nonveg`, `is_verified`, `is_active`
- metadata: `price_from`, `delivery_time`, `rating`, `total_orders`
- timestamps: `created_at`, `updated_at`

**menu_items**

- `id`, `provider_id`
- `name`, `description`, `price`
- image: `image_url`, `image_id`
- `is_veg`, `is_available`, `category`

**orders**

- `id`, `customer_id`, `provider_id`
- `total_amount`
- `delivery_address`, `notes`
- `status` (see statuses below)
- timestamps: `created_at`, `updated_at`

**order_items**

- `id`, `order_id`, `menu_item_id`
- denormalized item snapshot: `name`, `price`
- `quantity`

### Order statuses

Used in `project/app/api/orders/[id]/status/route.js`:

```
pending
confirmed
preparing
out_for_delivery
delivered
cancelled
```

Rules:

- Customers can only set status to `cancelled`, and only while the order is still `pending`.
- Providers can update statuses for orders belonging to their provider profile.
- Admin can update any order.

---

## API overview

All backend endpoints are implemented as Next.js route handlers under `project/app/api/**/route.js`.

Auth convention:

- Most protected routes require `Authorization: Bearer <JWT>`.
- The client stores JWTs in `localStorage` and sends them via `project/lib/api.js`.

### Auth

- `POST /api/auth/register`
  - Body: `{ name, email, password, phone?, role? }`
  - `role` allowed: `customer | provider | delivery_partner`
  - Returns: `{ token, user }`

- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `GET /api/auth/me`
  - Returns current user from JWT.
  - Special case: if JWT role is `admin`, returns a synthetic admin user `{ id: 'admin', ... }`.

- `PATCH /api/auth/me`
  - Profile update: `{ name?, phone?, avatar_url? }`
  - Password change: `{ current_password, new_password }`

### Providers

- `GET /api/providers?city=&search=&veg=&nonveg=`
  - Public listing with filters.
  - `city` and `search` are `ILIKE` matches.
  - Enforces `p.is_active = TRUE`.

- `POST /api/providers` (provider/admin)
  - Create provider profile (1 per user).

- `GET /api/providers/:id` (public)
  - Fetch a provider profile.

- `PUT /api/providers/:id` (provider owner/admin)
- `DELETE /api/providers/:id` (provider owner/admin)

- `GET /api/providers/me/profile` (provider/admin)
  - Fetch the provider record for the logged-in provider user.

### Menu items

- `GET /api/providers/:id/menu` (public)
  - List menu items for a provider.

- `POST /api/providers/:id/menu` (provider owner/admin)
  - Add a menu item.

- `PUT /api/menu/:id` (provider owner/admin)
- `DELETE /api/menu/:id` (provider owner/admin)

### Orders

- `POST /api/orders` (customer/admin)
  - Body: `{ provider_id, delivery_address, notes?, items: [{ menu_item_id, quantity }] }`
  - Validates menu items are available, computes totals, inserts into `orders` + `order_items` in a transaction.

- `GET /api/orders` (customer/provider/admin/delivery_partner)
  - Returns different views depending on role:
    - customer: their orders
    - provider: orders for their provider profile
    - delivery_partner: orders in active statuses (pending → out_for_delivery)
    - admin: all orders

- `PUT /api/orders/:id/status` (customer/provider/admin)
  - Body: `{ status }`
  - Enforces allowed transitions for customers.

### Delivery partner

- `GET /api/delivery/orders` (delivery_partner)
  - Returns orders with statuses: `pending | confirmed | preparing | out_for_delivery`.

### Admin

- `POST /api/admin/login`
  - Server-side credential check using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
  - Returns: `{ token, user }`.

- `GET /api/admin/data` (admin)
  - Returns:
    - `users` (last 200)
    - `providers` (last 200)
    - `orders` (last 200)
    - `summary` stats (sales/orders/providers/customers)

### Real-time refresh

- `GET /api/refresh`
  - Server-Sent Events endpoint that emits `event: refresh` every 2 seconds.

### Geo helpers

- `GET /api/geo/reverse?lat=&lon=`
  - Calls OpenStreetMap Nominatim reverse geocoding and returns `{ city, raw }`.

### Uploads

- `POST /api/upload` (auth required)
  - Forwards multipart uploads to Openinary.

- `DELETE /api/upload/:id` (auth required)
  - Forwards delete to Openinary.

---

## Frontend routes

These are the main user-facing pages under `project/app/`:

- `/` — Home
  - City dropdown (top 10 supported cities)
  - “Use location” → reverse geocode via `/api/geo/reverse`
  - Provider listing calls `/api/providers`
  - Includes a subscription-style pricing section with duration toggle

- `/provider/[id]` — Kitchen page
  - Fetch provider + menu from `/api/providers/:id` + `/api/providers/:id/menu`
  - Add/remove items using cart context

- `/cart` — Cart + checkout
  - Checkout posts to `POST /api/orders`
  - Shows fee breakdown (subtotal + GST + delivery)
  - Can pre-fill/select saved addresses from local storage

- `/orders` — Customer orders
  - Lists orders (customer view) using `GET /api/orders`
  - Allows customer cancel while `pending`

- `/dashboard` — Provider dashboard
  - Tabs: Kitchen, Menu, Orders
  - Uses `/api/providers/me/profile`, `/api/providers/:id/menu`, `/api/orders`
  - Uploads images via `/api/upload`
  - Updates order status via `/api/orders/:id/status`

- `/delivery` — Delivery partner dashboard
  - Loads available orders from `GET /api/delivery/orders`

- `/admin` — Admin portal
  - Admin login → `POST /api/admin/login`
  - Loads data → `GET /api/admin/data`
  - Analytics charts built with Recharts

- `/login`, `/register`, `/profile`
  - Auth and profile management

---

## Client state & persistence

### Auth tokens

Stored in `localStorage`:

- `mm_token` — regular user JWT
- `mm_admin_token` — admin JWT

Admin UX note:

- Admin mode removes `mm_token` to avoid conflicting sessions.
- `AuthContext` will temporarily swap the admin token into `mm_token` when calling `/api/auth/me`.

### Cart

Implemented in `project/context/CartContext.jsx` and persisted to:

- `mm_cart_v1`

Cart shape:

```json
{
  "provider": {
    "id": "...",
    "kitchen_name": "...",
    "location": "...",
    "cover_image_url": "..."
  },
  "items": {
    "<menu_item_id>": {
      "qty": 2,
      "item": {
        "id": "...",
        "name": "...",
        "price": 99,
        "image_url": null,
        "is_veg": true
      }
    }
  },
  "deliveryAddress": "...",
  "notes": "..."
}
```

Important behavior:

- **Single-kitchen cart**: adding an item from a different kitchen prompts to clear the cart.

### Address book (client-side)

Addresses are stored locally (not in DB):

- `mm_addresses` — object keyed by `user.id` → `Address[]`
- `mm_selected_address` — `{ userId, address }`

Address objects are created/managed by `project/components/AddressBook.jsx` and can be selected inside the cart page.

PWA keys:

- `mm_pwa_dismiss_until`
- `mm_pwa_installed`

---

## Fees: GST + delivery

Centralized in `project/lib/fees.js`:

- `GST_RATE = 0.05`
- `DELIVERY_FEE = 30`
- `computeFees(subtotal)` returns `{ subtotal, gstAmount, deliveryFee, grandTotal }`

Used in:

- UI: cart totals + sticky totals
- Server: `POST /api/orders` stores `grandTotal` into `orders.total_amount`

---

## Real-time refresh (SSE)

Instead of WebSockets, the app uses Server-Sent Events:

- `/api/refresh` emits a `refresh` event every 2 seconds.
- `project/hooks/useAutoRefresh.js` opens an `EventSource` and calls the provided callback on each event.

This is used to keep provider dashboards / order lists updated without manual refresh.

---

## Uploads (Openinary proxy)

Uploads are proxied through Next.js API routes:

- `POST /api/upload` forwards to `${OPENINARY_BASE_URL}/api/upload`
- `DELETE /api/upload/:id` forwards to `${OPENINARY_BASE_URL}/api/asset/:id`

Client helpers:

- `project/lib/api.js` exports `upload.file(file, folder)` and `upload.deleteAsset(id)`.

Images:

- Next Image remote patterns allow `openinary.adityaraj.codes` in `project/next.config.mjs`.

---

## Maps, geolocation & pincodes

Address book capabilities:

- Map selection using Leaflet (`react-leaflet`)
- “Use My Location” uses browser geolocation
- Reverse geocoding uses OpenStreetMap Nominatim
- Pincode lookup uses `https://api.postalpincode.in/pincode/<PIN>` to fill city/state

City detection on the home page uses the app’s own endpoint:

- `/api/geo/reverse?lat=&lon=` → `{ city }`

Note: the home page only supports a fixed dropdown of 10 cities; if detected city is outside this list, it shows an error.

---

## PWA install prompt

PWA metadata:

- `project/public/manifest.json`

Install UX:

- `project/hooks/useInstallPrompt.js` listens for `beforeinstallprompt` and exposes `install()`.
- `project/components/InstallBanner.jsx` shows a dismissible banner.

---

## Seeding & migrations

### Seed providers across top cities

Script: `project/scripts/seed-top-cities.js`

What it does:

- Creates provider-owner users (`role='provider'`) idempotently by email
- Ensures **2 providers per city** (top 10 cities)
- Seeds menu items for each provider if none exist
- Uses default password: `password123` for seeded provider users

Run:

```bash
cd project
DATABASE_URL="..." npm run seed:top-cities
```

### Migration: add delivery partner role

Migration file: `project/db/migrations/20260403_add_delivery_partner_role.sql`

Purpose:

- Updates the Postgres `users_role_check` constraint to allow `delivery_partner`.

---

## Known gaps / notes

- The navbar contains a “Settings” link (`/settings`), but there is no corresponding page in this repo (will 404).
- Customer addresses are stored in `localStorage` only (no server persistence yet).
- Search input in the desktop navbar is currently UI-only; provider search/filtering is implemented on the home page via `/api/providers?search=`.

---

## Scripts

From `project/package.json`:

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run dev:turbo` — dev server with Turbopack
- `npm run seed:top-cities` — seed sample data across top cities
