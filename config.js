// config.js - Firebase configuration for modular imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyARJrCy-uXM-sYyEpG2uZ8Sj5FBBDK1f9M",
    authDomain: "mwcs-b2e0e.firebaseapp.com",
    projectId: "mwcs-b2e0e",
    storageBucket: "mwcs-b2e0e.firebasestorage.app",
    messagingSenderId: "216297038440",
    appId: "1:216297038440:web:cb685e4c7a5422f90711dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);