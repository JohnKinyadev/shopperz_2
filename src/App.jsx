import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MarketplaceProvider } from "./context/MarketplaceContext";

const Layout = lazy(() => import("./components/Layout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SellerPage = lazy(() => import("./pages/SellerPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));

function App() {
  return (
    <MarketplaceProvider>
      <Suspense fallback={<div className="app-loading">Loading Shopperz...</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/products/:productId" element={<ProductPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/sellers/:sellerId" element={<SellerPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </MarketplaceProvider>
  );
}

export default App;
