import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_BOWL_SIZE = Math.min(SCREEN_WIDTH * 0.55, 220);
const FISH_SIZE = 45;

const AnimatedView = Animated.createAnimatedComponent(View);

// SVG Fish Component (from CSS design)
const FishSVG = () => (
    <Svg width={FISH_SIZE} height={FISH_SIZE} viewBox="0 0 512 512">
        <G>
            <Path
                d="M155.225,223.377c0,0,37.189-90.859,144.589-91.34c100.768-0.451,124.753,59.527,124.753,59.527 L155.225,223.377z"
                fill="#3c66b1"
            />
            <Path
                d="M267.842,339.889c-89.137-24.416-179.415-81.052-179.415-81.052s140.421-92.038,253.44-92.038 s162.587,121.482,162.587,121.482s-49.567,62.594-162.587,62.594c-7.464,0-15.002-0.401-22.575-1.151L267.842,339.889z"
                fill="#8ec1ed"
            />
            <Path
                opacity={0.4}
                d="M504.454,288.279c0,0-31.461-77.103-101.402-108.457c-16.687,7.061-52.699,48.747-53.584,82.508 c-0.941,35.906,12.738,68.547,41.995,84.212C469.521,332.375,504.454,288.279,504.454,288.279z"
                fill="#3c66b1"
            />
            <Path
                d="M349.468,268.867c0,0,0.053,91.146-81.623,111.099v-91.062c0-10.128,8.092-18.402,18.217-18.627 L349.468,268.867z"
                fill="#315591"
            />
            <Circle cx="413.916" cy="255.823" r="10.653" fill="#315591" />
            <Path
                d="M98.489,258.837c0,0-0.526-31.012-18.339-44.472c-17.814-13.461-72.604-25.84-72.604-25.84 s26.962,52.578,44.774,66.038c0.024,0.018,0.048,0.036,0.072,0.054c2.843,2.135,2.843,6.303,0,8.438 c-0.024,0.018-0.048,0.036-0.072,0.054c-17.813,13.461-44.774,66.039-44.774,66.039s54.79-12.379,72.604-25.84 C97.963,289.849,98.489,258.837,98.489,258.837h-0.001H98.489z"
                fill="#52a2e7"
            />
        </G>
    </Svg>
);

