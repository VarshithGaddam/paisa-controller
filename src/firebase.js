import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace these placeholders with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyA3_xoGFkAY-GU-eRfbMxbJA7kIuBVIXwM",
    authDomain: "paisa-controller-f1b27.firebaseapp.com",
    projectId: "paisa-controller-f1b27",
    storageBucket: "paisa-controller-f1b27.firebasestorage.app",
    messagingSenderId: "634749233586",
    appId: "1:634749233586:web:4c30f28dd79886a9605cab",
    measurementId: "G-VQ7P62TEEW"
  };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);