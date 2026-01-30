import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, G, Defs, RadialGradient, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withRepeat,
    withDelay,
    Easing,
    runOnJS,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Animated Particle/Sparkle
const AnimatedSparkle = ({ delay = 0, x, y, size = 4 }) => {
    const sparkleAnim = useSharedValue(0);
    const sparkleOpacity = useSharedValue(0);

    useEffect(() => {
        sparkleOpacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 800 }),
                    withTiming(0, { duration: 800 })
                ),
                -1,
                false
            )
        );
        sparkleAnim.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, { duration: 2000, easing: Easing.linear }),
                -1,
                false
            )
        );
    }, []);

    const sparkleStyle = useAnimatedStyle(() => ({
        opacity: sparkleOpacity.value,
        transform: [{ scale: interpolate(sparkleAnim.value, [0, 0.5, 1], [0.8, 1.2, 0.8]) }],
    }));

    return (
        <Animated.View style={[styles.sparkle, { left: x, top: y, width: size, height: size, borderRadius: size / 2 }, sparkleStyle]} />
    );
};

// Animated Wave
const AnimatedWave = ({ delay = 0, duration = 3000, color, height: waveHeight = 180 }) => {
    const waveAnim = useSharedValue(0);

    useEffect(() => {
        waveAnim.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            )
        );
    }, []);

    const waveStyle = useAnimatedStyle(() => {
        const translateY = interpolate(waveAnim.value, [0, 1], [0, 20]);
        const translateX = interpolate(waveAnim.value, [0, 1], [-10, 10]);
        return {
            transform: [{ translateY }, { translateX }],
        };
    });

    return (
        <Animated.View style={[styles.wave, { backgroundColor: color, height: waveHeight }, waveStyle]} />
    );
};

// Circular Logo with Bottle and Water/Beach theme
const CircularLogo = () => (
    <Svg width="160" height="160" viewBox="0 0 100 100">
        <Defs>
            {/* Background gradient */}
            <RadialGradient id="bgGrad" cx="50%" cy="40%" rx="60%" ry="60%">
                <Stop offset="0%" stopColor={COLORS.secondary} />
                <Stop offset="80%" stopColor={COLORS.primary} />
                <Stop offset="100%" stopColor="#001a2e" />
            </RadialGradient>

            {/* Bottle gradient */}
            <LinearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#6dd5ff" />
                <Stop offset="50%" stopColor="#40c9ff" />
                <Stop offset="100%" stopColor="#2196f3" />
            </LinearGradient>

            {/* Water gradient */}
            <LinearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#40c9ff" />
                <Stop offset="100%" stopColor={COLORS.secondary} />
            </LinearGradient>

            {/* Sand gradient */}
            <LinearGradient id="sandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={COLORS.highlight} />
                <Stop offset="100%" stopColor="#c9a86c" />
            </LinearGradient>

            {/* Shine */}
            <LinearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </LinearGradient>
        </Defs>

        {/* Main circle background */}
        <Circle cx="50" cy="50" r="47" fill="url(#bgGrad)" />

        {/* Outer ring (cream/gold) */}
        <Circle
            cx="50" cy="50" r="47"
            stroke={COLORS.highlight}
            strokeWidth="3"
            fill="none"
        />
        <Circle
            cx="50" cy="50" r="44"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            fill="none"
        />

        {/* Water/waves at bottom */}
        <Path
            d="M3 65 Q15 58 25 65 Q35 72 50 65 Q65 58 75 65 Q85 72 97 65 L97 97 L3 97 Z"
            fill="url(#waterGrad)"
            opacity="0.4"
        />
        <Path
            d="M3 72 Q18 65 30 72 Q42 79 55 72 Q68 65 80 72 Q92 79 97 72 L97 97 L3 97 Z"
            fill="url(#waterGrad)"
            opacity="0.6"
        />

        {/* Sand at very bottom */}
        <Path
            d="M8 88 Q30 84 50 88 Q70 92 92 88 L92 94 Q70 96 50 94 Q30 92 8 94 Z"
            fill="url(#sandGrad)"
            opacity="0.5"
        />

        {/* Plastic Bottle (center) */}
        <G transform="translate(50, 48) scale(0.9)">
            {/* Bottle cap */}
            <Path
                d="M-6 -28 L6 -28 L6 -22 L-6 -22 Z"
                fill="#2196f3"
            />
            {/* Bottle neck */}
            <Path
                d="M-5 -22 L5 -22 L7 -14 L-7 -14 Z"
                fill="url(#bottleGrad)"
            />
            {/* Bottle body */}
            <Path
                d="M-12 -14 Q-14 -10 -14 0 L-14 22 Q-14 28 -8 28 L8 28 Q14 28 14 22 L14 0 Q14 -10 12 -14 Z"
                fill="url(#bottleGrad)"
            />
            {/* Bottle highlight */}
            <Path
                d="M-10 -10 Q-8 -12 -4 -10 L-4 20 Q-6 22 -10 20 Z"
                fill="url(#shineGrad)"
            />
            {/* Water inside bottle */}
            <Path
                d="M-12 8 L-12 22 Q-12 26 -8 26 L8 26 Q12 26 12 22 L12 8 Q6 12 0 8 Q-6 4 -12 8 Z"
                fill="rgba(64,201,255,0.4)"
            />
            {/* Recycle arrows around bottle */}
            <G opacity="0.9">
                <Path
                    d="M-22 5 L-18 0 L-18 3 Q-18 -5 -12 -8"
                    stroke={COLORS.highlight}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
                <Path
                    d="M18 -5 L22 0 L18 3"
                    stroke={COLORS.highlight}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
                <Path
                    d="M22 0 Q22 10 14 15"
                    stroke={COLORS.highlight}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
                <Path
                    d="M0 32 L-5 28 L0 28"
                    stroke={COLORS.highlight}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
                <Path
                    d="M-5 28 Q-15 25 -20 15"
                    stroke={COLORS.highlight}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
            </G>
        </G>

        {/* Small sparkles */}
        <Circle cx="25" cy="25" r="2" fill={COLORS.highlight} opacity="0.6" />
        <Circle cx="78" cy="30" r="1.5" fill="#fff" opacity="0.5" />
        <Circle cx="20" cy="45" r="1" fill="#fff" opacity="0.4" />
    </Svg>
);

