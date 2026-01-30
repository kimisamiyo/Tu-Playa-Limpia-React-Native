import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
const WAVE_WIDTH = width * 2; // Double width for seamless looping
const WAVE_HEIGHT = 150;

export default function LivingWater() {
    const transX1 = useSharedValue(0);
    const transX2 = useSharedValue(0);
    const transX3 = useSharedValue(0);

    useEffect(() => {
        // Wave 1: Slow key layer
        transX1.value = withRepeat(
            withTiming(-width, { duration: 8000, easing: Easing.linear }),
            -1,
            false
        );
        // Wave 2: Faster offset
        transX2.value = withRepeat(
            withTiming(-width, { duration: 5000, easing: Easing.linear }),
            -1,
            false
        );
        // Wave 3: Background
        transX3.value = withRepeat(
            withTiming(-width, { duration: 12000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const wave1Style = useAnimatedStyle(() => ({
        transform: [{ translateX: transX1.value }]
    }));
    const wave2Style = useAnimatedStyle(() => ({
        transform: [{ translateX: transX2.value }]
    }));
    const wave3Style = useAnimatedStyle(() => ({
        transform: [{ translateX: transX3.value }]
    }));

    // Sine Wave Path logic:
    // We draw a curve that repeats.
    // M 0 50 Q width/2 0, width 50 T 2*width 50 V 150 H 0 Z
    // We need it to be exactly width-tileable.
    // Let's create a path that spans WAVE_WIDTH.

    const wavePath = `
    M 0 50 
    Q ${width * 0.25} 20, ${width * 0.5} 50 
    T ${width} 50 
    T ${width * 1.5} 50 
    T ${width * 2} 50 
    V ${WAVE_HEIGHT} H 0 Z
  `;

    const wavePathReverse = `
    M 0 50 
    Q ${width * 0.25} 80, ${width * 0.5} 50 
    T ${width} 50 
    T ${width * 1.5} 50 
    T ${width * 2} 50 
    V ${WAVE_HEIGHT} H 0 Z
  `;

    return (
        <View style={styles.container}>
            {/* Back Layer */}
            <Animated.View style={[styles.waveContainer, wave3Style, { opacity: 0.5 }]}>
                <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT} viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}>
                    <Defs>
                        <LinearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={COLORS.secondary} stopOpacity="0.6" />
                            <Stop offset="1" stopColor={COLORS.primary} stopOpacity="0.8" />
                        </LinearGradient>
                    </Defs>
                    <Path d={wavePathReverse} fill="url(#grad1)" />
                </Svg>
            </Animated.View>

            {/* Middle Layer */}
            <Animated.View style={[styles.waveContainer, wave2Style, { bottom: 10, opacity: 0.7 }]}>
                <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT} viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}>
                    <Defs>
                        <LinearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={COLORS.accent} stopOpacity="0.5" />
                            <Stop offset="1" stopColor={COLORS.secondary} stopOpacity="0.7" />
                        </LinearGradient>
                    </Defs>
                    <Path d={wavePath} fill="url(#grad2)" />
                </Svg>
            </Animated.View>

            {/* Front Layer */}
            <Animated.View style={[styles.waveContainer, wave1Style, { bottom: 0 }]}>
                <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT} viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}>
                    <Defs>
                        <LinearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#4fc3f7" stopOpacity="0.8" />
                            <Stop offset="1" stopColor={COLORS.secondary} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Path d={wavePath} fill="url(#grad3)" />
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
