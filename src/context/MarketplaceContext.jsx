import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  messages as initialMessages,
  notifications as initialNotifications,
  products as initialProducts,
  reviews,
  sellers as initialSellers,
} from "../data/mockData";
import { auth, firebaseReady } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

const STORAGE_KEY = "shopperz-state";
const ADMIN_EMAILS = ["admin@shopperz.local", "admin@shopperz.dev"];

const MarketplaceContext = createContext(null);

function loadStoredState() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function buildDefaultProfile() {
  return {
    name: "Amina Wanjiku",
    role: "Buyer",
    location: "Nairobi, Kenya",
    email: "amina@example.com",
    preference: "Compact devices, clean design, all-day battery",
  };
}

export function MarketplaceProvider({ children }) {
  const storedState = loadStoredState();
  const [savedItems, setSavedItems] = useState(storedState?.savedItems ?? ["p-1002", "p-1004"]);
  const [compareItems, setCompareItems] = useState(storedState?.compareItems ?? ["p-1001", "p-1002"]);
  const [messages, setMessages] = useState(storedState?.messages ?? initialMessages);
  const [notifications, setNotifications] = useState(
    storedState?.notifications ?? initialNotifications,
  );
  const [profile, setProfile] = useState(storedState?.profile ?? buildDefaultProfile());
  const [currentUser, setCurrentUser] = useState({
    isAuthenticated: false,
    mode: "signin",
    user: null,
    isAdmin: false,
  });
  const [products, setProducts] = useState(storedState?.products ?? initialProducts);
  const [sellers, setSellers] = useState(storedState?.sellers ?? initialSellers);
  const [orders, setOrders] = useState(storedState?.orders ?? []);
  const [sellerRequests, setSellerRequests] = useState(storedState?.sellerRequests ?? []);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!firebaseReady || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCurrentUser({
          isAuthenticated: false,
          mode: "signin",
          user: null,
          isAdmin: false,
        });
        return;
      }

      const isAdmin = ADMIN_EMAILS.includes(user.email);
      setCurrentUser({
        isAuthenticated: true,
        mode: "signin",
        user,
        isAdmin,
      });

      if (isAdmin) {
        setProfile({
          name: user.displayName || "Shopperz Admin",
          role: "Admin",
          location: "Head office",
          email: user.email,
          preference: "Approve sellers and manage the marketplace",
        });
        return;
      }

      const approvedRequest = sellerRequests.find(
        (request) => request.requesterEmail === user.email && request.status === "Approved",
      );

      if (approvedRequest) {
        setProfile({
          name: user.displayName || approvedRequest.storeName,
          role: "Seller",
          location: approvedRequest.location,
          email: user.email,
          preference: approvedRequest.responseTime,
          sellerId: approvedRequest.sellerId,
          sellerName: approvedRequest.storeName,
          responseTime: approvedRequest.responseTime,
        });
        setSellers((current) => {
          if (current.some((seller) => seller.id === approvedRequest.sellerId)) {
            return current;
          }
          return [...current, approvedRequest.sellerProfile];
        });
        return;
      }

      setProfile((current) => ({
        ...current,
        email: user.email,
        name: user.displayName || current.name,
      }));
    });

    return unsubscribe;
  }, [sellerRequests]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        compareItems,
        currentUser,
        messages,
        notifications,
        profile,
        savedItems,
        products,
        sellers,
        orders,
        sellerRequests,
      }),
    );
  }, [compareItems, currentUser, messages, notifications, profile, savedItems, products, sellers, orders, sellerRequests]);

  const unreadNotifications = notifications.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({
      products,
      sellers,
      reviews,
      messages,
      notifications,
      unreadNotifications,
      profile,
      savedItems,
      compareItems,
      currentUser,
      authError,
      toggleSavedItem(productId) {
        setSavedItems((current) =>
          current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [...current, productId],
        );
      },
      toggleCompareItem(productId) {
        setCompareItems((current) => {
          if (current.includes(productId)) {
            return current.filter((id) => id !== productId);
          }

          if (current.length >= 3) {
            return [...current.slice(1), productId];
          }

          return [...current, productId];
        });
      },
      sendMessage(productId, text) {
        const trimmed = text.trim();

        if (!trimmed) {
          return;
        }

        setMessages((current) => [
          ...current,
          {
            id: `msg-${Date.now()}`,
            productId,
            sender: "buyer",
            senderName: profile.name,
            time: "Just now",
            text: trimmed,
          },
        ]);

        setNotifications((current) => [
          {
            id: `notif-${Date.now()}`,
            type: "message",
            title: "Message sent",
            description: `You asked about ${products.find((item) => item.id === productId)?.name}.`,
            time: "Just now",
            read: false,
          },
          ...current,
        ]);
      },
      markNotificationRead(notificationId) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notificationId ? { ...item, read: true } : item,
          ),
        );
      },
      markAllNotificationsRead() {
        setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      },
      updateProfile(updates) {
        setProfile((current) => ({ ...current, ...updates }));
      },
      signIn: async (credentials) => {
        if (!firebaseReady || !auth) {
          setAuthError("Firebase not configured");
          return;
        }
        try {
          setAuthError(null);
          await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        } catch (error) {
          setAuthError(error.message);
        }
      },
      signUp: async (details) => {
        if (!firebaseReady || !auth) {
          setAuthError("Firebase not configured");
          return;
        }
        try {
          setAuthError(null);
          const userCredential = await createUserWithEmailAndPassword(auth, details.email, details.password);
          // Update profile with name
          setProfile({
            ...buildDefaultProfile(),
            name: details.name,
            email: details.email,
          });
        } catch (error) {
          setAuthError(error.message);
        }
      },
      becomeSeller: async (sellerDetails) => {
        if (!currentUser.isAuthenticated) {
          setAuthError("You must be signed in to become a seller.");
          return null;
        }

        if (currentUser.isAdmin) {
          setAuthError("Admin accounts cannot request seller approval.");
          return null;
        }

        if (profile.role === "Seller") {
          setAuthError("You are already a seller.");
          return null;
        }

        const existingRequest = sellerRequests.find(
          (request) => request.requesterEmail === currentUser.user.email && request.status === "Pending",
        );

        if (existingRequest) {
          setAuthError("You already have a pending seller request.");
          return null;
        }

        try {
          setAuthError(null);
          const normalizedId = sellerDetails.storeName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          const sellerId = `seller-${normalizedId || Date.now()}`;
          const requestId = `req-${Date.now()}`;
          const request = {
            id: requestId,
            sellerId,
            requesterId: currentUser.user.uid,
            requesterEmail: currentUser.user.email,
            storeName: sellerDetails.storeName,
            location: sellerDetails.location,
            responseTime: sellerDetails.responseTime || "Usually replies in 15 min",
            tagline: sellerDetails.tagline || "Local seller with fast response and great support.",
            coverImage:
              sellerDetails.coverImage ||
              "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
            status: "Pending",
            submittedAt: new Date().toISOString(),
          };

          setSellerRequests((current) => [...current, request]);
          return requestId;
        } catch (error) {
          setAuthError(error.message);
          return null;
        }
      },
      approveSellerRequest: (requestId) => {
        const request = sellerRequests.find((requestItem) => requestItem.id === requestId);
        if (!request) return;

        setSellerRequests((current) =>
          current.map((item) =>
            item.id === requestId ? { ...item, status: "Approved", reviewedAt: new Date().toISOString() } : item,
          ),
        );

        const approvedSeller = {
          id: request.sellerId,
          name: request.storeName,
          tagline: request.tagline,
          responseTime: request.responseTime,
          rating: 4.9,
          location: request.location,
          followers: 0,
          joined: new Date().getFullYear().toString(),
          coverImage: request.coverImage,
        };
        setSellers((current) => {
          if (current.some((seller) => seller.id === request.sellerId)) return current;
          return [...current, approvedSeller];
        });

        if (currentUser.user?.email === request.requesterEmail) {
          setProfile((current) => ({
            ...current,
            role: "Seller",
            sellerId: request.sellerId,
            sellerName: request.storeName,
            location: request.location,
            responseTime: request.responseTime,
          }));
        }
      },
      rejectSellerRequest: (requestId) => {
        setSellerRequests((current) =>
          current.map((request) =>
            request.id === requestId ? { ...request, status: "Rejected", reviewedAt: new Date().toISOString() } : request,
          ),
        );
      },
      sellerRequests,
      addProduct: (productData) => {
        if (profile.role !== "Seller" || !profile.sellerId) {
          setAuthError("Only sellers can add products.");
          return null;
        }

        const product = {
          ...productData,
          id: `p-${Date.now()}`,
          sellerId: profile.sellerId,
          seller: profile.sellerName || profile.name,
          sellerResponseTime: profile.responseTime || "Usually replies in 10 min",
          accent: "var(--tone-pink)",
          image: productData.image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
          price: Number(productData.price),
          stock: Number(productData.stock),
          tags: productData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          specs: productData.specs || {},
        };

        setProducts((current) => [...current, product]);
        return product.id;
      },
      updateOrderStatus: (orderId, status) => {
        setOrders((current) =>
          current.map((order) =>
            order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order,
          ),
        );
      },
      orders,
      signOut: async () => {
        if (!firebaseReady || !auth) return;
        try {
          await firebaseSignOut(auth);
        } catch (error) {
          console.error("Sign out error:", error);
        }
      },
      setAuthMode(mode) {
        setCurrentUser((current) => ({ ...current, mode }));
      },
    }),
    [
      compareItems,
      currentUser,
      messages,
      notifications,
      profile,
      savedItems,
      unreadNotifications,
      authError,
    ],
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);

  if (!context) {
    throw new Error("useMarketplace must be used within MarketplaceProvider");
  }

  return context;
}
