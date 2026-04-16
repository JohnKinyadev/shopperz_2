import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  categorySpecs,
  messages as initialMessages,
  notifications as initialNotifications,
  products as initialProducts,
  reviews,
  sellers as initialSellers,
} from "../data/mockData";
import { auth, firebaseReady } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { buildSpecHighlights, parsePriceInput } from "../lib/productUtils";

const STORAGE_KEY = "shopperz-state";
const ADMIN_EMAILS = ["admin@shopperz.local", "admin@shopperz.dev"];
const DEMO_ADMIN_CREDENTIALS = {
  email: "admin@shopperz.local",
  password: "Admin123!",
  name: "Shopperz Admin",
};

const MarketplaceContext = createContext(null);

function getLatestSellerRequestForEmail(requests, email) {
  if (!email) return null;

  return requests
    .filter((request) => request.requesterEmail === email)
    .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))[0] ?? null;
}

function normalizeTagList(tagString = "") {
  return tagString
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildProductHighlights(productData, tags) {
  const specHighlights = buildSpecHighlights(productData.category, productData.specs);
  const fallbackHighlightsByCategory = {
    Phones: ["Reliable performance", "All-day battery", "Ready to ship"],
    Audio: ["Clear sound", "Comfortable fit", "Ready to ship"],
    Wearables: ["Lightweight design", "Daily tracking", "Ready to ship"],
    Gaming: ["Smooth gameplay", "Great value", "Ready to ship"],
    "Home Office": ["Practical setup", "Space-saving", "Ready to ship"],
  };

  const highlights = [...specHighlights, ...tags].slice(0, 3);

  return highlights.length > 0
    ? highlights
    : fallbackHighlightsByCategory[productData.category] || ["Featured product", "Ready to ship", "Limited stock"];
}

function buildSellerFromRequest(request) {
  return {
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
}

function loadStoredState() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function formatAuthError(error) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "Email already in use.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    default:
      return error?.message ?? "Something went wrong. Please try again.";
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

function buildAdminProfile(
  email = DEMO_ADMIN_CREDENTIALS.email,
  name = DEMO_ADMIN_CREDENTIALS.name,
  overrides = {},
) {
  return {
    name,
    role: "Admin",
    location: "Head office",
    email,
    preference: "Approve sellers and manage the marketplace",
    ...overrides,
  };
}

function buildSignedOutUser(mode = "signin") {
  return {
    isAuthenticated: false,
    mode,
    user: null,
    isAdmin: false,
    sessionType: "guest",
  };
}

export function MarketplaceProvider({ children }) {
  const storedState = loadStoredState();
  const [savedItems, setSavedItems] = useState(storedState?.savedItems ?? []);
  const [compareItems, setCompareItems] = useState(storedState?.compareItems ?? []);
  const [messages, setMessages] = useState(storedState?.messages ?? initialMessages);
  const [notifications, setNotifications] = useState(
    storedState?.notifications ?? initialNotifications,
  );
  const [profile, setProfile] = useState(storedState?.profile ?? buildDefaultProfile());
  const [currentUser, setCurrentUser] = useState(
    storedState?.currentUser ?? buildSignedOutUser(),
  );
  const [products, setProducts] = useState(storedState?.products ?? initialProducts);
  const [sellers, setSellers] = useState(storedState?.sellers ?? initialSellers);
  const [orders, setOrders] = useState(storedState?.orders ?? []);
  const [sellerRequests, setSellerRequests] = useState(storedState?.sellerRequests ?? []);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!firebaseReady || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCurrentUser((current) =>
          current.sessionType === "local-admin" ? current : buildSignedOutUser(current.mode),
        );
        if (currentUser.sessionType !== "local-admin") {
          setProfile((current) =>
            current.role === "Admin" || current.email !== buildDefaultProfile().email
              ? buildDefaultProfile()
              : current,
          );
        }
        return;
      }

      const isAdmin = ADMIN_EMAILS.includes(user.email);
      const approvedRequest = sellerRequests.find(
        (request) => request.requesterEmail === user.email && request.status === "Approved",
      );

      setCurrentUser({
        isAuthenticated: true,
        mode: "signin",
        user,
        isAdmin,
        sessionType: "firebase",
      });

      if (isAdmin) {
        setProfile(
          buildAdminProfile(
            user.email,
            user.displayName || DEMO_ADMIN_CREDENTIALS.name,
            approvedRequest
              ? {
                  location: approvedRequest.location,
                  sellerId: approvedRequest.sellerId,
                  sellerName: approvedRequest.storeName,
                  responseTime: approvedRequest.responseTime,
                }
              : {},
          ),
        );
        if (approvedRequest) {
          setSellers((current) => {
            if (current.some((seller) => seller.id === approvedRequest.sellerId)) {
              return current;
            }
            return [...current, buildSellerFromRequest(approvedRequest)];
          });
        }
        return;
      }

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
          return [...current, buildSellerFromRequest(approvedRequest)];
        });
        return;
      }

      setProfile((current) => ({
        ...current,
        email: user.email,
        name: user.displayName || current.name,
      }));
      setSavedItems([]);
      setCompareItems([]);
    });

    return unsubscribe;
  }, [sellerRequests, currentUser.isAdmin, currentUser.sessionType, currentUser.user?.email]);

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
  const currentSellerRequest = getLatestSellerRequestForEmail(
    sellerRequests,
    currentUser.user?.email,
  );

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
      currentSellerRequest,
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
        const email = credentials.email.trim().toLowerCase();

        if (
          email === DEMO_ADMIN_CREDENTIALS.email
          && credentials.password === DEMO_ADMIN_CREDENTIALS.password
        ) {
          setAuthError(null);
          setCurrentUser({
            isAuthenticated: true,
            mode: "signin",
            user: {
              uid: "local-admin",
              email: DEMO_ADMIN_CREDENTIALS.email,
              displayName: DEMO_ADMIN_CREDENTIALS.name,
            },
            isAdmin: true,
            sessionType: "local-admin",
          });
          setProfile(buildAdminProfile());
          return;
        }

        if (!firebaseReady || !auth) {
          setAuthError("Firebase not configured");
          return;
        }
        try {
          setAuthError(null);
          await signInWithEmailAndPassword(auth, email, credentials.password);
        } catch (error) {
          setAuthError(formatAuthError(error));
        }
      },
      signUp: async (details) => {
        if (!firebaseReady || !auth) {
          setAuthError("Firebase not configured");
          return;
        }
        try {
          setAuthError(null);
          await createUserWithEmailAndPassword(auth, details.email.trim().toLowerCase(), details.password);
          setSavedItems([]);
          setCompareItems([]);
          // Update profile with name
          setProfile({
            ...buildDefaultProfile(),
            name: details.name,
            email: details.email.trim().toLowerCase(),
          });
        } catch (error) {
          setAuthError(formatAuthError(error));
        }
      },
      becomeSeller: async (sellerDetails) => {
        if (!currentUser.isAuthenticated) {
          setAuthError("You must be signed in to become a seller.");
          return null;
        }

        if (profile.sellerId) {
          setAuthError("You are already a seller.");
          return null;
        }

        const existingRequest = getLatestSellerRequestForEmail(
          sellerRequests,
          currentUser.user.email,
        );

        if (existingRequest?.status === "Pending") {
          setAuthError("You already have a pending seller request.");
          return null;
        }

        if (existingRequest?.status === "Approved") {
          setAuthError("Your seller request has already been approved.");
          return existingRequest.id;
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

        const approvedSeller = buildSellerFromRequest(request);
        setSellers((current) => {
          if (current.some((seller) => seller.id === request.sellerId)) return current;
          return [...current, approvedSeller];
        });

        if (currentUser.user?.email === request.requesterEmail) {
          setProfile((current) => ({
            ...current,
            role: current.role === "Admin" || currentUser.isAdmin ? "Admin" : "Seller",
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
        if (!profile.sellerId) {
          setAuthError("Only sellers can add products.");
          return null;
        }

        const price = parsePriceInput(productData.price);

        if (Number.isNaN(price)) {
          setAuthError("Enter a valid price before posting the product.");
          return null;
        }

        const tags = Array.isArray(productData.tags)
          ? productData.tags
          : normalizeTagList(productData.tags);
        const highlights = buildProductHighlights(productData, tags);
        const normalizedSpecs = (categorySpecs[productData.category] || []).reduce((collection, definition) => {
          const nextValue = productData.specs?.[definition.field]?.trim?.() ?? "";
          if (nextValue) {
            collection[definition.field] = nextValue;
          }
          return collection;
        }, {});

        const product = {
          ...productData,
          id: `p-${Date.now()}`,
          sellerId: profile.sellerId,
          seller: profile.sellerName || profile.name,
          sellerResponseTime: profile.responseTime || "Usually replies in 10 min",
          accent: "var(--tone-pink)",
          image: productData.image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
          price,
          rating: Number(productData.rating) || 4.7,
          stock: Number(productData.stock),
          highlights,
          tags,
          aiTip: `A fresh ${productData.category.toLowerCase()} listing from ${profile.sellerName || profile.name} with ${highlights[0].toLowerCase()}.`,
          specs: normalizedSpecs,
        };

        setAuthError(null);
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
        if (currentUser.sessionType === "local-admin") {
          setCurrentUser((current) => buildSignedOutUser(current.mode));
          setProfile(buildDefaultProfile());
          setAuthError(null);
          return;
        }

        if (!firebaseReady || !auth) return;
        try {
          await firebaseSignOut(auth);
          setProfile(buildDefaultProfile());
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
      orders,
      profile,
      products,
      savedItems,
      sellerRequests,
      sellers,
      unreadNotifications,
      authError,
      currentSellerRequest,
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
