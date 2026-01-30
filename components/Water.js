import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as LinearGradientSVG, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// SVG Path for a wave shape
const wavePath = `M0,30 Q${width / 4},50 ${width / 2},30 T${width},30 L${width},200 L0,200 Z`;

export default function Water() {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withRepeat(
            withTiming(20, {
                duration: 3000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1, // infinite
            true // reverse
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.waveContainer, animatedStyle]}>
                <Svg height="200" width={width} viewBox={`0 0 ${width} 200`} preserveAspectRatio="none">
                    <Defs>
                        <LinearGradientSVG id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#4FC3F7" stopOpacity="0.7" />
                            <Stop offset="1" stopColor="#0288D1" stopOpacity="0.9" />
                        </LinearGradientSVG>
                    </Defs>
                    <Path d={wavePath} fill="url(#grad)" />
                    {/* Second wave layer for depth */}
                </Svg>
            </Animated.View>
            <Animated.View style={[styles.waveContainer, styles.waveBack, animatedStyle]}>
                <Svg height="200" width={width} viewBox={`0 0 ${width} 200`} preserveAspectRatio="none">
                    <Defs>
                        <LinearGradientSVG id="gradBack" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#81D4FA" stopOpacity="0.4" />
                            <Stop offset="1" stopColor="#0277BD" stopOpacity="0.6" />
                        </LinearGradientSVG>
                    </Defs>
                    <Path d={wavePath} fill="url(#gradBack)" />
                </Svg>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        zIndex: 2,
    },
    waveContainer: {
        position: 'absolute',
        bottom: -20,
        width: width,
    },
    waveBack: {
        bottom: -10,
        opacity: 0.6,
        transform: [{ translateX: -20 }], // Slightly offset
    }
});
