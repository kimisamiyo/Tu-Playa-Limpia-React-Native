import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { rs, rf, rh, SCREEN } from '../constants/responsive';
import { SPRING, DURATION } from '../constants/animations';
import { BRAND } from '../constants/theme';

// Modular Components
import FishBowlLoader from './FishBowlLoader';
import PinDisplay from './PinDisplay';
import PinPad from './PinPad';
import LivingWater from './LivingWater';
import FloatingBubbles from './premium/FloatingBubbles';

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM AUTH SCREEN - Glassmorphism PIN entry with biometrics
// ═══════════════════════════════════════════════════════════════════════════

export default function AuthScreen({ onAuthenticated }) {
    const { colors, isDark } = useTheme();
    const { user } = useGame();
    const [pin, setPin] = useState('');
    const shake = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const contentY = useSharedValue(rs(30));

    // Entrance animation
    useEffect(() => {
        contentOpacity.value = withTiming(1, { duration: 600 });
        contentY.value = withSpring(0, SPRING.smooth);
    }, []);

    useEffect(() => {
        // Safe Biometric Check
        const checkBiometricsSafe = async () => {
            try {
                const hasHardware = await LocalAuthentication.hasHardwareAsync();
                if (!hasHardware) return;

                const isEnrolled = await LocalAuthentication.isEnrolledAsync();
                if (isEnrolled) {
                    authenticate();
                }
            } catch (error) {
                console.warn("Biometric check failed safely:", error);
            }
        };
        checkBiometricsSafe();
    }, []);

    const authenticate = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Acceso Tu Playa Limpia',
                fallbackLabel: 'Usar PIN',
            });

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onAuthenticated();
            }
        } catch (err) {
            console.warn("Authentication failed:", err);
        }
    };

    const handlePinPress = (number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (pin.length < 4) {
            const newPin = pin + number;
            setPin(newPin);
            if (newPin.length === 4) {
                if (newPin === '1234') { // Demo PIN
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    onAuthenticated();
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    // Shake animation
                    shake.value = withSequence(
                        withSpring(rs(12), { velocity: 100, stiffness: 500 }),
                        withSpring(-rs(12), { velocity: 100, stiffness: 500 }),
                        withSpring(rs(8), { velocity: 80, stiffness: 500 }),
                        withSpring(-rs(8), { velocity: 80, stiffness: 500 }),
                        withSpring(0, { velocity: 50, stiffness: 500 })
                    );
                    setTimeout(() => setPin(''), 300);
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentY.value }],
    }));

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
            {/* Background gradient */}
            <LinearGradient
                colors={isDark
                    ? [BRAND.oceanDeep, BRAND.oceanDark, BRAND.oceanMid]
                    : [colors.background, colors.backgroundSecondary, colors.backgroundTertiary]
                }
                style={StyleSheet.absoluteFill}
            />

            {/* Ambient bubbles (only in dark mode for underwater effect) */}
            {isDark && <FloatingBubbles count={8} minSize={6} maxSize={16} />}

            {/* Background water layer */}
            <View style={styles.bgContainer}>
                <LivingWater />
            </View>

            <SafeAreaView style={styles.safeContainer}>
                <Animated.View style={[styles.contentWrapper, contentStyle]}>
                    {/* Header Area */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: isDark ? colors.accent : colors.primary }]}>
                            Bienvenido
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {user?.name || 'Tu impacto comienza hoy'}
                        </Text>
                    </View>

                    {/* Visual Centerpiece - The Happy Fish */}
                    <View style={styles.centerStage}>
                        <FishBowlLoader />
                    </View>

                    {/* PIN Display & Feedback */}
                    <View style={styles.feedbackArea}>
                        <PinDisplay pinLength={pin.length} shakeValue={shake} />
                        <Text style={[styles.pinHint, { color: colors.textMuted }]}>
                            Ingresa tu PIN de 4 dígitos
                        </Text>
                    </View>

                    {/* Input Area */}
                    <View style={styles.inputArea}>
                        <PinPad
                            onPinPress={handlePinPress}
                            onBiometricPress={authenticate}
                            onDeletePress={handleDelete}
                        />
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    bgContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    safeContainer: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        paddingTop: rh(20),
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: rf(30),
        fontWeight: '700',
        letterSpacing: rs(1),
        marginBottom: rs(6),
    },
    subtitle: {
        fontSize: rf(14),
        textTransform: 'uppercase',
        letterSpacing: rs(2),
        fontWeight: '500',
    },
    centerStage: {
        flex: 2.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    feedbackArea: {
        flex: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinHint: {
        fontSize: rf(12),
        marginTop: rs(8),
        letterSpacing: rs(0.5),
    },
    inputArea: {
        flex: 3.5,
        justifyContent: 'center',
        paddingBottom: rh(20),
    },
});
