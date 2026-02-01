import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Ellipse } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { BRAND } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const WAVE_WIDTH = width * 2;
const WAVE_HEIGHT = 160;

// ═══════════════════════════════════════════════════════════════════════════
// LIVING WATER - Enhanced ocean wave animation with theme support
// Realistic multi-layer waves with parallax and foam effects
// ═══════════════════════════════════════════════════════════════════════════

export default function LivingWater() {
    const { isDark } = useTheme();

    const transX1 = useSharedValue(0);
    const transX2 = useSharedValue(0);
    const transX3 = useSharedValue(0);
    const transX4 = useSharedValue(0);
    const verticalOsc = useSharedValue(0);

    useEffect(() => {
        // Wave 1: Front fast wave
        transX1.value = withRepeat(
            withTiming(-width, { duration: 6000, easing: Easing.linear }),
            -1,
            false
        );
        // Wave 2: Mid wave
        transX2.value = withRepeat(
            withTiming(-width, { duration: 8000, easing: Easing.linear }),
            -1,
            false
        );
        // Wave 3: Back slow wave
        transX3.value = withRepeat(
            withTiming(-width, { duration: 12000, easing: Easing.linear }),
            -1,
            false
        );
        // Wave 4: Deep background
        transX4.value = withRepeat(
            withTiming(-width, { duration: 16000, easing: Easing.linear }),
            -1,
            false
        );
        // Vertical oscillation for depth effect
        verticalOsc.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    const wave1Style = useAnimatedStyle(() => ({
        transform: [{ translateX: transX1.value }]
    }));
    const wave2Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: transX2.value },
            { translateY: interpolate(verticalOsc.value, [0, 1], [0, 3]) }
        ]
    }));
    const wave3Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: transX3.value },
            { translateY: interpolate(verticalOsc.value, [0, 1], [0, -2]) }
        ]
    }));
    const wave4Style = useAnimatedStyle(() => ({
        transform: [{ translateX: transX4.value }]
    }));

    // Wave paths with more natural curves
    const wavePath1 = `
        M 0 60 
        Q ${width * 0.15} 35, ${width * 0.3} 55
        T ${width * 0.6} 50 
        T ${width * 0.9} 60 
        T ${width * 1.2} 50
        T ${width * 1.5} 55
        T ${width * 2} 60
        V ${WAVE_HEIGHT} H 0 Z
    `;

    const wavePath2 = `
        M 0 70 
        Q ${width * 0.2} 50, ${width * 0.4} 65
        T ${width * 0.7} 70 
        T ${width} 60
        T ${width * 1.3} 70
        T ${width * 1.7} 65
        T ${width * 2} 70
        V ${WAVE_HEIGHT} H 0 Z
    `;

    const wavePath3 = `
        M 0 80 
        Q ${width * 0.25} 65, ${width * 0.5} 75
        T ${width} 80 
        T ${width * 1.5} 75
        T ${width * 2} 80
        V ${WAVE_HEIGHT} H 0 Z
    `;

    const wavePath4 = `
        M 0 90 
        Q ${width * 0.3} 80, ${width * 0.6} 88
        T ${width * 1.2} 90 
        T ${width * 2} 88
        V ${WAVE_HEIGHT} H 0 Z
    `;

    // Theme-aware colors
    const colors = isDark ? {
        deep: BRAND.oceanDeep,
        dark: BRAND.oceanDark,
        mid: BRAND.oceanMid,
        light: BRAND.oceanLight,
        foam: 'rgba(255,255,255,0.1)',
    } : {
        deep: '#1a6b8f',
        dark: '#3d8eb0',
        mid: '#5eb4d4',
        light: '#8ed6ef',
        foam: 'rgba(255,255,255,0.4)',
    };

    return (
        <View style={styles.container}>
            {/* Deep background layer */}
            <Animated.View style={[styles.waveContainer, wave4Style, { opacity: 0.4 }]}>
                <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT} viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}>
                    <Defs>
                        <LinearGradient id="grad4" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={colors.mid} stopOpacity="0.4" />
                            <Stop offset="1" stopColor={colors.deep} stopOpacity="0.6" />
                        </LinearGradient>
                    </Defs>
                    <Path d={wavePath4} fill="url(#grad4)" />
                </Svg>
            </Animated.View>

            {/* Back wave */}
            <Animated.View style={[styles.waveContainer, wave3Style, { bottom: 8, opacity: 0.5 }]}>
                <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT} viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}>
                    <Defs>
                        <LinearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={colors.mid} stopOpacity="0.5" />
                            <Stop offset="1" stopColor={colors.dark} stopOpacity="0.7" />
                        </LinearGradient>
                    </Defs>
                    <Path d={wavePath3} fill="url(#grad3)" />
                </Svg>
            </Animated.View>

            {/* Middle wave with foam accents */}
            <Animated.View style={[styles.waveContainer, wave2Style, { bottom: 4, opacity: 0.7 }]}>
                <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT} viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}>
                    <Defs>
                        <LinearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={colors.light} stopOpacity="0.6" />
                            <Stop offset="1" stopColor={colors.mid} stopOpacity="0.8" />
                        </LinearGradient>
                    </Defs>
                    <Path d={wavePath2} fill="url(#grad2)" />
                    {/* Foam highlights */}
                    <Ellipse cx={width * 0.3} cy={55} rx={20} ry={4} fill={colors.foam} />
                    <Ellipse cx={width * 0.8} cy={60} rx={15} ry={3} fill={colors.foam} />
                    <Ellipse cx={width * 1.4} cy={58} rx={18} ry={4} fill={colors.foam} />
                </Svg>
            </Animated.View>

            {/* Front wave (most visible) */}
            <Animated.View style={[styles.waveContainer, wave1Style, { bottom: 0 }]}>
                <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT} viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}>
                    <Defs>
                        <LinearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={isDark ? '#6dd5ed' : colors.light} stopOpacity="0.8" />
                            <Stop offset="0.5" stopColor={colors.mid} stopOpacity="0.9" />
                            <Stop offset="1" stopColor={colors.dark} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Path d={wavePath1} fill="url(#grad1)" />
                    {/* Foam dots on wave crests */}
                    <Circle cx={width * 0.15} cy={40} r={3} fill={colors.foam} />
                    <Circle cx={width * 0.18} cy={38} r={2} fill={colors.foam} />
                    <Circle cx={width * 0.55} cy={48} r={2.5} fill={colors.foam} />
                    <Circle cx={width * 0.9} cy={55} r={2} fill={colors.foam} />
                    <Circle cx={width * 1.15} cy={45} r={3} fill={colors.foam} />
                    <Circle cx={width * 1.5} cy={50} r={2} fill={colors.foam} />
                    <Circle cx={width * 1.8} cy={48} r={2.5} fill={colors.foam} />
                </Svg>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: WAVE_HEIGHT,
        zIndex: -1,
        overflow: 'hidden',
    },
    waveContainer: {
        position: 'absolute',
        left: 0,
        width: WAVE_WIDTH,
        height: WAVE_HEIGHT,
        bottom: 0,
    }
});
