import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { rs } from '../constants/responsive';
import { SPRING } from '../constants/animations';

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM PIN DISPLAY - Animated dot indicators with fill animation
// ═══════════════════════════════════════════════════════════════════════════

const DOT_SIZE = rs(14);
const DOT_SPACING = rs(18);

// Single animated dot
const PinDot = ({ isFilled, index }) => {
    const { colors, isDark } = useTheme();
    const fillProgress = useSharedValue(0);
    const scale = useSharedValue(1);
    const glow = useSharedValue(0);

    useEffect(() => {
        if (isFilled) {
            // Fill animation with bounce
            scale.value = withSequence(
                withSpring(1.3, { damping: 8, stiffness: 400 }),
                withSpring(1, SPRING.snappy)
            );
            fillProgress.value = withTiming(1, { duration: 200 });
            glow.value = withSequence(
                withTiming(1, { duration: 150 }),
                withTiming(0.5, { duration: 300 })
            );
        } else {
            fillProgress.value = withTiming(0, { duration: 150 });
            scale.value = withSpring(1, SPRING.gentle);
            glow.value = withTiming(0, { duration: 150 });
        }
    }, [isFilled]);

    const dotStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            fillProgress.value,
            [0, 1],
            [
                isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 51, 78, 0.15)',
                isDark ? colors.accent : colors.primary,
            ]
        );

        return {
            backgroundColor,
            transform: [{ scale: scale.value }],
            shadowOpacity: glow.value * 0.5,
            shadowRadius: glow.value * rs(8),
        };
    });

    return (
        <Animated.View
            style={[
                styles.dot,
                {
                    borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'rgba(0, 51, 78, 0.2)',
                    shadowColor: isDark ? colors.accent : colors.primary,
                },
                dotStyle,
            ]}
        />
    );
};

export default function PinDisplay({ pinLength, shakeValue }) {
    const { colors } = useTheme();

    // Shake animation style
    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeValue.value }],
    }));

    const dots = [0, 1, 2, 3];

    return (
        <Animated.View style={[styles.container, shakeStyle]}>
            {dots.map((index) => (
                <PinDot
                    key={index}
                    index={index}
                    isFilled={index < pinLength}
                />
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: DOT_SPACING,
        paddingVertical: rs(20),
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 0 },
    },
});
