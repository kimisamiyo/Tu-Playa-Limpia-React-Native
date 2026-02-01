import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { rs, rf, SCREEN } from '../constants/responsive';
import { SPRING } from '../constants/animations';

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM PIN PAD - Glassmorphism-styled numeric keypad
// ═══════════════════════════════════════════════════════════════════════════

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Single key component with premium styling
const PinKey = ({ value, onPress, children, variant = 'number' }) => {
    const { colors, isDark } = useTheme();
    const scale = useSharedValue(1);
    const bgOpacity = useSharedValue(0);

    const handlePressIn = () => {
        scale.value = withSpring(0.92, SPRING.snappy);
        bgOpacity.value = withTiming(1, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, SPRING.snappy);
        bgOpacity.value = withTiming(0, { duration: 200 });
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(value);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const bgStyle = useAnimatedStyle(() => ({
        opacity: bgOpacity.value,
    }));

    const getKeyColor = () => {
        if (variant === 'biometric') return colors.accent;
        if (variant === 'delete') return colors.textSecondary;
        return colors.text;
    };

    // Calculate responsive key size
    const keySize = Math.min(rs(75), (SCREEN.width - rs(100)) / 3);

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={[
                styles.keyWrapper,
                { width: keySize, height: keySize },
                animatedStyle,
            ]}
        >
            {/* Glass background */}
            <View
                style={[
                    styles.keyGlass,
                    {
                        backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 51, 78, 0.04)',
                        borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 51, 78, 0.08)',
                    },
                ]}
            >
                {/* Press highlight */}
                <Animated.View
                    style={[
                        styles.keyHighlight,
                        {
                            backgroundColor: isDark
                                ? 'rgba(255, 255, 255, 0.15)'
                                : 'rgba(0, 51, 78, 0.08)',
                        },
                        bgStyle,
                    ]}
                />

                {/* Content */}
                {children || (
                    <Text style={[styles.keyNumber, { color: getKeyColor() }]}>
                        {value}
                    </Text>
                )}
            </View>
        </AnimatedPressable>
    );
};

export default function PinPad({ onPinPress, onBiometricPress, onDeletePress }) {
    const { colors, isDark } = useTheme();

    const numbers = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        ['bio', 0, 'del'],
    ];

    return (
        <View style={styles.container}>
            {numbers.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((item) => {
                        // Biometric button
                        if (item === 'bio') {
                            return (
                                <PinKey
                                    key={item}
                                    value={item}
                                    onPress={onBiometricPress}
                                    variant="biometric"
                                >
                                    <Ionicons
                                        name="finger-print"
                                        size={rs(32)}
                                        color={colors.accent}
                                    />
                                </PinKey>
                            );
                        }
                        // Delete button
                        if (item === 'del') {
                            return (
                                <PinKey
                                    key={item}
                                    value={item}
                                    onPress={onDeletePress}
                                    variant="delete"
                                >
                                    <Ionicons
                                        name="backspace-outline"
                                        size={rs(28)}
                                        color={isDark ? colors.textSecondary : colors.textMuted}
                                    />
                                </PinKey>
                            );
                        }
                        // Number button
                        return (
                            <PinKey
                                key={item}
                                value={item.toString()}
                                onPress={onPinPress}
                            />
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: rs(20),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        maxWidth: rs(350),
        marginBottom: rs(16),
    },
    keyWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyGlass: {
        width: '100%',
        height: '100%',
        borderRadius: rs(24),
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    keyHighlight: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: rs(24),
    },
    keyNumber: {
        fontSize: rf(28),
        fontWeight: '400',
        letterSpacing: 1,
    },
});
