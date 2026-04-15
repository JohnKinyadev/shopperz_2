import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  messages as initialMessages,
  notifications as initialNotifications,
  products,
  reviews,
  sellers,
} from "../data/mockData";

const STORAGE_KEY = "shopperz-state";

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
  const [currentUser, setCurrentUser] = useState(
    storedState?.currentUser ?? {
      isAuthenticated: true,
      mode: "signin",
    },
  );

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
      }),
    );
  }, [compareItems, currentUser, messages, notifications, profile, savedItems]);

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
      signIn(credentials) {
        setCurrentUser({ isAuthenticated: true, mode: "signin" });
        setProfile((current) => ({
          ...current,
          email: credentials.email,
        }));
      },
      signUp(details) {
        setCurrentUser({ isAuthenticated: true, mode: "signup" });
        setProfile({
          ...buildDefaultProfile(),
          name: details.name,
          email: details.email,
        });
      },
      signOut() {
        setCurrentUser({ isAuthenticated: false, mode: "signin" });
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
