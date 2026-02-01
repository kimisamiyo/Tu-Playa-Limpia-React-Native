import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSpring,
    withSequence,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { BRAND } from '../constants/theme';
import { rs, rf, rh, rw, SPACING, RADIUS, SCREEN } from '../constants/responsive';
import { SPRING } from '../constants/animations';
import FloatingBubbles from '../components/premium/FloatingBubbles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width, height } = Dimensions.get('window');

// Responsive scanner size - adapts to screen
const getScannerSize = () => {
    const baseSize = Math.min(SCREEN.width, SCREEN.height) * 0.7;
    return Math.min(baseSize, 350); // Cap for tablets
};

// ═══════════════════════════════════════════════════════════════════════════
// CORNER BRACKET COMPONENT - Properly positioned at corners
// ═══════════════════════════════════════════════════════════════════════════
const CornerBracket = ({ position, color, size = 28 }) => {
    const thickness = 4;
    const length = size;

    const getPositionStyle = () => {
        switch (position) {
            case 'topLeft':
                return { top: 0, left: 0 };
            case 'topRight':
                return { top: 0, right: 0 };
            case 'bottomLeft':
                return { bottom: 0, left: 0 };
            case 'bottomRight':
                return { bottom: 0, right: 0 };
            default:
                return {};
        }
    };

    const getLineStyles = () => {
        const isTop = position.includes('top');
        const isLeft = position.includes('Left');

        return {
            horizontal: {
                position: 'absolute',
                width: length,
                height: thickness,
                backgroundColor: color,
                borderRadius: thickness / 2,
                [isTop ? 'top' : 'bottom']: 0,
                [isLeft ? 'left' : 'right']: 0,
            },
            vertical: {
                position: 'absolute',
                width: thickness,
                height: length,
                backgroundColor: color,
                borderRadius: thickness / 2,
                [isTop ? 'top' : 'bottom']: 0,
                [isLeft ? 'left' : 'right']: 0,
            },
        };
    };

    const lines = getLineStyles();

    return (
        <View style={[styles.cornerBracket, getPositionStyle()]}>
            <View style={lines.horizontal} />
            <View style={lines.vertical} />
        </View>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCAN BUTTON
// ═══════════════════════════════════════════════════════════════════════════
const ScanButton = ({ icon, color, label, onPress, delay }) => {
    const { colors, isDark } = useTheme();
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.92, SPRING.snappy);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, SPRING.smooth);
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
    };

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={[styles.scanButton, buttonStyle]}
        >
            <Animated.View entering={FadeInUp.delay(delay).springify()}>
                <View style={[
                    styles.scanButtonInner,
                    {
                        borderColor: color,
                        backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.95)',
                    }
                ]}>
                    <Ionicons name={icon} size={rs(24)} color={color} />
                </View>
                <Text style={[styles.scanButtonLabel, { color: isDark ? '#fff' : '#1a3a4a' }]}>
                    {label}
                </Text>
            </Animated.View>
        </AnimatedPressable>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUCCESS POPUP
