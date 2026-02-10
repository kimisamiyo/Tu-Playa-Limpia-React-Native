import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { GameProvider } from './context/GameContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// ═══════════════════════════════════════════════════════════════════════════
// Inner App component — reads auth state from context
// ═══════════════════════════════════════════════════════════════════════════
function AppContent() {
  const { isDark } = useTheme();
  const { isAuthenticated, isLoading, isFirstTime, register, login, importAccount, username } = useAuth();

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (isLoading) return null; // Wait for auth to initialize

  return (
    <>
      <NavigationContainer>
        <AppNavigator
          isAuthenticated={isAuthenticated}
          isFirstTime={isFirstTime}
          onRegister={register}
          onLogin={login}
          onImport={importAccount}
          username={username}
        />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationContainer>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Root App — wraps everything with providers
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider style={{ flex: 1 }}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <GameProvider>
                <AppContent />
              </GameProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
