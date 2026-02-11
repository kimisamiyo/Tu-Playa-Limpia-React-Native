import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from "../context/WalletContext";
import { connectMetaMask } from "../utils/wallet/providers";
import { connectWalletConnect } from "../utils/wallet/walletConnect";
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import GlassCard from '../components/premium/GlassCard';
import { rs, SPACING, RADIUS } from '../constants/responsive';
import { BRAND } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function ConnectWalletScreen({ onSuccess }) {
  const { setProvider, setSigner, setAddress } = useWallet();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(null);

  const handleConnectionSuccess = (data) => {
    console.log('Connection success:', data);
    // Guardar datos en el contexto
    if (data.provider) setProvider(data.provider);
    if (data.signer) setSigner(data.signer);
    if (data.address) setAddress(data.address);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Mostrar mensaje de éxito
    const addressDisplay = data.address 
      ? `${data.address.substring(0, 6)}...${data.address.substring(data.address.length - 4)}`
      : 'Conectado';
    
    Alert.alert(
      t('wallet_success'),
      `${t('wallet_connected')}: ${addressDisplay}`,
      [{ text: 'OK', onPress: onSuccess }]
    );
  };

  const handleMetaMask = async () => {
    try {
      console.log('Starting MetaMask connection...');
      setLoading('metamask');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const data = await connectMetaMask();
      console.log('MetaMask data:', data);
      
      if (data.success || data.address) {
        handleConnectionSuccess(data);
      } else {
        throw new Error('No se obtuvo dirección de MetaMask');
      }
    } catch (error) {
      console.error('MetaMask error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('wallet_error'), error.message || 'No se pudo conectar con MetaMask');
    } finally {
      setLoading(null);
    }
  };

  const handleWalletConnect = async () => {
    try {
      console.log('Starting WalletConnect...');
      setLoading('walletconnect');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const data = await connectWalletConnect();
      console.log('WalletConnect data:', data);
      
      if (data.success || data.address) {
        handleConnectionSuccess(data);
      } else {
        throw new Error('No se obtuvo dirección de WalletConnect');
      }
    } catch (error) {
      console.error('WalletConnect error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('wallet_error'), error.message || 'No se pudo conectar con WalletConnect');
    } finally {
      setLoading(null);
    }
  };

  const isWebPlatform = Platform.OS === 'web';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>{t('wallet_connect_title')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('wallet_connect_desc')}</Text>

      {/* MetaMask Option */}
      <Pressable 
        onPress={handleMetaMask}
        disabled={loading !== null}
        style={({ pressed }) => [
          styles.pressableContainer,
          { opacity: pressed ? 0.8 : loading !== null && loading !== 'metamask' ? 0.5 : 1 }
        ]}
      >
        <GlassCard variant="elevated" style={[
          styles.walletCard,
          { opacity: loading === 'metamask' ? 0.7 : 1 }
        ]}>
          <LinearGradient
            colors={['#F6851B', '#FF6B35']}
            style={styles.walletIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.walletIconText}>🦊</Text>
          </LinearGradient>
          <View style={styles.walletInfo}>
            <Text style={[styles.walletName, { color: colors.text }]}>MetaMask</Text>
            <Text style={[styles.walletDesc, { color: colors.textSecondary }]}>
              {isWebPlatform 
                ? t('wallet_metamask_desc')
                : 'Abre MetaMask en tu dispositivo'}
            </Text>
          </View>
          {loading === 'metamask' ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <Ionicons name="arrow-forward" size={rs(20)} color={colors.accent} />
          )}
        </GlassCard>
      </Pressable>

      {/* WalletConnect Option */}
      <Pressable 
        onPress={handleWalletConnect}
        disabled={loading !== null}
        style={({ pressed }) => [
          styles.pressableContainer,
          { opacity: pressed ? 0.8 : loading !== null && loading !== 'walletconnect' ? 0.5 : 1 }
        ]}
      >
        <GlassCard variant="elevated" style={[
          styles.walletCard,
          { opacity: loading === 'walletconnect' ? 0.7 : 1 }
        ]}>
          <LinearGradient
            colors={['#3B99FC', '#3B99FC']}
            style={styles.walletIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.walletIconText}>📱</Text>
          </LinearGradient>
          <View style={styles.walletInfo}>
            <Text style={[styles.walletName, { color: colors.text }]}>WalletConnect</Text>
            <Text style={[styles.walletDesc, { color: colors.textSecondary }]}>
              {isWebPlatform
                ? t('wallet_walletconnect_desc')
                : 'Rainbow • Trust Wallet • Argent'}
            </Text>
          </View>
          {loading === 'walletconnect' ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <Ionicons name="arrow-forward" size={rs(20)} color={colors.accent} />
          )}
        </GlassCard>
      </Pressable>

      {/* Info Box */}
      <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        <Ionicons name="information-circle-outline" size={rs(20)} color={colors.accent} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {Platform.OS === 'web' 
            ? t('wallet_info_text')
            : 'Asegúrate de tener una billetera instalada en tu dispositivo'}
        </Text>
      </View>

      {isWebPlatform && (
        <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', marginTop: SPACING.sm }]}>
          <Ionicons name="warning-outline" size={rs(20)} color={BRAND.sandGold} />
          <Text style={[styles.infoText, { color: BRAND.sandGold }]}>
            En web, necesitas tener MetaMask o una extensión compatible instalada en tu navegador
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  pressableContainer: {
    borderRadius: RADIUS.lg,
  },
  title: {
    fontSize: rs(24),
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: rs(14),
    marginBottom: SPACING.lg,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  walletIcon: {
    width: rs(50),
    height: rs(50),
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  walletIconText: {
    fontSize: rs(28),
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: rs(16),
    fontWeight: '700',
    marginBottom: rs(4),
  },
  walletDesc: {
    fontSize: rs(13),
  },
  infoBox: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.lg,
  },
  infoText: {
    fontSize: rs(12),
    marginLeft: SPACING.md,
    flex: 1,
    lineHeight: rs(18),
  },
});
