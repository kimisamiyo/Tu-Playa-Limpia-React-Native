import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigation/AppNavigator';
import { GameProvider } from './context/GameContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WalletProvider } from "./context/WalletContext";
import { injectPaliWallet } from './utils/paliInjector';
import ENV from './constants/env';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons, FontAwesome, Feather } from '@expo/vector-icons';
function AppContent() {
  const { isDark } = useTheme();
  const { isAuthenticated, isLoading, isFirstTime, register, login, importAccount, username } = useAuth();
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome.font,
    ...Feather.font,
  });
  React.useEffect(() => {
    (async () => {
      try {
        const storedVersion = await AsyncStorage.getItem('@tpl_app_version');
        if (storedVersion !== ENV.APP_VERSION) {
          const staleKeys = [
            '@tpl_scan_permission_revoked',
          ];
          await AsyncStorage.multiRemove(staleKeys);
          await AsyncStorage.setItem('@tpl_app_version', ENV.APP_VERSION);
          console.log(`App updated: ${storedVersion || 'none'} → ${ENV.APP_VERSION}`);
        }
      } catch (e) {
        console.warn('Version check error:', e);
      }
    })();
  }, []);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      injectPaliWallet().then((success) => {
        if (success) {
          console.log("Pali Wallet disponible para usar");
        } else {
          console.warn("Pali Wallet no disponible.");
        }
      });
    }
  }, []);
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
