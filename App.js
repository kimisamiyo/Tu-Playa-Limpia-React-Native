import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import CustomSplash from './components/CustomSplash';
import { GameProvider } from './context/GameContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true); // Show splash screen

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (isSplashVisible) {
    return <CustomSplash onAnimationFinish={handleSplashFinish} />;
  }


  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <GameProvider>
        <NavigationContainer>
          <AppNavigator isAuthenticated={isAuthenticated} onAuthSuccess={handleAuthenticated} />
          <StatusBar style="light" />
        </NavigationContainer>
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