// ═══════════════════════════════════════════════════════════════════════════
const SuccessPopup = ({ visible, points, type }) => {
    const { colors, shadows, isDark } = useTheme();

    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeIn.springify()}
            style={[styles.successPopup, { backgroundColor: colors.surface }, shadows.xl]}
        >
            <LinearGradient
                colors={isDark ? [BRAND.oceanLight, BRAND.oceanMid] : [BRAND.success, '#2e7d32']}
                style={styles.successIcon}
            >
                <Ionicons name="checkmark" size={rs(26)} color="#fff" />
            </LinearGradient>
            <View style={styles.successContent}>
                <Text style={[styles.successPoints, { color: colors.text }]}>+{points} PTS</Text>
                <Text style={[styles.successType, { color: colors.textSecondary }]}>
                    {type?.toUpperCase()} DETECTADO
                </Text>
            </View>
        </Animated.View>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCAN SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export default function ScanScreen() {
    const { scanItem } = useGame();
    const { colors, isDark } = useTheme();
    const [lastScanned, setLastScanned] = useState(null);

    const scannerSize = getScannerSize();

    // Scanner line animation
    const scanLineY = useSharedValue(0);
    const pulseOpacity = useSharedValue(0.6);

    useEffect(() => {
        scanLineY.value = withRepeat(
            withTiming(scannerSize - 10, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.6, { duration: 1000 })
            ),
            -1,
            false
        );
    }, [scannerSize]);

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    const handleSimulatedScan = (type) => {
        const points = scanItem(type);
        setLastScanned({ type, points });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => setLastScanned(null), 2500);
    };

    // Visible water colors for both modes
    const waterGradient = isDark
        ? [BRAND.oceanDeep, '#002844', BRAND.oceanMid]
        : ['#1a6b8f', '#2d8ab0', '#4aa3c7'];

    const scannerColor = isDark ? BRAND.biolum : '#0d4a6f';

    return (
        <View style={styles.container}>
            {/* Background */}
            <LinearGradient colors={waterGradient} style={StyleSheet.absoluteFill} />

            {/* Bubbles */}
            <FloatingBubbles count={12} minSize={4} maxSize={16} zIndex={1} />

            {/* Scanner overlay */}
            <View style={styles.scannerOverlay}>
                {/* Scanner Frame with Corner Brackets */}
                <Animated.View style={[
                    styles.scannerFrame,
                    {
                        width: scannerSize,
                        height: scannerSize,
                        borderColor: isDark ? 'rgba(168,197,212,0.3)' : 'rgba(13,74,111,0.2)',
                    },
                    pulseStyle
                ]}>
                    {/* 4 Corner Brackets */}
                    <CornerBracket position="topLeft" color={scannerColor} size={rs(32)} />
                    <CornerBracket position="topRight" color={scannerColor} size={rs(32)} />
                    <CornerBracket position="bottomLeft" color={scannerColor} size={rs(32)} />
                    <CornerBracket position="bottomRight" color={scannerColor} size={rs(32)} />

                    {/* Scan line */}
                    <Animated.View style={[styles.scanLine, scanLineStyle]}>
                        <LinearGradient
                            colors={[
                                'transparent',
                                isDark ? 'rgba(168,197,212,0.8)' : 'rgba(13,74,111,0.7)',
                                'transparent'
                            ]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.scanLineGradient}
                        />
                    </Animated.View>
                </Animated.View>

                {/* Instructions */}
                <Animated.View
                    entering={FadeIn.delay(400)}
                    style={[
                        styles.instructionBox,
                        { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)' }
                    ]}
                >
                    <Ionicons
                        name="camera-outline"
                        size={rs(16)}
                        color={isDark ? '#a8d4e6' : '#0d4a6f'}
                    />
                    <Text style={[styles.scanText, { color: isDark ? '#a8d4e6' : '#0d4a6f' }]}>
                        Apunta la cámara hacia la basura
                    </Text>
                </Animated.View>
            </View>

            {/* Success popup */}
            <SuccessPopup
                visible={lastScanned !== null}
                points={lastScanned?.points}
                type={lastScanned?.type}
            />

            {/* Controls area */}
            <SafeAreaView edges={['bottom']} style={styles.controlsArea}>
                <LinearGradient
                    colors={isDark
                        ? ['transparent', 'rgba(0,18,32,0.95)']
                        : ['transparent', 'rgba(13,74,111,0.95)']
                    }
                    style={styles.controlsGradient}
                >
                    <Animated.Text
                        entering={FadeInDown.delay(200)}
                        style={styles.debugTitle}
                    >
                        SIMULACIÓN DE DETECCIÓN
                    </Animated.Text>
                    <View style={styles.buttonRow}>
                        <ScanButton
                            icon="water-outline"
                            color="#22c55e"
                            label="Botella"
                            onPress={() => handleSimulatedScan('bottle')}
                            delay={300}
                        />
                        <ScanButton
                            icon="beer-outline"
                            color="#eab308"
                            label="Lata"
                            onPress={() => handleSimulatedScan('can')}
                            delay={400}
                        />
                        <ScanButton
                            icon="trash-outline"
                            color="#ef4444"
                            label="Basura"
                            onPress={() => handleSimulatedScan('trash')}
                            delay={500}
                        />
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    scannerFrame: {
        borderWidth: 1.5,
        borderRadius: RADIUS.md,
        position: 'relative',
    },
    cornerBracket: {
        position: 'absolute',
        width: rs(32),
        height: rs(32),
    },
    scanLine: {
        position: 'absolute',
        left: rs(8),
        right: rs(8),
        height: rs(3),
    },
    scanLineGradient: {
        flex: 1,
        borderRadius: rs(2),
    },
    instructionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xl,
        gap: rs(8),
        paddingVertical: rs(10),
        paddingHorizontal: rs(16),
        borderRadius: RADIUS.lg,
    },
    scanText: {
        fontSize: rf(13),
        fontWeight: '600',
    },
    controlsArea: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    controlsGradient: {
        paddingTop: SPACING.xxl,
        paddingBottom: rh(90),
        paddingHorizontal: SPACING.lg,
    },
    debugTitle: {
        fontSize: rf(10),
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: SPACING.md,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.lg,
    },
    scanButton: {
        alignItems: 'center',
    },
    scanButtonInner: {
        width: rs(64),
        height: rs(64),
        borderRadius: rs(32),
        borderWidth: 2.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButtonLabel: {
        marginTop: SPACING.xs,
        fontSize: rf(11),
        fontWeight: '600',
    },
    successPopup: {
        position: 'absolute',
        top: rh(100),
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        paddingRight: SPACING.xl,
        borderRadius: RADIUS.xl,
        zIndex: 100,
    },
    successIcon: {
        width: rs(46),
        height: rs(46),
        borderRadius: rs(23),
        justifyContent: 'center',
        alignItems: 'center',
    },
    successContent: {
        marginLeft: SPACING.md,
    },
    successPoints: {
        fontSize: rf(18),
        fontWeight: '800',
    },
    successType: {
        fontSize: rf(10),
        marginTop: rs(2),
        letterSpacing: 1,
    },
});
