# Shopperz

Shopperz is a React + Vite multi-role marketplace prototype built for demos, capstone showcases, and frontend ecommerce workflows. It combines buyer product discovery, seller storefront management, admin approval flows, Firebase-backed authentication and data sync, and an AI shopping assistant.

## What The System Does

Shopperz supports three main roles:

- Buyers can browse products as guests, then sign in to place orders, save items, compare products, chat about listings, and track order progress.
- Sellers can request approval, manage a storefront, create and update listings, and move customer orders through the dispatch lifecycle.
- Admins can review seller applications and approve or reject access to the marketplace.

## Core Features

- Product browsing with search and category filtering
- Guest browsing with account-gated actions like buying and wishlist saving
- Featured listings with category-aware product highlights
- Product detail pages with reviews, seller context, buyer chat, and AI assistance
- Wishlist and side-by-side comparison flows
- Seller onboarding request flow with admin approval
- Seller storefront pages with product CRUD tools
- Buyer purchase flow with quantity, location, pickup area, payment method, and delivery notes
- Buyer order tracking with live seller-driven status progression
- Seller order management across `Pending`, `Accepted`, `Preparing`, `Dispatched`, `Delivered`, and `Completed`
- Automatic stock reservation on order placement and stock deduction at seller acceptance
- Firebase Firestore sync for products, seller requests, orders, messages, notifications, and sellers
- Dashboard, updates, and notification views scoped to the signed-in user

## Category-Specific Product Inputs

When a seller posts or edits a product, the form changes based on the chosen category so the seller only enters relevant attributes. Those attributes are then reused in featured listings, product pages, and comparison views.

Supported categories:

- `Phones`
- `Laptops`
- `Audio`
- `Wearables`
- `Gaming`
- `Home Office`
- `Clothes`
- `Handbags`
- `Shoes`
- `Appliances`

Examples of category-specific fields:

- `Phones`: display, processor, RAM, storage
- `Laptops`: screen size, processor, RAM, storage
- `Clothes`: clothing type, size, material, color
- `Handbags`: material, dimensions, compartments, strap type
- `Appliances`: power rating, capacity, dimensions, warranty

## Order And Tracking Flow

The purchase and fulfilment flow is designed around seller updates and buyer visibility.

1. A buyer places an order from the product page.
2. The system creates a `Pending` order and reserves stock.
3. The seller accepts the order and starts dispatch.
4. The seller continues updating the order through `Preparing`, `Dispatched`, `Delivered`, and `Completed`.
5. The buyer sees those status changes in their order views and updates page.
6. Firestore stores the latest order status so both the seller side and buyer side stay aligned.

Buyers can cancel an order only before it reaches `Dispatched`.

## Data And Persistence

The app uses a hybrid demo-friendly persistence model:

- Firebase Auth handles sign up and sign in
- Firestore stores marketplace data such as products, orders, seller requests, messages, notifications, and sellers
- `localStorage` preserves local UI state and fallback demo continuity

This makes the project presentation-friendly while still supporting a realistic backend sync path.

## Tech Stack

- React 19
- Vite
- React Router
- Firebase Auth
- Firebase Firestore
- Browser `localStorage`

## Authentication And Roles

- Standard users can create an account or sign in
- Guests can browse products without signing in
- Buying, saving to wishlist, and seller application actions require an account
- Approved seller requests upgrade a buyer into a seller profile
- Admin access is available through the auth flow
- Demo admin credentials:
  `admin@shopperz.local` / `Admin123!`

## AI Assistant

The AI assistant on the product page uses:

- buyer profile information
- product details and highlights
- the active user prompt

It runs in two modes:

- Demo fallback mode when no endpoint is configured
- Live API mode when `VITE_AI_ENDPOINT` is provided

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Environment Variables

Copy `.env.example` into `.env.local` if you want to enable Firebase or connect a live AI service.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_AI_ENDPOINT=
VITE_AI_AUTH_TOKEN=
```

## Main Routes

- `/` - Home page with featured listings and seller highlights
- `/products/:productId` - Product details, AI assistant, reviews, chat, and ordering
- `/wishlist` - Saved products
- `/compare` - Side-by-side comparison
- `/messages` - User-scoped order tracking, product conversation updates, and AI suggestions
- `/notifications` - Recent system and marketplace updates
- `/dashboard` - Buyer or seller dashboard
- `/sellers/:sellerId` - Seller storefront, product management, and seller order controls
- `/seller-request` - Seller application flow
- `/admin` - Seller approval dashboard
- `/auth` - Sign in and sign up

## Notes

- `dist/` is generated output and should not be edited manually
- `.env.local` should not be committed
- Firestore rules must allow the intended reads and writes for your environment
