// src/firebaseConfig.js
import { initializeApp } from "firebase/app";   // Initialize Firebase
import { getDatabase } from "firebase/database"; // Import Realtime Database functions
import { getAuth } from "firebase/auth";         // Import Firebase Authentication functions

// Firebase configuration object (replace with your own from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyC91FWt33HqykVm8jDpIV4WyH6TkKTqBqU",
  authDomain: "mosenye-week-17.firebaseapp.com",
  databaseURL: "https://mosenye-week-17-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mosenye-week-17",
  storageBucket: "mosenye-week-17.firebasestorage.app",
  messagingSenderId: "1022792825499",
  appId: "1:1022792825499:web:b803b83747d2cce54de43e",
  measurementId: "G-XSZV5WQFKJ"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);

// Initialize Realtime Database
const database = getDatabase(app);

// Export both auth and database to be used in the rest of the app
export { auth, database };
