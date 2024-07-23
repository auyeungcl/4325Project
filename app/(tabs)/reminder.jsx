import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from "@clerk/clerk-expo";
import { getTodayLog } from './../../firebaseUtils'; 

export default function Reminder() {
  const { userId } = useAuth();
  const [todayLogs, setTodayLogs] = useState([]);
  const [noLogs, setNoLogs] = useState(false);

  //Fetch today false logs for the user
  const fetchTodayLogs = async () => {
    try {
      if (userId) {
        const logs = await getTodayLog(userId);

        //Convert timestamp to date
        const logsWithDate = logs.map(log => ({
          ...log,
          date: log.date ? log.date.toDate() : null,
          alarm: log.alarm ? log.alarm.toDate() : null,
        }));

        console.log("Logs with Dates:", logsWithDate);

        setTodayLogs(logsWithDate);
        setNoLogs(logs.length === 0);
      }
    } catch (error) {
      console.error("Error fetching false logs:", error);
      setNoLogs(true);
    }
  };

  useEffect(() => {
    fetchTodayLogs();
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 50, fontFamily: 'montserrat-bold' }}>Reminder</Text>
      {/* Today log view */}
      <ScrollView>
        {noLogs ? (
          <Text style={styles.logText}>No reminders</Text>
        ) : (
          todayLogs.map(log => (
            <View key={log.id} style={styles.logItem}>
              <Text style={styles.logText}>Medication Reminder:</Text>
              <Text style={styles.logText}>Remember to take </Text>
              <Text style={styles.logText}>{log.medicationName} at {log.alarm ? log.alarm.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  logItem: {
    alignItems: 'right',
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  logText: {
    fontSize: 18,
    fontFamily: 'montserrat-regular',
  },
});
