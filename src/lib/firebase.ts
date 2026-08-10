import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Clean and sanitize env variables (strip quotes and whitespace)
const sanitize = (val?: string, fallback: string = "") =>
  (val || fallback).replace(/["']/g, "").trim();

const firebaseConfig = {
  apiKey: sanitize(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    "AIzaSyBLqFZ3WP-KnHLYIcvIYlz6EPOWD6BhwmY"
  ),
  authDomain: sanitize(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    "barang-bekas29.firebaseapp.com"
  ),
  projectId: sanitize(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    "barang-bekas29"
  ),
  storageBucket: sanitize(
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    "barang-bekas29.firebasestorage.app"
  ),
  messagingSenderId: sanitize(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    "244093928624"
  ),
  appId: sanitize(
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    "1:244093928624:web:f64e40a51c73da95c1e775"
  ),
};

// Inisialisasi Firebase App
const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inisialisasi Auth dengan Try-Catch Guard agar tidak merusak build prerender Vercel
let auth: Auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase Auth init warning during build:", error);
  auth = null as unknown as Auth;
}

// Inisialisasi Firestore dengan Try-Catch Guard
let db: Firestore;
try {
  db = getFirestore(app);
} catch (error) {
  console.warn("Firestore init warning during build:", error);
  db = null as unknown as Firestore;
}

// Inisialisasi Storage dengan Try-Catch Guard
let storage: FirebaseStorage;
try {
  storage = getStorage(app);
} catch (error) {
  console.warn("Firebase Storage init warning during build:", error);
  storage = null as unknown as FirebaseStorage;
}

export { app, auth, db, storage };
