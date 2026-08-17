import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZJgPyKHXHmGwv-AyHS-PTZ3B9cVsSYjI",
  authDomain: "newtech-library-system.firebaseapp.com",
  projectId: "newtech-library-system",
  storageBucket: "newtech-library-system.firebasestorage.app",
  messagingSenderId: "496900798655",
  appId: "1:496900798655:web:32f5aa0992349405a0ae0a",
  measurementId: "G-2DQ9811YGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;