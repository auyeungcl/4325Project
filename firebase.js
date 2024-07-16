import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signOut, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyABfofP4DN-x4zinS5FKQ6j6VE7lnG0l4I",
    authDomain: "medease-e53f8.firebaseapp.com",
    projectId: "medease-e53f8",
    storageBucket: "medease-e53f8.appspot.com",
    messagingSenderId: "318560143351",
    appId: "1:318560143351:web:d5a90fb4d593f02f0850f2"
};

// Ensure Firebase is initialized only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore and Auth services
const db = getFirestore(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});



export { db, auth, app };
