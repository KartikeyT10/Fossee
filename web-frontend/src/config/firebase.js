import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyA01qf6ORX2edveofxGNAJk_--Yw31xZPg",
    authDomain: "fossee-analytics.firebaseapp.com",
    projectId: "fossee-analytics",
    storageBucket: "fossee-analytics.firebasestorage.app",
    messagingSenderId: "286877279777",
    appId: "1:286877279777:web:41cd8a9a3abd701d842560"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
