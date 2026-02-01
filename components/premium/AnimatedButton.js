import React, { useCallback } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { rs, rf } from '../../constants/responsive';
import { SPRING, SCALE } from '../../constants/animations';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED BUTTON - Premium button with liquid/ripple effects
// ═══════════════════════════════════════════════════════════════════════════

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * AnimatedButton - Premium animated button
 * @param {object} props
 * @param {string} props.title - Button text
 * @param {function} props.onPress - Press handler
 * @param {'primary'|'secondary'|'ghost'|'danger'} props.variant - Style variant
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.withHaptics - Enable haptic feedback
 * @param {ReactNode} props.icon - Optional icon component
 * @param {boolean} props.fullWidth - Full width button
 */
export default function AnimatedButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    withHaptics = true,
    icon,
    fullWidth = false,
    style,
    textStyle,
    ...props
}) {
    const { colors, shadows, isDark } = useTheme();

    const scale = useSharedValue(1);
    const pressed = useSharedValue(0);

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(SCALE.pressed, SPRING.snappy);
        pressed.value = withTiming(1, { duration: 100 });
    }, []);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1, SPRING.snappy);
        pressed.value = withTiming(0, { duration: 150 });
    }, []);

    const handlePress = useCallback(() => {
        if (withHaptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.();
    }, [onPress, withHaptics]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: disabled ? 0.5 : 1,
    }));

    // Size configs
    const sizeConfig = {
        sm: { height: rs(40), paddingHorizontal: rs(16), fontSize: rf(12) },
        md: { height: rs(52), paddingHorizontal: rs(24), fontSize: rf(14) },
        lg: { height: rs(60), paddingHorizontal: rs(32), fontSize: rf(16) },
    }[size];

    // Variant configs
    const getVariantConfig = () => {
        switch (variant) {
            case 'secondary':
                return {
                    gradientColors: isDark
                        ? ['#5588a3', '#145374']
                        : ['#145374', '#00334e'],
                    textColor: '#ffffff',
                    borderColor: 'transparent',
                };
            case 'ghost':
                return {
                    gradientColors: ['transparent', 'transparent'],
                    textColor: colors.primary,
                    borderColor: colors.border,
                };
            case 'danger':
                return {
                    gradientColors: ['#e53935', '#c62828'],
                    textColor: '#ffffff',
                    borderColor: 'transparent',
                };
            default: // primary
                return {
                    gradientColors: isDark
                        ? ['#145374', '#00334e']
                        : ['#00334e', '#001a2e'],
                    textColor: '#ffffff',
                    borderColor: 'transparent',
                };
        }
    };

    const variantConfig = getVariantConfig();

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled}
            style={[
                animatedStyle,
                fullWidth && styles.fullWidth,
                style,
            ]}
            {...props}
        >
            <LinearGradient
                colors={variantConfig.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.gradient,
                    {
                        height: sizeConfig.height,
                        paddingHorizontal: sizeConfig.paddingHorizontal,
                        borderColor: variantConfig.borderColor,
                        borderWidth: variant === 'ghost' ? 1 : 0,
                    },
                    shadows.md,
                ]}
            >
                {icon && <Animated.View style={styles.iconContainer}>{icon}</Animated.View>}
                <Text
                    style={[
                        styles.text,
                        {
                            color: variantConfig.textColor,
                            fontSize: sizeConfig.fontSize,
                        },
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            </LinearGradient>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: rs(16),
    },
    text: {
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    iconContainer: {
        marginRight: rs(8),
    },
    fullWidth: {
        width: '100%',
    },
});
