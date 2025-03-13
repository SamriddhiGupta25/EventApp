import React from 'react'
import { Text, View, Image, TouchableOpacity} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import {Link} from "expo-router"
import Animated,{FadeInUp, FadeInDown} from 'react-native-reanimated'

export default function Index() {
  return (
    <View className="bg-white h-full w-full">
      <StatusBar style = "light"/>
      <Image className="h-full w-full absolute" source={require('../assets/images/background1.png')}/>
     
      <View className="flex-row justify-around w-full absolute">
        <Animated.Image entering={FadeInUp.delay(200).duration(1000).springify().damping(3)} className="h-[200] w-[81]" source={require('../assets/images/light.png')}/>
        <Animated.Image entering={FadeInUp.delay(400).duration(1000).springify().damping(3)} className="h-[160] w-[65]" source={require('../assets/images/light.png')}/>
      </View>
      <View className = "h-full w-full flew justify-around pt-40 pb-48">
        <View className="flex items-center">
          <Animated.Text entering={FadeInUp.duration(1000).springify()} className="text-white font-bold tracking-wider text-5xl">
            Welcome
          </Animated.Text>
        </View>
        <View className="flex item-center mx-4 space-y-4">
          <Animated.View entering={FadeInDown.duration(1000).springify()} className="w-full">
            <Link href={"/scanner"} asChild>
            <TouchableOpacity
              className="w-full bg-sky-400 p-3 rounded-2xl mb-3">
                <Text className='text-xl font-bold text-white text-center'>Go To Scan</Text>
            </TouchableOpacity>
            </Link>

          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="flex-row justify-center">
            <Text>if you are admin?</Text>
              <Link href={"/login"} asChild>
              <TouchableOpacity>
                <Text className="text-sky-600">login</Text>
              </TouchableOpacity>
                
              </Link>
            </Animated.View>
          
        </View>

      </View>
    </View>
  )

}



