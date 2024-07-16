import { db } from './firebase'; 
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const checkUserExists = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists();
  } catch (error) {
    console.error("Error checking user existence in Firestore:", error);
    throw error;
  }
};

export const createUser = async (userId, email, firstName, lastName, imageUrl) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      email,
      firstName,
      lastName,
      imageUrl,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error creating user in Firestore:", error);
    throw error;
  }
};
