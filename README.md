# Shopperz

Shopperz is a React + Vite marketplace prototype focused on product discovery, buyer-seller interaction, seller onboarding, and AI-assisted shopping guidance. It is designed for demos and capstone presentations, so the main flows work with local state and seeded data while still supporting optional Firebase authentication and an optional live AI endpoint.

## What The System Does

Shopperz supports three main roles:

- Buyers can browse products, filter by category, save items, compare up to three products, chat about products, and get AI buying guidance.
- Sellers can apply for storefront access, manage a store page, and post products with category-specific features.
- Admins can review seller applications and approve or reject access to the marketplace.

## Key Features

- Product browsing with search and category filtering
- Featured listings with category-aware product highlights
- Product detail pages with reviews, seller context, messaging, and AI assistance
- Wishlist and comparison flows for buyer shortlisting
- Buyer message threads and notification updates
- Dashboard for quick access to saved items, updates, and seller actions
- Sign up and sign in flow with Firebase Auth support
- Demo admin login for marketplace moderation
- Seller onboarding request flow with admin approval
- Seller storefront pages with posting tools and order-status controls
- Category-specific product input fields for `Phones`, `Audio`, `Wearables`, `Gaming`, and `Home Office`
- Posted product specs reused across featured listings, product pages, and comparison views
- Price input that accepts large values with comma formatting such as `1,200` or `12,500`
- Local persistence with `localStorage` for products, messages, notifications, seller requests, and user state

## Category-Specific Listing Inputs

When a seller posts a product, the form changes based on the selected category so the seller only fills in relevant features.

Examples:

- `Phones`: display, processor, RAM, storage
- `Audio`: type, connectivity, battery life, noise cancellation
- `Wearables`: type, water resistance, battery life, compatibility
- `Gaming`: platform, genre, players, release year
- `Home Office`: material, dimensions, weight, color

Those inputs are reused as listing highlights so featured cards and compare views show category-relevant information instead of only generic tags.

## Tech Stack

- React 19
- Vite
- React Router
- Firebase SDK
- Browser `localStorage`

## Project Behavior

This project is frontend-first, but it includes optional integration points:

- Buyer, seller, admin, product, review, and message flows are demo-ready with local state
- Firebase Auth can be enabled through environment variables
- The AI assistant can run in demo fallback mode or call a live endpoint
- Seller approval is handled inside the app through the admin page

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

## Authentication And Roles

- Standard users can create an account or sign in
- Approved seller requests upgrade a buyer into a seller profile
- Admin access is available through the demo login shortcut on the auth page
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

## Main Routes

- `/` - Home page with featured listings and seller highlights
- `/products/:productId` - Product details, AI assistant, reviews, and chat
- `/wishlist` - Saved products
- `/compare` - Side-by-side comparison
- `/messages` - Product conversation threads and AI suggestions
- `/notifications` - Recent system and marketplace updates
- `/dashboard` - Buyer or seller dashboard
- `/sellers/:sellerId` - Seller storefront and seller product management
- `/seller-request` - Seller application flow
- `/admin` - Seller approval dashboard
- `/auth` - Sign in and sign up

## Notes

- `dist/` is generated output and should not be edited manually
- `.env.local` should not be committed
- App state is persisted locally, so refreshing the browser keeps most demo actions
