import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Colors } from './../../constants/Colors';
import { createUser, checkUser, createMedication, createLog, getMedication, getFalseLog, updateLog, checkLog } from './../../firebaseUtils'; 
import { SelectList } from 'react-native-dropdown-select-list';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome5} from '@expo/vector-icons';



export default function Medication() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [modalVisible, setModalVisible] = useState(false); 
  const [medicationName, setMedicationName] = useState(''); 
  const [frequency, setFrequency] = useState(''); 
  const [times, setTimes] = useState(''); 
  const [alarmTimes, setAlarmTimes] = useState([]); 
  const [showTimePickerIndex, setShowTimePickerIndex] = useState(null); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [falseLogs, setFalseLogs] = useState([]);
  const [noLogs, setNoLogs] = useState(false);

  const frequencies = [
    { key: 'daily', value: 'every day' },
    { key: 'weekly', value: 'every week' },
    { key: 'monthly', value: 'every month' },
    { key: 'once', value: 'once' },
  ];

  const timesPerDay = [
    { key: '1', value: '1' },
    { key: '2', value: '2' },
    { key: '3', value: '3' },
    { key: '4', value: '4' },
    { key: '5', value: '5' },
  ];

  //Create user data in database 
  const UserDocument = async () => {
    try {
      //Check if the user data already exists
      const userExists = await checkUser(userId);

      if (!userExists) {
        // Create new user data in database
        await createUser(userId, user.primaryEmailAddressId, user.firstName, user.lastName, user.imageUrl);
        console.log('User document created in Firestore');
      }
    } catch (error) {
      console.error("Error handling user document in Firestore:", error);
    }
  };

  //Handle user document creation
  useEffect(() => {
    UserDocument();
  }, [userId, user]);

   //Fetch false logs for the user
   const fetchFalseLogs = async () => {
    try {
      const logs = await getFalseLog(userId);
      
      //Convert timestamp to date
      const logsWithDate = logs.map(log => ({
        ...log,
        date: log.date ? log.date.toDate() : null,
        alarm: log.alarm ? log.alarm.toDate() : null,
      }));
      setFalseLogs(logsWithDate);

      setNoLogs(logs.length === 0);
    } catch (error) {
      console.error("Error fetching false logs:", error);
      setNoLogs(true);
    }
  };

  //Handle fetching flase logs for user
  useEffect(() => {
    fetchFalseLogs();
  }, [userId]);

  //Updating log status to true
  const updateStatus = async (logId) => {
    try {
      await updateLog(logId); 
      
      //After updating, fetch the updated false logs
      fetchFalseLogs();
    } catch (error) {
      console.error('Error updating log status:', error);
    }
  };
  
  //On press button to show modal
  const onPress = () => {
    setModalVisible(true); 
  };
  
  //Getting corresponding alarmTimes input boxes
  const timesSelect = (option) => {
    setTimes(option);
    //Clear alarmTimes when times change
    setAlarmTimes([]);
  };

  const AlarmTimeChange = (index, selectedTime) => {
    const updatedAlarmTimes = [...alarmTimes];
    updatedAlarmTimes[index] = selectedTime;
    setAlarmTimes(updatedAlarmTimes);
  };

  const DateChange = (selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  //Using date time picker for selecting date and time
  const renderAlarmTimeInputs = () => {
    return [...Array(parseInt(times, 10))].map((_, index) => (
      <View key={index} style={styles.inputContainer}>
        <Text style={styles.title}>{`Alarm Time ${index + 1}:`}</Text>
        <TouchableOpacity onPress={() => setShowTimePickerIndex(index)}>
          <Text style={styles.inputTime}>{alarmTimes[index] ? alarmTimes[index].toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Select Time'}</Text>
        </TouchableOpacity>
        {showTimePickerIndex === index && (
          <DateTimePicker
            value={alarmTimes[index] ? new Date(alarmTimes[index]) : new Date()}
            mode='time'
            is24Hour={true}
            display='spinner'
            onChange={(event, selectedTime) => {
              if (selectedTime) {
                AlarmTimeChange(index, selectedTime);
              }
              //Close the date time picker 
              setShowTimePickerIndex(null); 
            }}
          />
        )}
      </View>
    ));
  };

  //Close modal
  const CloseMedication = () =>{
    setModalVisible(false);
  };

  //Add medication and log immediately to database 
  const AddMedication = async () => {
    console.log('User ID:', userId);
    console.log('Medication Name:', medicationName);
    console.log('Frequency:', frequency);
    console.log('Times:', times);
    console.log('Date:', selectedDate);
    console.log('Alarm Times:', alarmTimes);

    try {
        //Add medication data to the database and get the generated medId
        const medId = await createMedication(userId, medicationName, frequency, times, selectedDate, alarmTimes);
        console.log('Medication document created in Firestore with medId:', medId);

        //Add log data to the database right after submitting medication
        const status = false;
        if (times >= 1) {
            for (let i = 0; i < times; i++) {
              //Getting one alarm time form the array
              const alarmTime = new Date(alarmTimes[i]);
              //Ceate Log
              await createLog(userId, medId, medicationName, times, selectedDate, alarmTime, status);
            }
        }

        //Close the modal
        setModalVisible(false);
    } catch (error) {
        console.error('Error adding medication and logs:', error);
    }
  };

  //Add log 
  const AddLog = async (medication) => {
    const currentDate = new Date();
    const SelectDate = new Date(medication.selectedDate.toDate());
    const status = false; 


    //Format currentDate and selectedDate
    const currentDateString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    const selectedDateString = `${SelectDate.getFullYear()}-${SelectDate.getMonth() + 1}-${SelectDate.getDate()}`;
  
    //Calculate week passed
    const weekMillisec = 1000 * 60 * 60 * 24 * 7;
    const weekPassed = Math.floor((currentDate - SelectDate) / weekMillisec);

    //Calculate months passed
    const monthPassed = (currentDate, selectedDate) => {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth();
  
      return (currentYear - selectedYear) * 12 + (currentMonth - selectedMonth);
    };
  
    //Add log function
    const OneTimeAddLog = async () => {
      const status = false;
      if (medication.alarmTimes.length >= 1) {
        for (var i = 0; i < medication.alarmTimes.length; i++) {
          const alarm = new Date(medication.alarmTimes[i].toDate());
          const adjustedAlarm = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            alarm.getHours(),
            alarm.getMinutes(),
            alarm.getSeconds()
          );
    
          //Check if a log with the same medId, alarm, and userId already exists
          const logExists = await checkLog(medication.medId, adjustedAlarm, medication.userId);
    
          if (logExists) {
            console.log('Log already exists for medId, alarm, and userId:', medication.medId, adjustedAlarm, medication.userId);
          } else {
    
            // If no matching log exists, create a new log
            await createLog(medication.userId,
              medication.medId,
              medication.medicationName,
              medication.times, 
              currentDate,
              adjustedAlarm,
              status
            );
          }
        }
      }
    };
    
  
    //Check conditions to add log based on frequency
    if (medication.frequency === 'daily') {
      if (currentDateString !== selectedDateString) {
        await OneTimeAddLog();
      }
    } else if (medication.frequency === 'weekly') {
      if (weekPassed >= 1 && Number.isInteger(weekPassed)===true) {
        await OneTimeAddLog();
      }
    } else if (medication.frequency === 'monthly') {
      const monthsPassed = monthPassed(currentDate, SelectDate);
      if (monthsPassed >= 1 && Number.isInteger(monthsPassed)===true) {
        await OneTimeAddLog();
      }
    }
  };
 
  //Get medication collection and call AddLog for each when the app load
  useEffect(() => {
    const getMedicationsAddLog = async () => {
      try {
        const medications = await getMedication(userId);
        medications.forEach(medication => {
          AddLog(medication);
        });
      } catch (error) {
        console.error("Error getting medications and adding log:", error);
      }
    };

    getMedicationsAddLog();
  }, []);



  
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 50, fontFamily: 'montserrat-bold' }}>Medication</Text>
      
      {/* False log view */}
      <ScrollView>
      {noLogs ? (
        <Text style={styles.logText}>No logs available</Text>
      ) : (
        falseLogs.map(log => (
          <View key={log.id} style={styles.logItem}>
            <View>
              <Text style={styles.logText}>Medication Name: {log.medicationName}</Text>
              <Text style={styles.logText}>{`Date: ${log.date ? log.date.toDateString() : 'N/A'}`}</Text>
              <Text style={styles.logText}>{`Alarm: ${log.alarm ? log.alarm.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A'}`}</Text>
              <Text style={styles.logText}>Status: {log.status ? 'Taken' : 'Not Yet'}</Text>
            </View>
            <TouchableOpacity style={styles.logContainer} onPress={() => updateStatus(log.id)}>
              <FontAwesome5 name="check" size={24}/>
            </TouchableOpacity>
          </View>
          
        ))
      )}
    </ScrollView>

      <TouchableOpacity style={styles.btn} onPress={onPress}>
        <Text style={styles.btnText}>+ Add Medication</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontSize: 20, fontFamily: 'montserrat-bold', marginBottom: 20 }}>Add Medication</Text>
            {/* Modal content*/}
            <View style={styles.inputContainer}>
              <Text style={styles.title}>Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter medication name"
                value={medicationName}
                onChangeText={setMedicationName}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.title}>Frequency:</Text>
              <SelectList 
                setSelected={setFrequency}
                data={frequencies} 
                placeholder='Select frequency'
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.title}>Times per Day:</Text>
              <SelectList 
                setSelected={timesSelect}
                data={timesPerDay} 
                placeholder='Select times'
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.title}>Date:</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.inputTime}>{selectedDate.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode='date'
                  display='spinner'
                  onChange={DateChange}
                />
              )}
            </View>
            
            {/* Render alarm time inputs based on selected times */}
            {parseInt(times, 10) > 0 && renderAlarmTimeInputs()}
            
            {/* Add and close button */}
            <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.addButton} onPress={AddMedication}>
              <Text style={{ color: '#fff', fontFamily: 'montserrat-bold' }}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={CloseMedication}>
              <Text style={{ color: '#fff', fontFamily: 'montserrat-bold' }}>Close</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  btn: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 99,
    marginBottom: 10,
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  btnText: {
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'montserrat-bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'montserrat-regular',
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 13,
    borderRadius: 10,
    fontFamily: 'montserrat-regular',
  },
  inputTime: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
  },
  addButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  logText: {
    fontSize: 18,
    fontFamily: 'montserrat-regular',
  },
  logContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  
});
