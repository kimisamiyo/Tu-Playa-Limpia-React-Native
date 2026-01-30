import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, withSpring, withSequence, runOnJS } from 'react-native-reanimated';
import { COLORS, SIZES } from '../constants/theme';

// Modular Components
import FishBowlLoader from './FishBowlLoader';
import PinDisplay from './PinDisplay';
import PinPad from './PinPad';
import LivingWater from './LivingWater';

export default function AuthScreen({ onAuthenticated }) {
    const [pin, setPin] = useState('');
    const shake = useSharedValue(0);

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
                if (newPin === '1234') { // Hardcoded for demo
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    onAuthenticated();
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    // Trigger Shake Animation
                    shake.value = withSequence(
                        withSpring(10, { velocity: 100, stiffness: 500 }),
                        withSpring(-10, { velocity: 100, stiffness: 500 }),
                        withSpring(0, { velocity: 100, stiffness: 500 })
                    );
                    setPin('');
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
        <View style={styles.mainContainer}>
            {/* Background Layer - Full Screen */}
            <LivingWater />

            <SafeAreaView style={styles.safeContainer}>
                {/* 1. Header Area */}
                <View style={styles.header}>
                    <Text style={styles.title}>Bienvenido</Text>
                    <Text style={styles.subtitle}>Tu impacto comienza hoy</Text>
                </View>

                {/* 2. Visual Centerpiece - The Happy Fish */}
                <View style={styles.centerStage}>
                    <FishBowlLoader />
                </View>

                {/* 3. PIN Display & Feedback */}
                <View style={styles.feedbackArea}>
                    <PinDisplay pinLength={pin.length} shakeValue={shake} />
                </View>

                {/* 4. Input Area */}
                <View style={styles.inputArea}>
                    <PinPad
                        onPinPress={handlePinPress}
                        onBiometricPress={authenticate} // Directly call auth
                        onDeletePress={handleDelete}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    safeContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.highlight,
        letterSpacing: 1,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.accent,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    centerStage: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    feedbackArea: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputArea: {
        flex: 4,
        justifyContent: 'center',
        paddingBottom: 20,
    },
});
