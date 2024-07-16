import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signOut, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBrKfelTCnvsoh-RAmVADQ6EHUlczSVOgQ",
    authDomain: "medease-4e34d.firebaseapp.com",
    projectId: "medease-4e34d",
    storageBucket: "medease-4e34d.appspot.com",
    messagingSenderId: "505144716831",
    appId: "1:505144716831:web:d3598d719af59e5417ef2a"
};

// Ensure Firebase is initialized only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore and Auth services
const db = getFirestore(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Function to sign out the current user
export const signOutUser = async () => {
    try {
        await signOut(auth); // Signs out the current user
    } catch (error) {
        console.error('Error signing out:', error);
    }
};

export { db, auth, app };
