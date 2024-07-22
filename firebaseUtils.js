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

//Add medication data to the database
export const createMedication = async (userId, medicationName, frequency, times, selectedDate, alarmTimes) => {
  try {
    const medRef = doc(collection(db, "medication")); 
    
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

//Add log data to the database
export const createLog = async (userId, medId, medicationName, times, date,  alarmTime, status ) => {
  try {
    const logRef = doc(collection(db, "log"));

    await setDoc(logRef, {
      userId,
      medId,
      medicationName,
      times,
      date,
      alarm: alarmTime,
      status,
      
    });

    // Update the log document with its ID
    await setDoc(logRef, { logId: logRef.id }, { merge: true });
    console.log('Log document created in Firestore');
  } catch (error) {
    console.error('Error creating log in Firestore:', error);
  }
};


//Get medication doucments with same userId with the user
export const getMedication = async (userId) => {
  try {
    const medications = collection(db, "medication");
    const q = query(medications, where("userId", "==", userId));
    const medicationDoc = await getDocs(q);
    const medicationList = medicationDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return medicationList;
  } catch (error) {
    console.error("Error fetching medications from Firestore:", error);
    throw error;
  }
};

//Get status:false logs with same userId with the user
export const getFalseLog = async (userId) => {
  try {
    const logsRef = collection(db, "log");
    
    //Query for finding false log and same userId
    const q = query(logsRef, where("status", "==", false), where("userId", "==", userId));
    
    //Execute query
    const logDoc = await getDocs(q);
    const logList = logDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return logList;
  } catch (error) {
    console.error("Error fetching logs with status false from Firestore:", error);
    throw error;
  }
};

//Get status:true logs with same userId with the user
export const getTrueLog = async (userId) => {
  try {
    const logsRef = collection(db, "log");
    
    //Query for finding true log and same userId
    const q = query(logsRef, where("status", "==", true), where("userId", "==", userId));
    
    //Execute query
    const logDoc = await getDocs(q);
    const logList = logDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return logList;
  } catch (error) {
    console.error("Error fetching logs with status false from Firestore:", error);
    throw error;
  }
};

//Change log status to true 
export const updateLog = async (logId) => {
  try {
    //Reference to the log document to the logId got
    const logRef = doc(db, 'log', logId); 

    //Update the document
    await updateDoc(logRef, {
      status: true,
    });

    console.log(`Log with ID ${logId} updated successfully to true`);
  } catch (error) {
    console.error('Error updating log status:', error);
    throw error; 
  }
};

//Check if the log is already exists in the database
export const checkLog = async (medId, alarm, userId) => {
  try {
    const alarmTimestamp = Timestamp.fromDate(alarm);

    //Query for comparing log with medId, alarm, and userId
    const logQuery = query(
      collection(db, "log"),
      where("medId", "==", medId),
      where("alarm", "==", alarmTimestamp),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(logQuery);
    //Returns true if matching log exists
    return !querySnapshot.empty; 
  } catch (error) {
    console.error("Error checking if log exists:", error);
    return false;
  }
};
