import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
    interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import { BRAND, GRADIENTS } from '../constants/theme';
import { rs, rf, rh, SCREEN } from '../constants/responsive';
import { DURATION, LOOP } from '../constants/animations';

const { width, height } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM ANIMATED BUBBLE
// ═══════════════════════════════════════════════════════════════════════════
const AnimatedBubble = ({ delay = 0, startX, size = 10, duration = 4000 }) => {
    const progress = useSharedValue(0);
    const wobble = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
        progress.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, { duration, easing: Easing.linear }),
                -1,
                false
            )
        );
        wobble.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, { duration: duration * 0.4, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            )
        );
    }, []);

    const style = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [height * 0.8, -rs(50)]);
        const translateX = interpolate(wobble.value, [0, 1], [-rs(20), rs(20)]);
        const scale = interpolate(progress.value, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.8]);
        return {
            opacity: opacity.value * interpolate(progress.value, [0, 0.1, 0.9, 1], [0.5, 1, 1, 0]),
            transform: [{ translateY }, { translateX }, { scale }],
        };
    });

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    left: startX,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                },
                style,
            ]}
        />
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED LIGHT RAY
// ═══════════════════════════════════════════════════════════════════════════
const LightRay = ({ delay = 0, angle, width: rayWidth = 60 }) => {
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.05, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.lightRay,
                {
                    width: rayWidth,
                    transform: [{ rotate: `${angle}deg` }],
                },
                style,
            ]}
        />
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED SPARKLE
// ═══════════════════════════════════════════════════════════════════════════
const AnimatedSparkle = ({ delay = 0, x, y, size = 6 }) => {
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
        transform: [{ scale: interpolate(sparkleAnim.value, [0, 0.5, 1], [0.6, 1.3, 0.6]) }],
    }));

    return (
        <Animated.View
            style={[
                styles.sparkle,
                {
                    left: x,
                    top: y,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                sparkleStyle,
            ]}
        />
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED WAVE LAYER
// ═══════════════════════════════════════════════════════════════════════════
const AnimatedWave = ({ delay = 0, duration = 3000, color, waveHeight = 180 }) => {
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

    const waveStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(waveAnim.value, [0, 1], [0, rs(25)]) },
            { translateX: interpolate(waveAnim.value, [0, 1], [-rs(15), rs(15)]) },
        ],
    }));

    return (
        <Animated.View
            style={[
                styles.wave,
                { backgroundColor: color, height: waveHeight },
                waveStyle,
            ]}
        />
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM CIRCULAR LOGO
// ═══════════════════════════════════════════════════════════════════════════
const CircularLogo = () => {
    const logoSize = Math.min(rs(180), SCREEN.width * 0.45);

    return (
        <Svg width={logoSize} height={logoSize} viewBox="0 0 100 100">
            <Defs>
                <RadialGradient id="bgGrad" cx="50%" cy="40%" rx="60%" ry="60%">
                    <Stop offset="0%" stopColor={BRAND.oceanMid} />
                    <Stop offset="80%" stopColor={BRAND.oceanDark} />
                    <Stop offset="100%" stopColor="#001a2e" />
                </RadialGradient>
                <LinearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#6dd5ff" />
                    <Stop offset="50%" stopColor="#40c9ff" />
                    <Stop offset="100%" stopColor="#2196f3" />
                </LinearGradient>
                <LinearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#40c9ff" />
                    <Stop offset="100%" stopColor={BRAND.oceanMid} />
                </LinearGradient>
                <LinearGradient id="sandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={BRAND.sandGold} />
                    <Stop offset="100%" stopColor="#c9a86c" />
                </LinearGradient>
                <LinearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                    <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </LinearGradient>
                <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={BRAND.sandGold} />
                    <Stop offset="50%" stopColor={BRAND.goldShimmer} />
                    <Stop offset="100%" stopColor={BRAND.sandGold} />
                </LinearGradient>
            </Defs>

            {/* Main circle background */}
            <Circle cx="50" cy="50" r="47" fill="url(#bgGrad)" />

            {/* Premium outer ring */}
            <Circle cx="50" cy="50" r="47" stroke="url(#ringGrad)" strokeWidth="3" fill="none" />
            <Circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />

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
                <Path d="M-6 -28 L6 -28 L6 -22 L-6 -22 Z" fill="#2196f3" />
                {/* Bottle neck */}
                <Path d="M-5 -22 L5 -22 L7 -14 L-7 -14 Z" fill="url(#bottleGrad)" />
                {/* Bottle body */}
                <Path d="M-12 -14 Q-14 -10 -14 0 L-14 22 Q-14 28 -8 28 L8 28 Q14 28 14 22 L14 0 Q14 -10 12 -14 Z" fill="url(#bottleGrad)" />
                {/* Bottle highlight */}
                <Path d="M-10 -10 Q-8 -12 -4 -10 L-4 20 Q-6 22 -10 20 Z" fill="url(#shineGrad)" />
                {/* Water inside bottle */}
                <Path d="M-12 8 L-12 22 Q-12 26 -8 26 L8 26 Q12 26 12 22 L12 8 Q6 12 0 8 Q-6 4 -12 8 Z" fill="rgba(64,201,255,0.4)" />
                {/* Recycle arrows */}
                <G opacity="0.9">
                    <Path d="M-22 5 L-18 0 L-18 3 Q-18 -5 -12 -8" stroke={BRAND.sandGold} strokeWidth="2" fill="none" strokeLinecap="round" />
                    <Path d="M18 -5 L22 0 L18 3" stroke={BRAND.sandGold} strokeWidth="2" fill="none" strokeLinecap="round" />
                    <Path d="M22 0 Q22 10 14 15" stroke={BRAND.sandGold} strokeWidth="2" fill="none" strokeLinecap="round" />
                    <Path d="M0 32 L-5 28 L0 28" stroke={BRAND.sandGold} strokeWidth="2" fill="none" strokeLinecap="round" />
                    <Path d="M-5 28 Q-15 25 -20 15" stroke={BRAND.sandGold} strokeWidth="2" fill="none" strokeLinecap="round" />
                </G>
            </G>

            {/* Small sparkles */}
            <Circle cx="25" cy="25" r="2" fill={BRAND.sandGold} opacity="0.7" />
            <Circle cx="78" cy="30" r="1.5" fill="#fff" opacity="0.6" />
            <Circle cx="20" cy="45" r="1" fill="#fff" opacity="0.5" />
            <Circle cx="75" cy="55" r="1.5" fill={BRAND.sandGold} opacity="0.4" />
        </Svg>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SPLASH COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function CustomSplash({ onAnimationFinish }) {
    const containerOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.3);
    const logoRotate = useSharedValue(-15);
    const logoGlow = useSharedValue(0);
    const titleOpacity = useSharedValue(0);
    const titleY = useSharedValue(rs(40));
    const subtitleOpacity = useSharedValue(0);
    const pulseScale = useSharedValue(1);

    // Generate bubbles configuration
    const bubbles = useMemo(() =>
        Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 2000,
            startX: Math.random() * width,
            size: rs(6 + Math.random() * 16),
            duration: 5000 + Math.random() * 4000,
        })),
        []);

    // Generate sparkles configuration
    const sparkles = useMemo(() => [
        { delay: 200, x: width * 0.12, y: height * 0.18, size: rs(7) },
        { delay: 600, x: width * 0.85, y: height * 0.15, size: rs(6) },
        { delay: 1000, x: width * 0.22, y: height * 0.35, size: rs(5) },
        { delay: 1400, x: width * 0.75, y: height * 0.28, size: rs(6) },
        { delay: 800, x: width * 0.5, y: height * 0.16, size: rs(5) },
        { delay: 1200, x: width * 0.65, y: height * 0.42, size: rs(4) },
        { delay: 500, x: width * 0.35, y: height * 0.22, size: rs(5) },
    ], []);

    useEffect(() => {
        // Container fade in
        containerOpacity.value = withTiming(1, { duration: 600 });

        // Logo entrance with premium bounce
        logoScale.value = withSequence(
            withTiming(1.15, { duration: 700, easing: Easing.out(Easing.back(1.8)) }),
            withTiming(1, { duration: 400 })
        );
        logoRotate.value = withTiming(0, { duration: 900, easing: Easing.out(Easing.back(1.2)) });

        // Logo glow pulse
        logoGlow.value = withDelay(800, withRepeat(
            withSequence(
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        ));

        // Pulse scale
        pulseScale.value = withDelay(800, withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        ));

        // Title entrance
        titleOpacity.value = withDelay(500, withTiming(1, { duration: 700 }));
        titleY.value = withDelay(500, withTiming(0, { duration: 700, easing: Easing.out(Easing.back(1.3)) }));

        // Subtitle entrance
        subtitleOpacity.value = withDelay(900, withTiming(1, { duration: 700 }));

        // Fade out sequence
        const fadeOutTimer = setTimeout(() => {
            containerOpacity.value = withTiming(0, { duration: 600 }, (finished) => {
                if (finished && onAnimationFinish) {
                    runOnJS(onAnimationFinish)();
                }
            });
        }, DURATION.splash);

        // SAFETY FALLBACK FOR WEB:
        // If Reanimated callback fails (common on web), Force finish after duration + buffer
        const safetyTimer = setTimeout(() => {
            if (onAnimationFinish) {
                // Ensure we don't double-call if the animation worked, 
                // but CustomSplash (parent) usually handles idempotency by unmounting
                onAnimationFinish();
            }
        }, DURATION.splash + 1000);

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(safetyTimer);
        };
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    const logoStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: logoScale.value * pulseScale.value },
            { rotate: `${logoRotate.value}deg` },
        ],
    }));

    const logoGlowStyle = useAnimatedStyle(() => ({
        shadowOpacity: interpolate(logoGlow.value, [0, 1], [0.3, 0.7]),
        shadowRadius: interpolate(logoGlow.value, [0, 1], [rs(15), rs(35)]),
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
            {/* Deep ocean gradient background */}
            <ExpoGradient
                colors={[BRAND.oceanDeep, BRAND.oceanDark, BRAND.oceanMid, BRAND.oceanDark]}
                locations={[0, 0.3, 0.65, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Light rays from top */}
            <View style={styles.lightRaysContainer}>
                <LightRay delay={0} angle={15} width={rs(80)} />
                <LightRay delay={500} angle={-8} width={rs(50)} />
                <LightRay delay={1000} angle={25} width={rs(40)} />
            </View>

            {/* Floating bubbles */}
            {bubbles.map((bubble) => (
                <AnimatedBubble key={bubble.id} {...bubble} />
            ))}

            {/* Animated waves at bottom */}
            <View style={styles.wavesContainer}>
                <AnimatedWave delay={0} duration={4500} color="rgba(20,83,116,0.5)" waveHeight={rh(240)} />
                <AnimatedWave delay={500} duration={3800} color="rgba(64,201,255,0.25)" waveHeight={rh(210)} />
                <AnimatedWave delay={1000} duration={3200} color="rgba(232,213,181,0.18)" waveHeight={rh(185)} />
                <AnimatedWave delay={1500} duration={5000} color="rgba(20,83,116,0.35)" waveHeight={rh(165)} />
            </View>

            {/* Sparkles */}
            {sparkles.map((sparkle, index) => (
                <AnimatedSparkle key={index} {...sparkle} />
            ))}

            {/* Main content */}
            <View style={styles.content}>
                {/* Logo with glow */}
                <Animated.View style={[styles.logoContainer, logoStyle, logoGlowStyle]}>
                    <CircularLogo />
                </Animated.View>

                {/* Title */}
                <Animated.View style={titleStyle}>
                    <Text style={styles.title}>TU PLAYA</Text>
                    <Text style={styles.titleAccent}>LIMPIA</Text>
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
    lightRaysContainer: {
        position: 'absolute',
        top: -height * 0.2,
        left: 0,
        right: 0,
        height: height * 0.7,
        overflow: 'hidden',
    },
    lightRay: {
        position: 'absolute',
        top: 0,
        left: '40%',
        height: height * 0.8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: rs(20),
    },
    wavesContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.5,
    },
    wave: {
        position: 'absolute',
        bottom: 0,
        left: -rs(100),
        right: -rs(100),
        borderTopLeftRadius: rs(1000),
        borderTopRightRadius: rs(1000),
    },
    sparkle: {
        position: 'absolute',
        backgroundColor: BRAND.sandGold,
        shadowColor: BRAND.sandGold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: rs(8),
    },
    content: {
        alignItems: 'center',
        zIndex: 10,
    },
    logoContainer: {
        marginBottom: rs(30),
        shadowColor: BRAND.biolum,
        shadowOffset: { width: 0, height: 0 },
    },
    title: {
        fontSize: rf(34),
        fontWeight: '800',
        color: '#fff',
        letterSpacing: rs(6),
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: rs(3) },
        textShadowRadius: rs(8),
        textAlign: 'center',
    },
    titleAccent: {
        fontSize: rf(40),
        fontWeight: '900',
        color: BRAND.sandGold,
        letterSpacing: rs(10),
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: rs(2) },
        textShadowRadius: rs(6),
        textAlign: 'center',
        marginTop: rs(-6),
    },
    subtitle: {
        marginTop: rs(18),
        fontSize: rf(13),
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: rs(10),
        textTransform: 'uppercase',
        fontWeight: '500',
    },
});
