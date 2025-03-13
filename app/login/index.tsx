import React, { useState } from 'react';    // useState for Manages input state for username and password.
import { Text, View, Image, TextInput, Alert, TouchableOpacity } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated,{FadeInUp, FadeInDown} from 'react-native-reanimated'
// import {Link} from "expo-router"
import { useRouter } from "expo-router"

export default function Login() {
  const [username, setUsername] = useState('');   // Stores user input for username and password.
  const [password, setPassword] = useState('');
  const router = useRouter();
  // Hardcoded admin credentials
  const adminCredentials = {
    username: 'admin',
    password: 'samaru',
  };
  const handleLogin = () => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      Alert.alert('Login Successful', 'Welcome Admin!', [
        { text: 'OK', onPress: () => router.push('../(tab)') },
      ]);
    } else {
      Alert.alert('Login Failed', 'Invalid Username or Password!');
    }
  };
  return (
    <View className="bg-white h-full w-full">
      <StatusBar style = "light"/>
      <Image className="h-full w-full absolute" source={require('../../assets/images/background1.png')}/>
     
      <View className="flex-row justify-around w-full absolute">
        <Animated.Image entering={FadeInUp.delay(200).duration(1000).springify().damping(3)} className="h-[200] w-[81]" source={require('../../assets/images/light.png')}/>
        <Animated.Image entering={FadeInUp.delay(400).duration(1000).springify().damping(3)} className="h-[160] w-[65]" source={require('../../assets/images/light.png')}/>
      </View>
      <View className = "h-full w-full flew justify-around pt-40 pb-14">
        <View className="flex items-center">
          <Animated.Text entering={FadeInUp.duration(1000).springify()} className="text-white font-bold tracking-wider text-5xl">
            Login
          </Animated.Text>
        </View>
        <View className="flex item-center mx-4 space-y-4">
          <Animated.View entering={FadeInDown.duration(1000).springify()} className="bg-black/5 p-5 rounded-2xl w-full mb-3">
            <TextInput placeholder='username' placeholderTextColor={'gray'} value={username} onChangeText={setUsername}/>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="bg-black/5 p-5 rounded-2xl w-full mb-3">
            <TextInput placeholder='Password' placeholderTextColor={'gray'} secureTextEntry value={password} onChangeText={setPassword}/>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="w-full">
            <TouchableOpacity
              className="w-full bg-sky-400 p-3 rounded-2xl mb-3" onPress={handleLogin}>
                <Text className='text-xl font-bold text-white text-center'>Login</Text>
            </TouchableOpacity>

          </Animated.View>
          
        </View>

      </View>
    </View>
  )

}

