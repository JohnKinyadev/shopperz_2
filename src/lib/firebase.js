// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFCbiRKCkgThnp5hBIkeylwx3mDmI5CoA",
  authDomain: "shopperz-9d43f.firebaseapp.com",
  projectId: "shopperz-9d43f",
  storageBucket: "shopperz-9d43f.firebasestorage.app",
  messagingSenderId: "111360795251",
  appId: "1:111360795251:web:fe6849c33e4ffe3df24006",
  measurementId: "G-JTN9ZGLYQ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth with the app instance
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firebase is ready after initialization
export const firebaseReady = !!app && !!auth && !!db;
