import { View, Text, Button } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { FontAwesome5, MaterialCommunityIcons} from '@expo/vector-icons';
import {Colors} from './../../constants/Colors'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarInactiveTintColor: Colors.PRIMARY,
      headerShown:false
      }}>
        <Tabs.Screen name='medication'
        options={{
          tabBarLabel:'Medication',
          tabBarIcon:({color})=><FontAwesome5 name="clinic-medical" 
          size={24} color={color} />
        }}
        />
        <Tabs.Screen name='reminder'
        options={{
          tabBarLabel:'Reminder',
          tabBarIcon:({color})=><MaterialCommunityIcons name="reminder" 
          size={24} color={color} />
        }}
        />
        <Tabs.Screen name='logbook'
        options={{
          tabBarLabel:'Logbook',
          tabBarIcon:({color})=><FontAwesome5 name="book-medical" 
          size={24} color={color} />
        }}
        />
    </Tabs>
  )
}