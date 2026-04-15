export const categories = ["Phones", "Audio", "Wearables", "Gaming", "Home Office"];

export const sellers = [
  {
    id: "seller-techbridge",
    name: "TechBridge",
    tagline: "Modern mobile tech with fast support and clean warranty terms.",
    responseTime: "Usually replies in 4 min",
    rating: 4.9,
    location: "Westlands, Nairobi",
    followers: 1240,
    joined: "2022",
    coverImage:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "seller-soundnest",
    name: "SoundNest",
    tagline: "Audio gear for commute, content, and focused study sessions.",
    responseTime: "Usually replies in 7 min",
    rating: 4.8,
    location: "Kilimani, Nairobi",
    followers: 860,
    joined: "2023",
    coverImage:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "seller-fitloop",
    name: "FitLoop",
    tagline: "Accessible fitness tech with strong battery life and everyday comfort.",
    responseTime: "Usually replies in 5 min",
    rating: 4.7,
    location: "Karen, Nairobi",
    followers: 640,
    joined: "2023",
    coverImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "seller-workform",
    name: "WorkForm",
    tagline: "Compact workspace gear built for modern home-office setups.",
    responseTime: "Usually replies in 10 min",
    rating: 4.8,
    location: "Ngong Road, Nairobi",
    followers: 910,
    joined: "2021",
    coverImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
];

export const products = [
  {
    id: "p-1001",
    sellerId: "seller-techbridge",
    name: "Nova X Pro",
    category: "Phones",
    price: 780,
    rating: 4.8,
    seller: "TechBridge",
    sellerResponseTime: "Usually replies in 4 min",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    accent: "var(--tone-pink)",
    stock: 8,
    description:
      "A premium everyday smartphone with a sharp display, balanced cameras, and reliable battery life.",
    highlights: ["120Hz AMOLED", "5G ready", "5000mAh battery"],
    tags: ["Photography", "Battery", "Performance"],
    aiTip:
      "Great if you want flagship feel without paying ultra-premium pricing. Best match for buyers who value battery and camera balance.",
  },
  {
    id: "p-1002",
    sellerId: "seller-soundnest",
    name: "Orbit QuietBuds",
    category: "Audio",
    price: 120,
    rating: 4.6,
    seller: "SoundNest",
    sellerResponseTime: "Usually replies in 7 min",
    image:
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=900&q=80",
    accent: "var(--tone-rose)",
    stock: 24,
    description:
      "Noise-cancelling earbuds made for commuting, study sessions, and all-day comfort.",
    highlights: ["ANC", "8-hour playback", "Dual-device pairing"],
    tags: ["Travel", "Comfort", "Calls"],
    aiTip:
      "Strong pick for buyers who need portable audio with good call quality and minimal setup friction.",
  },
  {
    id: "p-1003",
    sellerId: "seller-fitloop",
    name: "PulseFit Move",
    category: "Wearables",
    price: 95,
    rating: 4.5,
    seller: "FitLoop",
    sellerResponseTime: "Usually replies in 5 min",
    image:
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=80",
    accent: "var(--tone-orange)",
    stock: 14,
    description:
      "A lightweight fitness watch designed for step tracking, sleep data, and casual style.",
    highlights: ["7-day battery", "Heart rate tracking", "Water resistant"],
    tags: ["Fitness", "Lifestyle", "Value"],
    aiTip:
      "Best for casual fitness tracking. A good match if you want wellness features without smartwatch complexity.",
  },
  {
    id: "p-1004",
    sellerId: "seller-workform",
    name: "Arc Desk Mini",
    category: "Home Office",
    price: 210,
    rating: 4.7,
    seller: "WorkForm",
    sellerResponseTime: "Usually replies in 10 min",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
    accent: "var(--tone-orange-soft)",
    stock: 6,
    description:
      "A compact standing desk converter for small spaces and flexible work setups.",
    highlights: ["Small-footprint design", "Height adjustable", "Cable tray"],
    tags: ["Workspace", "Ergonomics", "Compact"],
    aiTip:
      "Ideal if you need better posture in a small room. Strong option for students and apartment workspaces.",
  },
];

export const reviews = [
  {
    id: "review-1001",
    productId: "p-1001",
    author: "Brian M.",
    rating: 5,
    time: "3 days ago",
    text: "Battery comfortably lasts a full day and the camera is consistently sharp indoors.",
  },
  {
    id: "review-1002",
    productId: "p-1001",
    author: "Sharon K.",
    rating: 4,
    time: "1 week ago",
    text: "Very smooth performance. I only wish the box included a charger.",
  },
  {
    id: "review-1003",
    productId: "p-1002",
    author: "Kevin O.",
    rating: 5,
    time: "5 days ago",
    text: "Comfortable fit and the noise cancellation is surprisingly strong for the price.",
  },
  {
    id: "review-1004",
    productId: "p-1004",
    author: "Lynn P.",
    rating: 4,
    time: "2 weeks ago",
    text: "Perfect for a tiny apartment desk setup and easy to move around.",
  },
];

export const messages = [
  {
    id: "msg-1001",
    productId: "p-1001",
    sender: "seller",
    senderName: "TechBridge",
    time: "2 min ago",
    text: "The Nova X Pro comes with a one-year warranty and sealed box packaging.",
  },
  {
    id: "msg-1002",
    productId: "p-1001",
    sender: "buyer",
    senderName: "Amina Wanjiku",
    time: "1 min ago",
    text: "Does it handle long video calls well without heating up too much?",
  },
  {
    id: "msg-1003",
    productId: "p-1002",
    sender: "seller",
    senderName: "SoundNest",
    time: "8 min ago",
    text: "Yes, the case supports USB-C fast charging and the earbuds pair with two devices.",
  },
  {
    id: "msg-1004",
    productId: "p-1004",
    sender: "seller",
    senderName: "WorkForm",
    time: "11 min ago",
    text: "We can share desk dimensions and a setup video if you need a closer look.",
  },
];

export const notifications = [
  {
    id: "notif-1001",
    type: "message",
    title: "New seller reply",
    description: "TechBridge replied about heat management during long calls.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "notif-1002",
    type: "wishlist",
    title: "Saved item back in stock",
    description: "Arc Desk Mini has limited stock again.",
    time: "35 min ago",
    read: false,
  },
  {
    id: "notif-1003",
    type: "assistant",
    title: "AI suggestion ready",
    description: "Your shortlist now includes two strong battery-focused picks.",
    time: "Today",
    read: true,
  },
];
