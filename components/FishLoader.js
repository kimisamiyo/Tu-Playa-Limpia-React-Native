import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dynamic Sizing based on screen width
const BASE_SIZE = Math.min(SCREEN_WIDTH * 0.5, 250); // Max 250, or 50% of width
const BOWL_SIZE = BASE_SIZE;
const FISH_SIZE = BASE_SIZE * 0.4; // Fish is 40% of bowl

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function FishLoader() {
    // Animation Values
    const tailRotation = useSharedValue(0);
    const finRotation = useSharedValue(0);
    const floatY = useSharedValue(0);
    const bubbleY = useSharedValue(0);
    const bubbleOpacity = useSharedValue(0);

    useEffect(() => {
        // Tail Wiggle
        tailRotation.value = withRepeat(
            withSequence(
                withTiming(15, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                withTiming(-15, { duration: 400, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Fin Flutter
        finRotation.value = withRepeat(
            withSequence(
                withTiming(10, { duration: 200 }),
                withTiming(0, { duration: 200 })
            ),
            -1,
            true
        );

        // Floating Body
        floatY.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
                withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );

        // Bubble
        bubbleY.value = withRepeat(
            withTiming(-50, { duration: 2000, easing: Easing.linear }),
            -1,
            false // Restart from 0
        );
        bubbleOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 500 }),
                withTiming(0, { duration: 1500 })
            ),
            -1,
            false
        );
    }, []);

    const tailStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: 400 }, { translateY: 256 }, // Pivot corrections for SVG coords
            { rotate: `${tailRotation.value}deg` },
            { translateX: -400 }, { translateY: -256 }
        ],
    }));

    const finStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: 250 }, { translateY: 280 }, // Pivot
            { rotate: `${finRotation.value}deg` },
            { translateX: -250 }, { translateY: -280 }
        ],
    }));

    const bodyStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: floatY.value }]
    }));

    const bubbleStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: bubbleY.value }],
        opacity: bubbleOpacity.value
    }));

    return (
        <View style={[styles.container, { width: BOWL_SIZE, height: BOWL_SIZE }]}>

            {/* 1. Bowl Background (Glass) */}
            <View style={[styles.bowl, { width: BOWL_SIZE, height: BOWL_SIZE, borderRadius: BOWL_SIZE / 2 }]}>
                {/* Water Level */}
                <View style={[styles.water, { top: '35%', height: '75%' }]} />
            </View>

            {/* 2. Fish Container (Centered) */}
            <AnimatedView style={[styles.fishWrapper, bodyStyle, { width: FISH_SIZE, height: FISH_SIZE }]}>
                <Svg width={FISH_SIZE} height={FISH_SIZE} viewBox="0 0 512 512">
                    <Defs>
                        <RadialGradient id="fishGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0" stopColor="#7daaff" stopOpacity="1" />
                            <Stop offset="1" stopColor="#4a80cc" stopOpacity="1" />
                        </RadialGradient>
                    </Defs>

                    {/* Tail - Using AnimatedG */}
                    <AnimatedG style={tailStyle}>
                        <Path d="M400,256 L500,200 L500,312 Z" fill="#366096" />
                    </AnimatedG>

                    {/* Body */}
                    <Path d="M100,256 Q150,150 256,150 T400,256 T256,362 T100,256 Z" fill="url(#fishGrad)" />

                    {/* Fins - Using AnimatedG */}
                    <AnimatedG style={finStyle}>
                        <Path d="M250,280 L280,350 L220,350 Z" fill="#366096" />
                    </AnimatedG>

                    {/* Eye */}
                    <G>
                        <Path d="M160,240 A10,10 0 1,1 160,260 A10,10 0 1,1 160,240" fill="white" />
                        <Path d="M165,250 A3,3 0 1,1 165,256 A3,3 0 1,1 165,250" fill="black" />
                    </G>
                </Svg>
            </AnimatedView>

            {/* 3. Bubbles */}
            <AnimatedView style={[styles.bubble, bubbleStyle, { left: BOWL_SIZE / 2 - 20 }]} />

            {/* 4. Bowl Highlights (Front Glass) */}
            <View style={[styles.highlight, { width: BOWL_SIZE, height: BOWL_SIZE, borderRadius: BOWL_SIZE / 2 }]} pointerEvents="none" />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    bowl: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        position: 'absolute',
    },
    water: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(32, 165, 225, 0.2)', // Light blue tint
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
    },
    fishWrapper: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'transparent',
    },
    bubble: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        top: '50%',
    }
});