export default function FishBowlLoader({ size }) {
    const bowlSize = size || DEFAULT_BOWL_SIZE;
    // Animation values for circular/organic movement
    const fishProgress = useSharedValue(0);
    const fishY = useSharedValue(0);
    const bubbleY1 = useSharedValue(0);
    const bubbleY2 = useSharedValue(0);
    const bubbleY3 = useSharedValue(0);
    const bubbleOpacity1 = useSharedValue(0);
    const bubbleOpacity2 = useSharedValue(0);
    const bubbleOpacity3 = useSharedValue(0);

    useEffect(() => {
        // Fish swimming in an organic path (8 seconds per full cycle)
        fishProgress.value = withRepeat(
            withTiming(1, { duration: 8000, easing: Easing.linear }),
            -1,
            false
        );

        // Fish vertical bobbing
        fishY.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                withTiming(4, { duration: 1200, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Bubble 1 animation
        bubbleY1.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 0 }),
                withTiming(-60, { duration: 2500, easing: Easing.out(Easing.quad) })
            ),
            -1,
            false
        );
        bubbleOpacity1.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 300 }),
                withTiming(0, { duration: 2200 })
            ),
            -1,
            false
        );

        // Bubble 2 animation (delayed)
        setTimeout(() => {
            bubbleY2.value = withRepeat(
                withSequence(
                    withTiming(0, { duration: 0 }),
                    withTiming(-50, { duration: 2000, easing: Easing.out(Easing.quad) })
                ),
                -1,
                false
            );
            bubbleOpacity2.value = withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 250 }),
                    withTiming(0, { duration: 1750 })
                ),
                -1,
                false
            );
        }, 800);

        // Bubble 3 animation (more delayed)
        setTimeout(() => {
            bubbleY3.value = withRepeat(
                withSequence(
                    withTiming(0, { duration: 0 }),
                    withTiming(-45, { duration: 1800, easing: Easing.out(Easing.quad) })
                ),
                -1,
                false
            );
            bubbleOpacity3.value = withRepeat(
                withSequence(
                    withTiming(0.4, { duration: 200 }),
                    withTiming(0, { duration: 1600 })
                ),
                -1,
                false
            );
        }, 1500);
    }, []);

    // Fish circular/organic movement around the bowl
    const fishStyle = useAnimatedStyle(() => {
        const progress = fishProgress.value;

        // Create a figure-8 / organic path
        const radiusX = bowlSize * 0.28;
        const radiusY = bowlSize * 0.12;

        // Figure-8 path using sine waves
        const translateX = Math.sin(progress * 2 * Math.PI) * radiusX;
        const translateY = Math.sin(progress * 4 * Math.PI) * radiusY + fishY.value;

        // Fish faces direction of movement
        const scaleX = Math.cos(progress * 2 * Math.PI) > 0 ? 1 : -1;

        // Slight rotation based on movement
        const rotation = Math.sin(progress * 2 * Math.PI) * 10;

        return {
            transform: [
                { translateX },
                { translateY },
                { scaleX },
                { rotate: `${rotation * scaleX}deg` },
            ],
        };
    });

    // Bubble styles
    const bubble1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: bubbleY1.value }],
        opacity: bubbleOpacity1.value,
    }));

    const bubble2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: bubbleY2.value }],
        opacity: bubbleOpacity2.value,
    }));

    const bubble3Style = useAnimatedStyle(() => ({
        transform: [{ translateY: bubbleY3.value }],
        opacity: bubbleOpacity3.value,
    }));

    return (
        <View style={styles.container}>
            {/* Bowl */}
            <View style={[styles.bowl, { width: bowlSize, height: bowlSize, borderRadius: bowlSize / 2 }]}>
                {/* Glass highlight (subtle) */}
                <View style={styles.glassHighlight} />
                <View style={styles.glassHighlight2} />

                {/* Water */}
                <View style={styles.waterContainer}>
                    <View style={styles.water} />
                </View>

                {/* Fish */}
                <AnimatedView style={[styles.fishContainer, fishStyle]}>
                    <FishSVG />
                </AnimatedView>

                {/* Bubbles */}
                <AnimatedView style={[styles.bubble, styles.bubble1, bubble1Style]} />
                <AnimatedView style={[styles.bubble, styles.bubble2, bubble2Style]} />
                <AnimatedView style={[styles.bubble, styles.bubble3, bubble3Style]} />
            </View>

            {/* Shadow */}
            <View style={[styles.shadow, { width: bowlSize * 0.9 }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    bowl: {
        width: DEFAULT_BOWL_SIZE,
        height: DEFAULT_BOWL_SIZE,
        borderRadius: DEFAULT_BOWL_SIZE / 2,
        backgroundColor: '#2a3a4a',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
        overflow: 'hidden',
        position: 'relative',
    },
    glassHighlight: {
        position: 'absolute',
        top: '8%',
        left: '15%',
        width: '25%',
        height: '15%',
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.12)',
        transform: [{ rotate: '-25deg' }],
    },
    glassHighlight2: {
        position: 'absolute',
        top: '18%',
        left: '12%',
        width: '12%',
        height: '8%',
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.08)',
        transform: [{ rotate: '-25deg' }],
    },
    waterContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '52%',
        overflow: 'hidden',
    },
    water: {
        position: 'absolute',
        bottom: 0,
        left: -5,
        right: -5,
        height: '100%',
        backgroundColor: '#1e96d1',
        borderTopLeftRadius: DEFAULT_BOWL_SIZE * 0.8,
        borderTopRightRadius: DEFAULT_BOWL_SIZE * 0.8,
    },
    fishContainer: {
        position: 'absolute',
        bottom: '25%',
        left: '50%',
        marginLeft: -FISH_SIZE / 2,
        zIndex: 10,
    },
    bubble: {
        position: 'absolute',
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    bubble1: {
        width: 7,
        height: 7,
        bottom: '30%',
        left: '45%',
    },
    bubble2: {
        width: 5,
        height: 5,
        bottom: '28%',
        left: '55%',
    },
    bubble3: {
        width: 4,
        height: 4,
        bottom: '32%',
        left: '38%',
    },
    shadow: {
        marginTop: 15,
        width: DEFAULT_BOWL_SIZE * 0.9,
        height: 25,
        borderRadius: 100,
        backgroundColor: 'rgba(0,0,0,0.25)',
        transform: [{ scaleY: 0.25 }],
    },
});
