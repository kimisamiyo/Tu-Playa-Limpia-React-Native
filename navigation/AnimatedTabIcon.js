import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { rs } from '../constants/responsive';
import { SPRING } from '../constants/animations';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED TAB ICON - Clean, subtle design matching system colors
// ═══════════════════════════════════════════════════════════════════════════

export default function AnimatedTabIcon({ name, focused, size = 24 }) {
    const { colors, isDark } = useTheme();

    // Animation values
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const bgOpacity = useSharedValue(0);

    useEffect(() => {
        if (focused) {
            // Float up and scale slightly
            translateY.value = withSpring(rs(-10), { damping: 14, stiffness: 160 });
            scale.value = withSpring(1.1, SPRING.smooth);
            bgOpacity.value = withTiming(1, { duration: 200 });
        } else {
            // Reset
            translateY.value = withSpring(0, SPRING.smooth);
            scale.value = withSpring(1, SPRING.gentle);
            bgOpacity.value = withTiming(0, { duration: 150 });
        }
    }, [focused]);

    // Container animation
    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    // Background animation
    const bgStyle = useAnimatedStyle(() => ({
        opacity: bgOpacity.value,
    }));

    // Subtle, system-matching colors (no high contrast)
    const iconColor = focused
        ? (isDark ? colors.textSecondary : colors.textSecondary)  // Subtle active color
        : colors.tabInactive;

    // Very subtle background - blends with tab bar
    const bgColor = isDark
        ? 'rgba(85, 136, 163, 0.2)'   // Muted ocean
        : 'rgba(26, 58, 74, 0.08)';   // Very subtle

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            {/* Subtle background */}
            <Animated.View
                style={[
                    styles.activeBg,
                    { backgroundColor: bgColor },
                    bgStyle,
                ]}
            />

            {/* Icon */}
            <View style={styles.iconWrapper}>
                <Ionicons
                    name={focused ? name : `${name}-outline`}
                    size={rs(size)}
                    color={iconColor}
                />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: rs(50),
        height: rs(50),
    },
    iconWrapper: {
        zIndex: 2,
    },
    activeBg: {
        position: 'absolute',
        width: rs(44),
        height: rs(44),
        borderRadius: rs(22),
        zIndex: 1,
    },
});
