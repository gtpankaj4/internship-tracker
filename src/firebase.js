// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCtYQRKKqlHhyfrYX1FFN_8f25oCF9xSc",
  authDomain: "internship-tracker-fbd38.firebaseapp.com",
  projectId: "internship-tracker-fbd38",
  storageBucket: "internship-tracker-fbd38.appspot.com",
  messagingSenderId: "364139572043",
  appId: "1:364139572043:web:8619c25feead32b32616ce",
  measurementId: "G-PNJ9LZ2N25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Analytics (optional, only works in production, not localhost)
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 