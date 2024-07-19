import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import LoginScreen from './../components/LoginScreen';
import { Stack } from 'expo-router';
import { Colors } from './../constants/Colors';
import * as Updates from 'expo-updates';
import { FontAwesome5, MaterialCommunityIcons} from '@expo/vector-icons';

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
      <FontAwesome5 name="sign-out-alt" size={24}/>
    </TouchableOpacity>
  );
};

//Reload button
const ReloadButton = () => {
  const reloadApp = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error reloading app:', error);
    }
  };

  return (
    <TouchableOpacity onPress={reloadApp} style={styles.btn}>
      <FontAwesome5 name="sync-alt" size={24}/>
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
              headerRight: () => (
                <View style={styles.btnContainer}>
                  <ReloadButton />
                  <SignOutButton />
                </View>
              ),
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
  btnContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  btn:{
    alignSelf: 'center',
    padding: 15,
  },
})

