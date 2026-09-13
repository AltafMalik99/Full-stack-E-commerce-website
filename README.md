# SHOP.CO — Full-Stack E-Commerce + Admin Panel

A complete full-stack e-commerce web application with an integrated, professional **Admin Panel** — built with **React (Vite) + Tailwind CSS + Redux Toolkit** on the frontend, **Node.js + Express + MongoDB (Mongoose)** on the backend, and **Multer** for image uploads.

The customer website and the admin panel share the **same backend and the same MongoDB database** — the same products, customers and orders that customers create/see are exactly what the admin manages.

---

## Features

### Customer Website
- Home page, category browsing, search, filter, sort
- Product detail page with quantity selector and related products
- Fully working cart (add / remove / update quantity / totals)
- Registration & login with hashed passwords (bcryptjs) and JWT auth (HTTP-only cookie + bearer fallback)
- Protected checkout flow with a full order invoice/bill on success
- Product reviews (submitted by customers, shown once approved by an admin)
- Loading, error, and empty states throughout; fully responsive

### Admin Panel (`/admin`)
- Secure admin-only login and role-based access control (`role: "admin"` vs `"user"`) — normal customers are shown "Access Denied" if they try to reach `/admin`
- **Dashboard** — real-time stats from MongoDB: revenue, orders by status, low-stock alerts, sales chart (last 12 months), top-selling products, recent orders/customers, quick actions
- **Products** — full CRUD with image upload (Multer), search, category/status filters, sorting
- **Categories** — full CRUD with image upload
- **Orders** — view full order details, filter by status/date, update order status
- **Customers** — view registration date, total orders, total spend; block/unblock accounts
- **Inventory** — stock overview, low-stock/out-of-stock filters, quick stock adjustment
- **Reviews** — approve or delete customer-submitted reviews
- **Coupons** — full CRUD (code, discount %, min order amount, expiry, active/inactive)
- **Customer Service** — view and triage contact/support messages (New / In Progress / Resolved)
- **Notifications** — real events: new order, new customer, low stock, new message, cancelled order
- **Analytics** — today/week/month sales, new customers, best-selling products chart
- **Settings** — store name, contact info, currency, shipping charge, min order amount
- **Admin Profile** — update name/email/photo, change password
- Confirmation dialogs before every delete/logout action; success toasts after key actions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend (customer) | React, Vite, React Router DOM, Redux Toolkit, Context API, Axios, plain CSS |
| Frontend (admin) | React, Tailwind CSS, Recharts (charts) |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs, Multer, Helmet, CORS, Morgan |
| Database | MongoDB (via Mongoose) |
| Image storage | Multer → `backend/uploads/`, served at `/uploads/*` |

> Tailwind is scoped to the admin panel only (`corePlugins.preflight: false`), so it never overrides the customer site's existing hand-written CSS.

---

## Folder Structure

```text
ecommerce-project/
├── frontend/
│   ├── src/
│   │   ├── components/        Customer-facing shared components
│   │   ├── pages/              Customer-facing pages (Home, Cart, Login, Checkout...)
│   │   ├── layouts/            CustomerLayout.jsx (navbar + footer wrapper)
│   │   ├── admin/               ADMIN PANEL
│   │   │   ├── layouts/         AdminLayout.jsx (sidebar + topbar wrapper)
│   │   │   ├── components/      Sidebar, Topbar, StatCard, Modal, PageHeader...
│   │   │   ├── pages/           Dashboard, Products, Categories, Orders, Customers,
│   │   │   │                    Inventory, Reviews, Coupons, CustomerService,
│   │   │   │                    Notifications, Analytics, Settings, AdminProfile, AdminLogin
│   │   │   └── admin.css        Tailwind entry (admin panel only)
│   │   ├── redux/               store.js, productSlice, cartSlice, authSlice, orderSlice
│   │   ├── context/             AuthContext.jsx (adds isAdmin)
│   │   ├── services/            api.js (axios instance), adminApi.js (all /api/admin calls)
│   │   ├── routes/              ProtectedRoute.jsx, AdminProtectedRoute.jsx
│   │   ├── App.jsx, main.jsx, index.css
│   ├── tailwind.config.js, postcss.config.js
│   └── package.json
│
├── backend/
│   ├── config/db.js             MongoDB connection
│   ├── models/                  User, Product, Category, Order, Review, Coupon,
│   │                            Notification, Contact, StoreSettings
│   ├── controllers/              auth, product, category, order, user, coupon,
│   │                              review, contact, notification, settings, profile, dashboard
│   ├── routes/                   authRoutes, productRoutes, categoryRoutes, orderRoutes,
│   │                              contactRoutes, couponRoutes, adminRoutes (all /api/admin/*)
│   ├── middleware/               authMiddleware (protect + adminOnly), uploadMiddleware (Multer),
│   │                              errorMiddleware, validationMiddleware
│   ├── uploads/                  Uploaded product/category/profile images
│   ├── seed/seedAdmin.js         Creates the first admin user + sample data
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

---

## Getting Started (Local Development)

### 1. MongoDB

Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), or run MongoDB locally. You'll need a connection string like:

```text
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ecommerce?retryWrites=true&w=majority
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in:
- `MONGODB_URI` — your connection string from step 1
- `JWT_SECRET` — any long random string

Then seed the first admin account + sample categories/products:

