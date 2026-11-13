# Vespera Beauty — Luxury Cosmetics E-Commerce Storefront

A responsive luxury cosmetics, skincare, lipstick, and fragrance e-commerce store built with **React**, **TypeScript**, **Tailwind CSS v4**, **Vite**, and **Supabase** (PostgreSQL + Row Level Security + RPCs).

---

## Store Highlights

- **Luxury Beauty Theme**: Soft Blush Pink (`#FCE4EC`), Warm Cream (`#FFF4E8`), Deep Plum (`#51243A`) Header & Footer, Rose Pink (`#D85B83`) CTAs, Champagne Gold (`#C6A15B`) accents, Ivory (`#FFFDF9`) product cards, and Dark Brown (`#38252D`) typography.
- **20 Categories & 99 Products**: Full Makeup, Skincare, and Fragrance & Body Care catalog priced in Pakistani Rupees (**PKR**) with 99 distinct studio product images.
- **18 Complete Pages**: Home, Shop All, Makeup Collection, Skincare Collection, Lipstick Collection, Perfume Collection, New Arrivals, Best Sellers, Product Details, Beauty Image Gallery, Wishlist, Shopping Cart, Checkout, My Orders, About Us, Contact Us, Privacy Policy, and Terms & Conditions.
- **Supabase Database Integration**:
  - `categories`, `products`, `customers`, `orders` (plus `contact_messages` & `newsletter_subscribers`).
  - Transactional `create_customer_order` RPC validates stock, records customer records, creates orders, and decrements stock atomically.
  - `lookup_customer_order` & `lookup_customer_orders_by_phone` RPCs power real order history & tracking.

---

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase Database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query** in your Supabase dashboard.
3. Paste the entire contents of `supabase/schema.sql` and click **Run**.

### 3. Add Environment Variables

Create a `.env` file in the root directory (excluded from Git via `.gitignore`):

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

> Locate both keys in Supabase under **Project Settings → API** (`Project URL` and `anon` `public` key). Never expose `service_role` in frontend code.

### 4. Run Development Server & Build Check

```bash
npm run dev
npm run lint
npm run build
```

---

## GitHub & Vercel Deployment

1. Push the project to GitHub (`git init`, `git add .`, `git commit`, `git push`). Verify `.env` is ignored.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Framework: **Vite** (`npm run build`, output directory: `dist`). `vercel.json` handles SPA routing for all pages.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Vercel **Environment Variables**, then click **Deploy**.
