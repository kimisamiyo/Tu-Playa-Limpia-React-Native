import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import CustomSplash from './components/CustomSplash';
import { GameProvider } from './context/GameContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Inner App component that can use theme
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const { isDark } = useTheme();

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
    <>
      <NavigationContainer>
        <AppNavigator isAuthenticated={isAuthenticated} onAuthSuccess={handleAuthenticated} />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ThemeProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </ThemeProvider>
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

