import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import LoginScreen from './../components/LoginScreen';
import { Stack } from 'expo-router';
import { Colors } from './../constants/Colors'

const tokenCache = {
  async getToken(key) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("SecureStore save item error: ", err);
    }
  },
};

//get user profile image and first name 
const GetUser = () => {
  const { user } = useUser();
  if (!user) {
    return null;
  }

  return (
    <View style = {{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source = {{ uri: user.imageUrl }}
        style = {styles.image}
      />
      <Text style = {styles.name}>{user.firstName}</Text>
    </View>
  );
};

//Sign out button
const SignOutButton = () => {
  const { signOut } = useAuth();
  const handleSignOut = async () => await signOut();

  return (
    <TouchableOpacity onPress={handleSignOut} style={styles.btn}>
      <Text style={styles.btnText}>Sign Out</Text>
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'montserrat-regular': require('./../assets/fonts/Montserrat-Regular.ttf'),
    'montserrat-medium': require('./../assets/fonts/Montserrat-Medium.ttf'),
    'montserrat-bold': require('./../assets/fonts/Montserrat-Bold.ttf'),
    'montserrat-light': require('./../assets/fonts/Montserrat-Light.ttf')
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <SignedIn>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerLeft: () => <GetUser />,
              headerTitle: '',
              headerRight: () => <SignOutButton />
            }}
          />
        </Stack>
      </SignedIn>
      <SignedOut>
        <LoginScreen />
      </SignedOut>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  image:{
    width: 40, 
    height: 40, 
    borderRadius: 20,
  },
  name:{
    marginLeft: 10 , 
    fontFamily: 'montserrat-bold',
    fontSize: 16,
  },
  btn:{
    backgroundColor: Colors.RED, 
    paddingLeft: 14, 
    paddingRight: 14,
    paddingTop: 7,
    paddingBottom: 7,
    borderRadius: 20,
  },
  btnText:{
    color: 'white', 
    fontFamily: 'montserrat-bold', 
    fontSize: 16,
  },
})

