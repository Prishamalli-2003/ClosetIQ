// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9L-DuMmK5eds-V9xG0DQLbbGC_Uc9ba0",
  authDomain: "closetiq-183a2.firebaseapp.com",
  projectId: "closetiq-183a2",
  storageBucket: "closetiq-183a2.firebasestorage.app",
  messagingSenderId: "188803730739",
  appId: "1:188803730739:web:3c11a47abe6ef17377c246"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);