```bash
npm run seed:admin
```

This prints the admin email/password to the console (defaults to `admin@shop.co` / `Admin@123` unless you set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` in `.env`).

Start the server:

```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```

API runs at **http://localhost:5000**. Check `http://localhost:5000/api/health`.

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at **http://localhost:5173**.

### 4. Try it out

- **Customer site:** `http://localhost:5173` — register, browse, add to cart, checkout
- **Admin panel:** `http://localhost:5173/admin/login` — log in with the seeded admin credentials
- Try adding a product with an image in the admin panel, then see it appear instantly on the customer site
- Register a new customer account on the customer site, then check the admin's Customers page — same MongoDB database, same data

---

## Environment Variables

**`backend/.env`**

| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on (default `5000`) |
| `MONGODB_URI` | Your MongoDB Atlas (or local) connection string |
| `JWT_SECRET` | Secret used to sign JWTs — change this |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `NODE_ENV` | `development` or `production` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Used only by `npm run seed:admin` |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

---

## API Overview

### Customer-facing (public / customer-protected)
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/products`, `GET /api/products/:id`
- `GET /api/products/:id/reviews`, `POST /api/products/:id/reviews` (protected)
- `GET /api/categories`
- `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders` (protected)
- `POST /api/contact`
- `POST /api/coupons/validate`

### Admin-only (`/api/admin/*`, requires `protect` + `adminOnly`)
- `GET /api/admin/dashboard`, `/dashboard/sales-overview`, `/dashboard/top-products`, `/dashboard/analytics`
- `GET|POST /api/admin/products`, `PUT|DELETE /api/admin/products/:id`, `PATCH /api/admin/products/:id/stock`
- `GET|POST /api/admin/categories`, `PUT|DELETE /api/admin/categories/:id`
- `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `PUT /api/admin/orders/:id/status`
- `GET /api/admin/users`, `GET /api/admin/users/:id`, `PUT /api/admin/users/:id/block|unblock`
- `GET|POST /api/admin/coupons`, `PUT|DELETE /api/admin/coupons/:id`
- `GET /api/admin/reviews`, `PUT /api/admin/reviews/:id/approve`, `DELETE /api/admin/reviews/:id`
- `GET /api/admin/contacts`, `PUT /api/admin/contacts/:id/status`
- `GET /api/admin/notifications`, `PUT /api/admin/notifications/:id/read`, `PUT /api/admin/notifications/read-all`
- `GET|PUT /api/admin/settings`
- `PUT /api/admin/profile`, `PUT /api/admin/profile/password`

Product/category create & update accept `multipart/form-data` (the image file goes in a field named `image`).

---

## Security Notes

- Passwords are hashed with bcryptjs — never stored or returned in plain text (`User.toSafeObject()` strips the password field from every API response).
- JWTs are set as HTTP-only cookies, with a bearer-token fallback for cross-site environments.
- Every `/api/admin/*` route requires a valid JWT **and** `role: "admin"` on the account — verified server-side in `middleware/authMiddleware.js`, never trusted from the frontend alone.
- Multer validates file type (JPEG/PNG/WEBP/GIF only) and caps uploads at 5MB.
- `.env` is git-ignored; use `.env.example` as the template.

---

## Deployment

### Database → MongoDB Atlas
Create a free cluster, add a database user, whitelist `0.0.0.0/0` (or your host's IP) under Network Access, and copy the connection string into `MONGODB_URI`.

### Backend → Render (or Railway / Fly.io)
1. Push this repo to GitHub.
2. New Web Service → connect the repo → **Root Directory:** `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Environment variables: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your Vercel URL), `NODE_ENV=production`.
5. After first deploy, run `npm run seed:admin` once (via Render's shell) to create your admin account in the production database.

> ⚠️ Uploaded images are stored on local disk (`backend/uploads/`). Most free hosts have an **ephemeral filesystem** — uploaded files may be lost on redeploy/restart. This is fine for coursework/demo purposes. For a fully persistent production setup, swap the Multer disk storage for a cloud storage provider (e.g. Cloudinary, S3) later — the upload middleware is isolated in `middleware/uploadMiddleware.js` so this is a contained change.

### Frontend → Vercel
1. New Project → import the repo → **Root Directory:** `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Environment variable: `VITE_API_URL=https://your-api.onrender.com/api`.
4. Deploy, then go back to the backend's `CLIENT_URL` env var and set it to this Vercel URL, redeploy the backend so CORS allows it.

---

## Testing Checklist

**Customer:** Signup → Login → Browse/Search/Filter → Add to Cart → Checkout → View Invoice
**Admin:** Admin Login → Dashboard loads real numbers → Add Product (with image) → Edit Product → Delete Product (with confirm) → Manage Categories → View Orders → Update Order Status → View Customers → Block/Unblock → Manage Coupons → Approve/Delete Reviews → View Analytics
**Cross-check:** A product added in the admin panel appears immediately on the customer site; an order placed by a customer appears immediately in the admin's Orders and Dashboard.

---

## Notes

- This project was written and syntax/import-validated in a sandboxed environment without internet access, so `npm install` could not be run there. All backend files pass `node --check`, and every import/export pair across both frontend and backend was cross-verified programmatically. Please run `npm install` locally and test end-to-end — if anything errors out, share the message and it can be fixed quickly.
