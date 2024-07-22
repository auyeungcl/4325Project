import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react';
import {  useAuth } from "@clerk/clerk-expo";
import { getTrueLog } from './../../firebaseUtils'; 

export default function logbook() {
  const { userId } = useAuth();
  const [trueLogs, setTrueLogs] = useState([]);
  const [noLogs, setNoLogs] = useState(false);
  //Fetch true logs for the user
  const fetchTrueLogs = async () => {
    try {
      const logs = await getTrueLog(userId);
      //Convert timestamp to date
      const logsWithDate = logs.map(log => ({
        ...log,
        date: log.date ? log.date.toDate() : null,
        alarm: log.alarm ? log.alarm.toDate() : null,
      }));
      setTrueLogs(logsWithDate);

      setNoLogs(logs.length === 0);
    } catch (error) {
      console.error("Error fetching true logs:", error);
      setNoLogs(true);
    }
  };

  useEffect(() => {
    fetchTrueLogs();
  }, [userId]);



  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 50, fontFamily: 'montserrat-bold' }}>Logbook</Text>
      {/* True log view */}
      <ScrollView>
      {noLogs ? (
        <Text style={styles.logText}>No logs available</Text>
      ) : (
        trueLogs.map(log => (
          <View key={log.id} style={styles.logItem}>
            <Text style={styles.logText}>Medication Name: {log.medicationName}</Text>
            <Text style={styles.logText}>{`Date: ${log.date ? log.date.toDateString() : 'N/A'}`}</Text>
            <Text style={styles.logText}>{`Alarm: ${log.alarm ? log.alarm.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A'}`}</Text>
            <Text style={styles.logText}>Status: {log.status ? 'Taken' : 'Not Yet'}</Text>
          </View>
        ))
      )}
    </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  logContainer: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 10,
  },
  logText: {
    fontSize: 18,
    fontFamily: 'montserrat-regular',
  },
});
