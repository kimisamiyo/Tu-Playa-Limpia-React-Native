import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    withDelay
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const DOG_SIZE = width * 0.8;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

export default function HappyDog() {
    // Animation Values
    const headRotation = useSharedValue(0);
    const headY = useSharedValue(0);
    const tailRotation = useSharedValue(0);
    const eyeScale = useSharedValue(1);
    const snoutY = useSharedValue(0);
    const earLeftRot = useSharedValue(-50);
    const earRightRot = useSharedValue(20);

    useEffect(() => {
        // Head Bobbing - "Thinking/Happy"
        headRotation.value = withRepeat(
            withSequence(
                withTiming(5, { duration: 1000 }),
                withTiming(-5, { duration: 1000 })
            ), -1, true
        );
        headY.value = withRepeat(
            withSequence(
                withTiming(2, { duration: 800 }),
                withTiming(0, { duration: 800 })
            ), -1, true
        );

        // Tail Wagging - "Excitement"
        tailRotation.value = withRepeat(
            withSequence(
                withTiming(20, { duration: 150 }),
                withTiming(-20, { duration: 150 })
            ), -1, true
        );

        // Ears reacting
        earLeftRot.value = withRepeat(
            withSequence(
                withTiming(-60, { duration: 500 }),
                withTiming(-40, { duration: 500 })
            ), -1, true
        );

        // Blinking Eyes
        eyeScale.value = withRepeat(
            withSequence(
                withDelay(2000, withTiming(0.1, { duration: 100 })),
                withTiming(1, { duration: 100 })
            ), -1, false
        );

    }, []);

    const headStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${headRotation.value}deg` },
            { translateY: headY.value }
        ]
    }));

    const tailStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${tailRotation.value}deg` }
        ],
        originX: 60, // approximate pivot
        originY: 20
    }));

    const leftEarStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${earLeftRot.value}deg` }],
        originX: 50,
        originY: 20
    }));

    const rightEarStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${earRightRot.value}deg` }],
        originX: 160,
        originY: 20
    }));

    const eyeStyle = useAnimatedStyle(() => ({
        transform: [{ scaleY: eyeScale.value }],
        originY: 120 // Pivot for blink
    }));

    return (
        <View style={styles.container}>
            <Svg width={DOG_SIZE} height={DOG_SIZE * 0.6} viewBox="0 0 300 200">
                <Defs>
                    <LinearGradient id="fur" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#deac80" stopOpacity="1" />
                        <Stop offset="1" stopColor="#dba575" stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* --- Body Group --- */}
                <G x="50" y="80">
                    {/* Tail */}
                    <AnimatedG style={tailStyle} x="180" y="10">
                        <Path d="M0,0 Q30,-20 50,0 T80,20" stroke="#914f1e" strokeWidth="15" fill="none" strokeLinecap="round" />
                    </AnimatedG>

                    {/* Main Body */}
                    <Path d="M20,50 Q100,50 180,50 L180,100 Q100,100 20,100 Z" fill="#914f1e" />

                    {/* Paws */}
                    <Path d="M40,100 L40,130" stroke="#914f1e" strokeWidth="12" strokeLinecap="round" />
                    <Path d="M140,100 L140,130" stroke="#914f1e" strokeWidth="12" strokeLinecap="round" />
                </G>

                {/* --- Head Group --- */}
                <AnimatedG style={headStyle} x="20" y="40">
                    {/* Ears */}
                    <AnimatedG style={leftEarStyle}>
                        <Path d="M30,30 Q10,0 30,-20 Q50,0 70,30 Z" fill="#deac80" />
                    </AnimatedG>
                    <AnimatedG style={rightEarStyle}>
                        <Path d="M150,30 Q170,0 150,-20 Q130,0 110,30 Z" fill="#deac80" />
                    </AnimatedG>

                    {/* Face Shape */}
                    <Rect x="40" y="30" width="120" height="90" rx="40" fill="url(#fur)" />

                    {/* Snout */}
                    <Path d="M30,70 Q100,60 170,70 L160,110 Q100,120 40,110 Z" fill="#f7dcb9" />
                    <Path d="M90,75 L110,75 L100,85 Z" fill="#6c4e31" /> {/* Nose */}

                    {/* Eyes */}
                    <AnimatedG style={eyeStyle}>
                        <Circle cx="70" cy="60" r="6" fill="#1c3130" />
                        <Circle cx="130" cy="60" r="6" fill="#1c3130" />
                    </AnimatedG>
                </AnimatedG>
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    }
});
