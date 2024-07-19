import { db } from './firebase'; 
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, updateDoc, getDocs, addDoc, Timestamp } from 'firebase/firestore';

//Check if the user already exists in the database
export const checkUser = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists();
  } catch (error) {
    console.error("Error checking user existence in Firestore:", error);
    throw error;
  }
};

//Add user data to the database
export const createUser = async (userId, email, firstName, lastName, imageUrl) => {
  try {
    //create reference in users collection as the userId
    const userRef = doc(db, "users", userId);
    
    //set documnet data
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

export const createMedication = async (userId, medicationName, frequency, times, selectedDate, alarmTimes) => {
  try {
    //create reference to medication with an auto-generated ID
    const medRef = doc(collection(db, "medication")); 
    
    //set document data
    await setDoc(medRef, {
      userId, 
      medicationName,
      frequency,
      times,
      selectedDate,
      alarmTimes
    });
    // Update the mediation document with its ID
    await setDoc(medRef, { medId: medRef.id }, { merge: true });

    return medRef.id;

  } catch (error) {
    console.error("Error creating medication in Firestore:", error);
    throw error;
  }
};

export const createLog = async (userId, medId, medicationName, times, date,  alarmTime, status ) => {
  try {
    const logRef = doc(collection(db, "log"));

    // Log parameters and their types
    console.log('Parameters passed to createLog:', {
      userId: { value: userId, type: typeof userId },
      medId: { value: medId, type: typeof medId },
      medicationName: { value: medicationName, type: typeof medicationName },
      times: { value: times, type: typeof times },
      date: { value: date, type: typeof date },
      alarm: { value: alarmTime, type: typeof alarmTime },
      status: { value: status, type: typeof status }
    });

    await setDoc(logRef, {
      userId,
      medId,
      medicationName,
      times,
      date,
      alarm: alarmTime,
      status,
      
    });
    await setDoc(logRef, { logId: logRef.id }, { merge: true });
    console.log('Log document created in Firestore');
  } catch (error) {
    console.error('Error creating log in Firestore:', error);
  }
};



export const getMedication = async () => {
  try {
    const medications = collection(db, "medication");
    const medicationDoc = await getDocs(medications);
    const medicationList = medicationDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return medicationList;
  } catch (error) {
    console.error("Error fetching medications from Firestore:", error);
    throw error;
  }
};

export const getFalseLog = async (userId) => {
  try {
    //query for finding false log and same userId
    const logsRef = collection(db, "log");
    const q = query(logsRef, where("status", "==", false), where("userId", "==", userId));
    
    //Execute the query
    const logDoc = await getDocs(q);
    const logList = logDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return logList;
  } catch (error) {
    console.error("Error fetching logs with status false from Firestore:", error);
    throw error;
  }
};

export const getTrueLog = async (userId) => {
  try {
    //query for finding true log and same userId
    const logsRef = collection(db, "log");
    const q = query(logsRef, where("status", "==", true), where("userId", "==", userId));
    
    //Execute the query
    const logDoc = await getDocs(q);
    const logList = logDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return logList;
  } catch (error) {
    console.error("Error fetching logs with status false from Firestore:", error);
    throw error;
  }
};

export const updateLog = async (logId) => {
  try {
    // Reference to the log document in Firestore
    const logRef = doc(db, 'log', logId); // Assuming 'log' is your collection name

    // Update the document
    await updateDoc(logRef, {
      status: true,
    });

    console.log(`Log with ID ${logId} updated successfully to true`);
  } catch (error) {
    console.error('Error updating log status:', error);
    throw error; // Optional: Handle or throw the error as needed
  }
};

export const checkLog = async (medId, alarm, userId) => {
  try {
    const alarmTimestamp = Timestamp.fromDate(alarm);

    const logQuery = query(
      collection(db, "log"),
      where("medId", "==", medId),
      where("alarm", "==", alarmTimestamp),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(logQuery);
    return !querySnapshot.empty; // Returns true if a matching log exists
  } catch (error) {
    console.error("Error checking if log exists:", error);
    return false;
  }
};
