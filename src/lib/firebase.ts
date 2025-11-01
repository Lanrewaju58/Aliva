import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDU5sC5q-HnT3uYc2ylP8tVcilPuHOPsqE",
  authDomain: "aliva-ce32b.firebaseapp.com",
  projectId: "aliva-ce32b",
  storageBucket: "aliva-ce32b.appspot.com",
  messagingSenderId: "449079325670",
  appId: "1:449079325670:web:c04a5bda6c8d9e216b5c27",
  measurementId: "G-1Q2DNRHTXV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Analytics (optional) - only in production
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;