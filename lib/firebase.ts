import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔐 Deine Firebase Config (aus deinem Screenshot)
const firebaseConfig = {
    apiKey: "AIzaSyAFqYFjutSkjJUKYpJudwmmtewYP2MEvqQ",
    authDomain: "alternativealternativefger.firebaseapp.com",
    projectId: "alternativealternativefger",
    storageBucket: "alternativealternativefger.firebasestorage.app",
    messagingSenderId: "570714756919",
    appId: "1:570714756919:web:50397451b33a68584eacb2",
    measurementId: "G-RX3HEB6K6J",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

export default app;