import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDFf4dfaE1s2M94mbZclEl-2_SsjeO0Jxc",
    authDomain: "varsityvault-db12c.firebaseapp.com",
    projectId: "varsityvault-db12c",
    storageBucket: "varsityvault-db12c.firebasestorage.app",
    messagingSenderId: "763034122272",
    appId: "1:763034122272:web:30fdc164a7026ed273a445",
    measurementId: "G-G5W4VF786R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
