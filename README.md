# Shopperz

Shopperz is a frontend marketplace capstone built with React and Vite. It focuses on product discovery, buyer-seller interaction, saved shopping flows, and an AI-assisted product guidance experience.

The current version is intentionally frontend-first. Core user flows are implemented with mock data and local state so the app is easy to demo without requiring backend setup.

## Features

- Product browsing with search and category filtering
- Product detail pages with reviews and seller context
- Wishlist and product comparison flows
- Buyer-seller messaging UI
- Seller storefront pages
- User dashboard and notifications
- Mock sign-in and sign-up experience
- AI assistant panel on product pages
- Responsive pink, white, and orange themed interface

## Tech Stack

- React
- Vite
- React Router
- Firebase SDK scaffold

## Project Scope

This project is currently a frontend prototype:

- Authentication is mocked with local state
- Product, seller, review, and message data come from local mock data
- User state is persisted with `localStorage`
- Firebase is scaffolded for future integration
- The AI assistant supports a real endpoint if one is provided

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

Copy the values in `.env.example` into a `.env.local` file if you want to connect Firebase or a live AI endpoint.

Example:

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

## AI Assistant

The product-page assistant works in two modes:

- Demo fallback mode when no endpoint is configured
- Live endpoint mode when `VITE_AI_ENDPOINT` is set

The frontend sends product data, buyer profile data, and the user prompt to the configured endpoint.

## Firebase

Firebase setup is scaffolded in `src/lib/firebase.js` for future use with:

- Firebase Auth
- Firestore
- Firebase Storage

For the current capstone version, Firebase is optional and not required for the app to run.

## Main Pages

- `/` - Home and featured listings
- `/products/:productId` - Product details, AI assistant, and chat
- `/wishlist` - Saved products
- `/compare` - Product comparison
- `/messages` - Conversation threads
- `/notifications` - User updates
- `/dashboard` - User dashboard
- `/sellers/:sellerId` - Seller storefront
- `/auth` - Mock authentication page

## Notes

- `dist/` is ignored and not committed as source
- `.env.local` should not be committed
- The hero image is included locally in `src/assets/hero_1.jpg`

