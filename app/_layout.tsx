import React from 'react'
import { Stack } from 'expo-router'
import { Slot } from "expo-router"
import "../global.css"


export default function RootLayout() {
  return(
    <Stack screenOptions={{ headerShown: false}}>
      <Stack.Screen name="(tab)" />
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="scanner" />


      </Stack>
  
  )
}

