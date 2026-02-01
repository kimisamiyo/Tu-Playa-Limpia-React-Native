import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { rs } from '../../constants/responsive';

// ═══════════════════════════════════════════════════════════════════════════
// GLASS CARD - Premium glassmorphism card component
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GlassCard - A premium glassmorphism-style card
 * @param {object} props
 * @param {ReactNode} props.children - Content
 * @param {'default'|'elevated'|'flat'} props.variant - Style variant
 * @param {boolean} props.withGradientBorder - Show gradient border
 * @param {object} props.style - Additional styles
 */
export default function GlassCard({
    children,
    variant = 'default',
    withGradientBorder = false,
    style,
    ...props
}) {
    const { colors, shadows, isDark } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'elevated':
                return {
                    backgroundColor: isDark
                        ? 'rgba(20, 83, 116, 0.7)'
                        : 'rgba(255, 255, 255, 0.95)',
                    ...shadows.lg,
                };
            case 'flat':
                return {
                    backgroundColor: isDark
                        ? 'rgba(20, 83, 116, 0.4)'
                        : 'rgba(255, 255, 255, 0.7)',
                    ...shadows.none,
                };
            default:
                return {
                    backgroundColor: isDark
                        ? 'rgba(20, 83, 116, 0.5)'
                        : 'rgba(255, 255, 255, 0.85)',
                    ...shadows.md,
                };
        }
    };

    const variantStyles = getVariantStyles();

    if (withGradientBorder) {
        return (
            <View style={[styles.gradientBorderContainer, style]} {...props}>
                <LinearGradient
                    colors={isDark
                        ? ['rgba(0, 198, 255, 0.5)', 'rgba(0, 255, 255, 0.3)', 'rgba(0, 198, 255, 0.5)']
                        : ['rgba(0, 51, 78, 0.3)', 'rgba(20, 83, 116, 0.2)', 'rgba(0, 51, 78, 0.3)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBorder}
                >
                    <View style={[styles.innerCard, variantStyles]}>
                        {/* Shine overlay */}
                        <View style={[styles.shineOverlay, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.4)' }]} />
                        {children}
                    </View>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.card,
                variantStyles,
                { borderColor: colors.glassBorder },
                style,
            ]}
            {...props}
        >
            {/* Shine overlay */}
            <View style={[styles.shineOverlay, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.3)' }]} />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: rs(16),
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    gradientBorderContainer: {
        borderRadius: rs(17),
        overflow: 'hidden',
    },
    gradientBorder: {
        padding: rs(2),
        borderRadius: rs(17),
    },
    innerCard: {
        borderRadius: rs(15),
        overflow: 'hidden',
        position: 'relative',
    },
    shineOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        borderTopLeftRadius: rs(15),
        borderTopRightRadius: rs(15),
        zIndex: 0,
    },
});
