# 👟 Money's Outlet — Premium Sneakers & Streetwear Boutique

<div align="center">

![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react&logoColor=61DAFB)
![Prisma 7](https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Neon PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)
![Auth.js v5](https://img.shields.io/badge/Auth.js-v5_Beta-purple?style=for-the-badge&logo=auth0&logoColor=white)
![Vercel Blob](https://img.shields.io/badge/Vercel-Blob_Storage-black?style=for-the-badge&logo=vercel&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**An ultra-responsive, full-stack luxury e-commerce platform built for hypebeasts and sneaker enthusiasts.**

[Features](#-key-features) • [Tech Stack](#-modern-tech-stack) • [Getting Started](#-getting-started) • [Database & Seed](#-database-schema--seed-data) • [Admin Portal](#-admin-portal) • [Deployment](#-deployment)

</div>

---

## 🌟 Overview

**Money's Outlet** is a modern, high-performance boutique web application engineered with **Next.js 16 (App Router)** and **React 19**. Designed with a sleek, dark-mode luxury aesthetic, glassmorphic UI components, and curated typography, the platform delivers an instantaneous shopping experience powered by **Next.js Server Actions**, **Prisma 7 with Neon serverless connection pooling**, and global edge asset delivery via **Vercel Blob**.

---

## ✨ Key Features

### 🛍️ Shopper Experience
- **Dynamic Brand Showcase**: High-res cutout interactive showcases for top brands including Air Jordan, Travis Scott, Yeezy, Nike, New Balance, Fear of God Essentials, and Supreme.
- **Product Filtering & Discovery**: Instant filtering by brand, category, price range, sizing, and stock availability with live search.
- **Product Modal & Detail View**: Multi-angle image galleries, authentic SKU details, live size selection, and stock checks.
- **Persistent Slide-Out Cart**: Real-time cart state with item quantity adjustment, shipping calculation, and dynamic threshold alerts.
- **Seamless Checkout Modal**: Multi-step checkout with simulated Card Payment, Bank Transfer, and Cash on Delivery (COD) options.
- **Order Tracking & Notifications**: Order reference generation with real-time status display and customer confirmation.
- **Optimized Media Delivery**: WebP and high-compression assets stored on Vercel Blob CDN with responsive image loading.

### 🛡️ Admin Management Suite (`/admin`)
- **Executive Analytics Dashboard**: Real-time metrics tracking total revenue, order count, active products, and low-inventory warnings.
- **Product & Inventory Manager**: Full CRUD operations for products with multi-size inventory matrices, tag management, and featured status toggles.
- **Media Upload Pipeline**: Direct-to-Vercel-Blob file uploads with automatic image optimization and CDN URL mapping.
- **Fulfillment & Order Tracker**: Manage order statuses from `PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED` with customer detail lookups.
- **Brand & Category Hub**: Manage store taxonomies, logos, and promotional hero banners.
- **Store Configuration**: Live control over flat-rate shipping fees, currency formats, and contact details.

---

## 🛠️ Modern Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Hybrid Server-Side Rendering (SSR) & Server Actions |
| **UI Library** | [React 19](https://react.dev/) | Concurrent rendering, Server Components, and Actions |
| **Database** | [Neon PostgreSQL](https://neon.tech/) | Serverless PostgreSQL with pooling and instant branching |
| **ORM** | [Prisma 7.10](https://www.prisma.io/) | Type-safe schema, migrations, and `@prisma/adapter-pg` driver |
| **Authentication** | [NextAuth (Auth.js v5)](https://authjs.dev/) | Role-based credential authentication (`ADMIN` / `USER`) |
| **Media Storage** | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) | Global CDN object storage for product images and brand logos |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Curated utility classes, glassmorphism, and micro-animations |
| **Icons & UI** | [Lucide React](https://lucide.dev/) + Radix UI | Accessible primitives and crisp vector iconography |
| **State & Fetching** | [Zustand](https://github.com/pmndrs/zustand) | Persistent client-side cart and global UI state |

---

## 📁 Project Architecture

```
moneys-outlet/
├── prisma/
│   ├── schema.prisma       # Prisma 7 database schema (User, Product, Brand, Order...)
│   └── seed.ts             # Comprehensive seed script with authentic sneakers & apparel
├── prisma.config.ts        # Prisma 7 configuration file with Neon connection resolution
├── public/
│   ├── images/             # Optimized local fallbacks, WebP hero, and brand cutouts
│   └── logos/              # Vector brand SVG assets (Jordan, Supreme, Essentials...)
├── src/
│   ├── actions/            # Next.js Server Actions (zero API-route boilerplate)
│   │   ├── brands.ts
│   │   ├── categories.ts
│   │   ├── contact.ts
│   │   ├── notifications.ts
│   │   ├── orders.ts
│   │   ├── products.ts
│   │   └── settings.ts
│   ├── app/                # Next.js App Router (Pages, Layouts & API Route Handlers)
│   │   ├── (storefront)/   # Customer-facing storefront routes
│   │   ├── admin/          # Protected Admin Control Center
│   │   └── api/            # NextAuth & Vercel Blob upload endpoints
│   ├── auth.ts             # Auth.js v5 credentials configuration
│   ├── auth.config.ts      # Edge-compatible Auth configuration
│   ├── components/         # Modular React components (Hero, CartDrawer, Modals...)
│   ├── lib/
│   │   ├── prisma.ts       # Singleton PrismaClient with @prisma/adapter-pg
│   │   ├── storage.ts      # Vercel Blob client and image fallback resolution
│   │   └── dataService.ts  # Fallback client adapter
│   └── views/              # Rich client-rendered views and admin dashboards
├── .env.example            # Documented environment variable template
└── next.config.ts          # Next.js configuration with remote image patterns
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL**: Neon DB connection string or local PostgreSQL instance

### 1. Clone the Repository

```bash
git clone https://github.com/overwatch-coder/moneys-outlet.git
cd moneys-outlet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment configuration file:

```bash
cp .env.example .env.local
```

Populate `.env.local` with your database and authentication credentials:

```env
# Database (Neon Serverless PostgreSQL connection string with SSL)
DATABASE_URL="postgresql://user:password@ep-your-endpoint-pooler.neon.tech/moneys_outlet?sslmode=require"

# NextAuth / Auth.js v5 Secret
AUTH_SECRET="your-generated-secret-key-here"
NEXTAUTH_SECRET="your-generated-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob (Required for media uploads in Admin)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxx"
```

> **Tip**: Generate a secure secret using `openssl rand -base64 32`.

### 4. Setup Database & Run Migrations

Synchronize the Prisma schema with your database:

```bash
npx prisma db push
```

Generate the Prisma Client:

```bash
npx prisma generate
```

Seed the database with default products, categories, brands, and the default admin user:

```bash
npx prisma db seed
```

### 5. Launch the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the storefront.

---

## 🗄️ Database Schema & Seed Data

The database schema models a complete high-street boutique operation:
- **`User`**: Role-based access (`CUSTOMER` and `ADMIN`) with bcrypt password hashing.
- **`Product`**: SKU, slug, pricing, stock, category/brand relations, size arrays, and gallery images.
- **`Brand` & `Category`**: Slugs, descriptions, logos, and hero banners.
- **`Order` & `OrderItem`**: Full checkout lifecycle, shipping addresses, customer contact, and payment status.
- **`StoreSetting`**: Dynamic key-value store configurations (e.g. shipping fees, tax rates).
- **`ContactMessage` & `Notification`**: Customer inquiry messaging and admin notifications.

### Default Admin Credentials

When the seed script runs, an administrative account is provisioned:

| Field | Value |
| :--- | :--- |
| **Email** | `admin@moneysoutlet.com` |
| **Password** | `admin123456` |
| **Admin Route** | `/admin/login` |

---

## 🖥️ Admin Portal

Access the portal by navigating to `/admin/login`. Once authenticated, administrators have access to:

1. **Dashboard** (`/admin/dashboard`): Visual revenue summary, order velocity, and recent transactions.
2. **Products** (`/admin/products`): Add new sneakers/apparel, upload photography directly to Vercel Blob, edit pricing, and adjust stock by size.
3. **Orders** (`/admin/orders`): Review orders, update fulfillment statuses, and examine customer notes.
4. **Brands & Categories** (`/admin/brands`, `/admin/categories`): Manage brand logos, descriptions, and category hierarchies.
5. **Messages** (`/admin/messages`): Review and respond to inquiries submitted via the customer contact form.
6. **Store Settings** (`/admin/settings`): Configure delivery charges and operational contact details.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with hot module reloading |
| `npm run build` | Generates the Prisma client and compiles the production Next.js build |
| `npm run start` | Boots the compiled Next.js production server |
| `npm run lint` | Runs ESLint across the codebase |
| `npx prisma studio` | Launches the interactive Prisma Studio GUI to inspect database records |
| `npx prisma db seed` | Seeds Neon DB with authentic sneaker catalogue and admin account |

---

## ☁️ Deployment

### Deploying to Vercel

1. Push your repository to GitHub.
2. Import the repository into your [Vercel Dashboard](https://vercel.com/new).
3. In the project settings, configure the following **Environment Variables**:
   - `DATABASE_URL`: Your pooled Neon connection string.
   - `AUTH_SECRET`: Your production NextAuth secret.
   - `NEXTAUTH_URL`: Your production domain (e.g., `https://moneys-outlet.vercel.app`).
   - `BLOB_READ_WRITE_TOKEN`: Created automatically if you connect a Vercel Blob store under the **Storage** tab.
4. Deploy! Vercel automatically runs `prisma generate && next build`.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
