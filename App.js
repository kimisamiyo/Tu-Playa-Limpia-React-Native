import React from 'react';
// Trigger rebuild for WalletContext
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
import { WalletProvider } from "./context/WalletContext";
import { injectPaliWallet } from './utils/paliInjector';

import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons, FontAwesome, Feather } from '@expo/vector-icons';

// ═══════════════════════════════════════════════════════════════════════════
// Inner App component — reads auth state from context
// ═══════════════════════════════════════════════════════════════════════════
function AppContent() {
  const { isDark } = useTheme();
  const { isAuthenticated, isLoading, isFirstTime, register, login, importAccount, username } = useAuth();

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome.font,
    ...Feather.font,
  });

  // Inyectar Pali Wallet en web
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      injectPaliWallet().then((success) => {
        if (success) {
          console.log("✅ Pali Wallet disponible para usar");
        } else {
          console.warn("⚠️ Pali Wallet no está disponible. Asegúrate de tener la extensión instalada.");
        }
      });
    }
  }, []);

  // Only wait for Auth to initialize. If fonts fail, icons will pop in later.
  if (isLoading) return null;

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
                <WalletProvider>
                  <AppContent />
                </WalletProvider>
              </GameProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