export default function CustomSplash({ onAnimationFinish }) {
    const containerOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.5);
    const logoRotate = useSharedValue(-10);
    const titleOpacity = useSharedValue(0);
    const titleY = useSharedValue(30);
    const subtitleOpacity = useSharedValue(0);
    const sunPulse = useSharedValue(1);
    const dropBounce = useSharedValue(0);

    useEffect(() => {
        // Container fade in
        containerOpacity.value = withTiming(1, { duration: 600 });

        // Logo entrance with bounce
        logoScale.value = withSequence(
            withTiming(1.1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }),
            withTiming(1, { duration: 300 })
        );
        logoRotate.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.back(1)) });

        // Sun pulse animation
        sunPulse.value = withDelay(800, withRepeat(
            withSequence(
                withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        ));

        // Drop bounce
        dropBounce.value = withDelay(500, withRepeat(
            withSequence(
                withTiming(-5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                withTiming(5, { duration: 800, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        ));

        // Title entrance
        titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
        titleY.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.back(1)) }));

        // Subtitle entrance
        subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));

        // Fade out sequence
        const fadeOutTimer = setTimeout(() => {
            containerOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
                if (finished && onAnimationFinish) {
                    runOnJS(onAnimationFinish)();
                }
            });
        }, 3500);

        return () => clearTimeout(fadeOutTimer);
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    const logoStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: logoScale.value * sunPulse.value },
            { rotate: `${logoRotate.value}deg` },
            { translateY: dropBounce.value },
        ],
    }));

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleY.value }],
    }));

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOpacity.value,
    }));

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            {/* Background gradient */}
            <ExpoGradient
                colors={[COLORS.primary, COLORS.secondary, '#1a5570', COLORS.primary]}
                locations={[0, 0.3, 0.7, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Animated waves background */}
            <View style={styles.wavesContainer}>
                <AnimatedWave delay={0} duration={4000} color="rgba(20,83,116,0.4)" height={220} />
                <AnimatedWave delay={400} duration={3500} color="rgba(64,201,255,0.2)" height={200} />
                <AnimatedWave delay={800} duration={3000} color="rgba(232,213,181,0.15)" height={180} />
                <AnimatedWave delay={1200} duration={4500} color="rgba(20,83,116,0.3)" height={160} />
            </View>

            {/* Sparkles */}
            <AnimatedSparkle delay={200} x={width * 0.15} y={height * 0.2} size={6} />
            <AnimatedSparkle delay={600} x={width * 0.8} y={height * 0.15} size={5} />
            <AnimatedSparkle delay={1000} x={width * 0.25} y={height * 0.35} size={4} />
            <AnimatedSparkle delay={1400} x={width * 0.7} y={height * 0.3} size={5} />
            <AnimatedSparkle delay={800} x={width * 0.5} y={height * 0.18} size={4} />

            <View style={styles.content}>
                {/* Logo */}
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <CircularLogo />
                </Animated.View>

                {/* Title */}
                <Animated.View style={titleStyle}>
                    <Animated.Text style={styles.title}>TU PLAYA</Animated.Text>
                    <Animated.Text style={styles.titleAccent}>LIMPIA</Animated.Text>
                </Animated.View>

                {/* Subtitle */}
                <Animated.Text style={[styles.subtitle, subtitleStyle]}>
                    ECO • SYSTEM
                </Animated.Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    wavesContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.45,
    },
    wave: {
        position: 'absolute',
        bottom: 0,
        left: -80,
        right: -80,
        borderTopLeftRadius: 1000,
        borderTopRightRadius: 1000,
    },
    sparkle: {
        position: 'absolute',
        backgroundColor: COLORS.highlight,
        shadowColor: COLORS.highlight,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
    },
    content: {
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 6,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
        textAlign: 'center',
    },
    titleAccent: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.highlight,
        letterSpacing: 10,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        textAlign: 'center',
        marginTop: -5,
    },
    subtitle: {
        marginTop: 15,
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 10,
        textTransform: 'uppercase',
    },
});
