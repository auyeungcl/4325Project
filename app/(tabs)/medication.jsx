import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Colors } from './../../constants/Colors';
import { createUser, checkUserExists } from './../../firebaseUtils'; 
import { SelectList } from 'react-native-dropdown-select-list';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Medication() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [modalVisible, setModalVisible] = useState(false); 
  const [medicationName, setMedicationName] = useState(''); 
  const [frequency, setFrequency] = useState(''); 
  const [times, setTimes] = useState(''); 
  const [alarmTimes, setAlarmTimes] = useState([]); 
  const [showTimePickerIndex, setShowTimePickerIndex] = useState(null); 

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

  // Create user data in database 
  const handleUserDocument = async () => {
    try {
      // Check if the user data already exists
      const userExists = await checkUserExists(userId);

      if (!userExists) {
        // Create new user data in database
        await createUser(userId, user.primaryEmailAddressId, user.firstName, user.lastName, user.imageUrl);
        console.log('User document created in Firestore');
      }
    } catch (error) {
      console.error("Error handling user document in Firestore:", error);
    }
  };

  // Handle user document creation
  useEffect(() => {
    handleUserDocument();
  }, [userId, user]);

  const onPress = () => {
    console.log('Add Medication start');
    setModalVisible(true); // Show modal
  };


  const timesSelect = (option) => {
    setTimes(option);
    // Clear alarmTimes when times is changed
    setAlarmTimes([]);
  };

  const handleAlarmTimeChange = (index, selectedTime) => {
    const updatedAlarmTimes = [...alarmTimes];
    updatedAlarmTimes[index] = selectedTime;
    setAlarmTimes(updatedAlarmTimes);
  };

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
                handleAlarmTimeChange(index, selectedTime);
              }
              setShowTimePickerIndex(null); // Close the picker after selection
            }}
          />
        )}
      </View>
    ));
  };

  const AddMedication = () => {
    console.log('User ID:', userId);
    console.log('Medication Name:', medicationName);
    console.log('Frequency:', frequency);
    console.log('Times:', times);
    console.log('Alarm Times:', alarmTimes);
    // Add medication data to the database
    setModalVisible(false); // Close the modal 
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 50, fontFamily: 'montserrat-bold' }}>Medication</Text>
      <TouchableOpacity style={styles.btn} onPress={onPress}>
        <Text style={{
          textAlign: 'center',
          color: '#fff',
          fontFamily: 'montserrat-bold',
        }}>+ Add Medication</Text>
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
            
            {/* Render alarm time inputs based on selected times */}
            {parseInt(times, 10) > 0 && renderAlarmTimeInputs()}
            
            {/* Add and close button */}
            <TouchableOpacity style={styles.addButton} onPress={AddMedication}>
              <Text style={{ color: '#fff', fontFamily: 'montserrat-bold' }}>Add</Text>
            </TouchableOpacity>
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
    padding: 10,
    borderRadius: 5,
    fontFamily: 'montserrat-regular',
  },
  inputTime: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    fontFamily: 'montserrat-regular',
    fontSize: 10,
  },
  addButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});
