import { View, Text, Image , StyleSheet, TouchableOpacity} from 'react-native'
import React from 'react'
import { Colors } from './../constants/Colors'
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } =
        await startOAuthFlow();

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <View>
      <View style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: 100
      }}>     
      <Image source={require('./../assets/images/miss.jpg')}
          style={{
            width:250,
            height: 450,
            borderRadius: 20,
            borderWidth: 6,
            borderColor: '#000',
          }}
      />
      </View>
      <View style={styles.SubContainer}>
        <Text style={{
          fontSize: 30,
          fontFamily: 'montserrat-bold',
          textAlign: 'center'
        }}>Effortless Medication Tracking with <Text style={{
          color: Colors.PRIMARY
        }}>MedEase</Text></Text>
        <Text style={{
          fontSize: 15,
          fontFamily: 'montserrat-medium',
          textAlign: 'center',
          marginVertical: 10,
          color: Colors.GRAY
        }}>Streamline your medication routine and embrace peace of mind!</Text>
      </View>

      <TouchableOpacity style={styles.btn}
      onPress={onPress}
      >
        <Text style={{
          textAlign:'center',
          color: '#fff',
          fontFamily: 'montserrat-bold',
        }}>Let's Get Started</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  SubContainer:{
    backgroundColor: '#fff', 
    padding: 20,
    marginTop: -20,
  },
  btn:{
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 99,
    marginBottom: 10,
    marginHorizontal: 20
  }
})