import React, { useEffect } from 'react'
import './global.css'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider } from './src/context/AuthContext'
import { DataProvider } from './src/context/DataContext'
import { AppNavigator } from './src/navigation/AppNavigator'

SplashScreen.preventAutoHideAsync()

export default function App() {
  useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync()
      } catch (e) {
        console.error(e)
      }
    }
    hideSplash()
  }, [])

  return (
    <GestureHandlerRootView className="flex-1">
      <AuthProvider>
        <DataProvider>
          <AppNavigator />
        </DataProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
