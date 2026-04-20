import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNmFAK6xtkCT7HP-Orcl_t9Yh4XhZryIE",
  authDomain: "tournaments-8bff8.firebaseapp.com",
  projectId: "tournaments-8bff8",
  storageBucket: "tournaments-8bff8.firebasestorage.app",
  messagingSenderId: "934057432972",
  appId: "1:934057432972:web:ab92d93870b56b486be8a9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
