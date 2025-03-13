import React from 'react'
import { Tabs } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome';


export default function TabRoot() {
    return (
        <Tabs screenOptions={{
            headerStyle: {
              backgroundColor: '#0EA5E9',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
            <Tabs.Screen name = "index" options={{
                title: 'Home',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={'#0EA5E9'} />, }} />
            <Tabs.Screen name = "eventSetting" options={{
                title: 'Settings',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={'#0EA5E9'} />, }} />
        </Tabs>
      )
}

