import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useWallet } from '../context/WalletContext';
import { useGame } from '../context/GameContext';
import { BRAND } from '../constants/theme';
import { rs, rf, rh, SPACING, RADIUS } from '../constants/responsive';
import LivingWater from '../components/LivingWater';
import FloatingBubbles from '../components/premium/FloatingBubbles';
import GlassCard from '../components/premium/GlassCard';

export default function ConnectWalletScreen() {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const { connectMetaMask, provider, address, markWalletScreenSeen } = useWallet();
    const { updateUserProfile, reloadGameState } = useGame();
    const [connecting, setConnecting] = useState(false);

    // Si la wallet ya se conectó automágicamente, avanzamos casi de inmediato
    useEffect(() => {
        if (address && !connecting) {
            console.log("ConnectWalletScreen: User connected! Saving address:", address);
            // 1. Guardar la address localmente en su perfil para persistencia futura
            updateUserProfile({ walletAddress: address });

            // 2. Forzar hidratación del juego pasándole la dirección fresquita
            reloadGameState(address);

            markWalletScreenSeen();
        }
    }, [address, connecting]);

    const handleConnectPali = async () => {
        setConnecting(true);
        try {
            // Nota: En un futuro, añadiríamos connectPali() a WalletContext.
            // Por consistencia con la arquitectura de PALI existente en la DApp,
            // podemos reutilizar el flujo si `pali` está en local, pero hoy
            // redirigimos a MetaMask universal que soporta WalletConnect.
            await connectMetaMask("Pali");
        } catch (e) {
            console.error(e);
        } finally {
            setConnecting(false);
        }
    };

    const handleConnectMetaMask = async () => {
        setConnecting(true);
        try {
            await connectMetaMask();
            // El useEffect superior se disparará y llamará a markWalletScreenSeen()
        } catch (e) {
            console.error(e);
        } finally {
            setConnecting(false);
        }
    };

    const handleSkip = () => {
        markWalletScreenSeen();
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={isDark
                    ? [BRAND.oceanDeep, BRAND.oceanDark, BRAND.oceanMid]
                    : [BRAND.biolumSoft, colors.background, colors.backgroundSecondary]
                }
                style={StyleSheet.absoluteFill}
            />
            <FloatingBubbles count={8} minSize={6} maxSize={16} pointerEvents="none" />

            <View style={styles.bgContainer} pointerEvents="none">
                <LivingWater />
            </View>

            <SafeAreaView style={styles.safeContainer}>
                <View style={styles.header}>
                    <Animated.Text entering={FadeInDown.springify()} style={[styles.title, { color: isDark ? colors.accent : colors.primary }]}>
                        Conecta tu Wallet
                    </Animated.Text>
                    <Animated.Text entering={FadeInDown.delay(100).springify()} style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Desbloquea tus recompensas Web3
                    </Animated.Text>
                </View>

                <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.container}>
                    <GlassCard variant="elevated" style={styles.card}>

                        <View style={styles.iconCircle}>
                            <LinearGradient
                                colors={[BRAND.oceanMid, BRAND.oceanDark]}
                                style={styles.iconBg}
                            >
                                <Ionicons name="wallet-outline" size={rs(36)} color="#fff" />
                            </LinearGradient>
                        </View>

                        <Text style={[styles.descText, { color: colors.text }]}>
                            Conecta de forma segura para sincronizar todos tus certificados de limpieza y verlos en el mapa.
                        </Text>

                        {connecting ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={BRAND.oceanLight} />
                                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Conectando a Web3...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.paliButton]}
                                    onPress={handleConnectPali}
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={require('../assets/logo-pali.png')}
                                        style={styles.btnIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.btnText}>Conectar Pali</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.mmButton]}
                                    onPress={handleConnectMetaMask}
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={require('../assets/logo-metamask.png')}
                                        style={styles.btnIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.btnText}>Conectar MetaMask</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </GlassCard>

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={handleSkip}
                        disabled={connecting}
                    >
                        <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                            Saltar por ahora (Entrar como invitado)
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    bgContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.3 },
    safeContainer: { flex: 1, justifyContent: 'center' },
    header: {
        alignItems: 'center',
        paddingVertical: rh(30),
        marginBottom: rh(20),
    },
    title: {
        fontSize: rf(28),
        fontWeight: '800',
        letterSpacing: rs(0.5),
        marginBottom: rs(8),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: rf(14),
        letterSpacing: rs(1),
        fontWeight: '500',
        textAlign: 'center',
    },
    container: {
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
        paddingHorizontal: SPACING.lg,
    },
    card: {
        borderRadius: rs(24),
        padding: SPACING.xl,
        alignItems: 'center',
    },
    iconCircle: {
        marginBottom: SPACING.lg,
    },
    iconBg: {
        width: rs(80),
        height: rs(80),
        borderRadius: rs(40),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: BRAND.oceanLight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    descText: {
        fontSize: rf(15),
        textAlign: 'center',
        lineHeight: rf(22),
        marginBottom: rh(30),
        opacity: 0.9,
    },
    buttonsContainer: {
        width: '100%',
        gap: SPACING.md,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: rs(60),
        borderRadius: rs(18),
        paddingHorizontal: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    paliButton: {
        backgroundColor: '#f1f5f9',
    },
    mmButton: {
        backgroundColor: '#ffffff',
    },
    btnIcon: {
        width: rs(32),
        height: rs(32),
        marginRight: SPACING.sm,
    },
    btnText: {
        fontSize: rf(16),
        fontWeight: '700',
        color: '#1e293b',
    },
    loadingContainer: {
        paddingVertical: SPACING.xl,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.sm,
        fontSize: rf(14),
        fontWeight: '500',
    },
    skipButton: {
        marginTop: SPACING.xl,
        padding: SPACING.md,
        alignItems: 'center',
    },
    skipText: {
        fontSize: rf(14),
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
