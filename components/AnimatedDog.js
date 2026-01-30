import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';

// Color Palette from CSS
const COLORS = {
    dogSkin: '#deac80',
    dogBody: '#914f1e',
    snout: '#f7dcb9',
    nose: '#6c4e31',
    eye: '#1c3130',
    paw: '#fffbe6',
    shadow: '#b5c18e',
    mouth: '#ff6b6b',
};

const SCALE = 0.8; // Scale factor for the dog

export default function AnimatedDog({ isAwake = false }) {
    // Shared Values for Animation
    const headRotate = useSharedValue(0);
    const headY = useSharedValue(0);
    const eyeScaleY = useSharedValue(0.3);
    const earLeftRotate = useSharedValue(-50);
    const earRightRotate = useSharedValue(25);
    const tailRotate = useSharedValue(0);
    const mouthScale = useSharedValue(0);

    useEffect(() => {
        // Tail wagging animation
        tailRotate.value = withRepeat(
            withSequence(
                withTiming(-20, { duration: 200, easing: Easing.ease }),
                withTiming(20, { duration: 200, easing: Easing.ease })
            ),
            -1,
            true
        );

        // Head bobbing
        headY.value = withRepeat(
            withSequence(
                withTiming(-3, { duration: 500, easing: Easing.ease }),
                withTiming(3, { duration: 500, easing: Easing.ease })
            ),
            -1,
            true
        );

        // Ear wiggles
        earLeftRotate.value = withRepeat(
            withSequence(
                withTiming(-55, { duration: 300 }),
                withTiming(-45, { duration: 300 }),
                withTiming(-50, { duration: 2000 })
            ),
            -1,
            false
        );

        earRightRotate.value = withRepeat(
            withSequence(
                withTiming(20, { duration: 300 }),
                withTiming(30, { duration: 300 }),
                withTiming(25, { duration: 2000 })
            ),
            -1,
            false
        );
    }, []);

    useEffect(() => {
        if (isAwake) {
            // Wake up animation - eyes open and mouth opens
            eyeScaleY.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) });
            mouthScale.value = withTiming(1, { duration: 300 });
            headRotate.value = withSequence(
                withTiming(10, { duration: 200 }),
                withTiming(0, { duration: 200 })
            );
        } else {
            eyeScaleY.value = withTiming(0.3, { duration: 400 });
            mouthScale.value = withTiming(0, { duration: 200 });
        }
    }, [isAwake]);

    const headStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: headY.value },
            { rotateZ: `${headRotate.value}deg` }
        ]
    }));

    const leftEarStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${earLeftRotate.value}deg` }]
    }));

    const rightEarStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${earRightRotate.value}deg` }]
    }));

    const eyeStyle = useAnimatedStyle(() => ({
        transform: [{ scaleY: eyeScaleY.value }]
    }));

    const tailStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${tailRotate.value}deg` }]
    }));

    const mouthStyle = useAnimatedStyle(() => ({
        transform: [{ scaleY: mouthScale.value }],
        opacity: mouthScale.value,
    }));

    return (
        <View style={styles.container}>
            <View style={styles.dog}>
                {/* TAIL */}
                <Animated.View style={[styles.tailWrapper, tailStyle]}>
                    <View style={styles.tail} />
                </Animated.View>

                {/* BODY */}
                <View style={styles.body} />

                {/* PAWS */}
                <View style={styles.pawsRow}>
                    <View style={styles.paw} />
                    <View style={styles.paw} />
                    <View style={styles.paw} />
                    <View style={styles.paw} />
                </View>

                {/* HEAD GROUP */}
                <Animated.View style={[styles.headContainer, headStyle]}>
                    {/* EARS */}
                    <Animated.View style={[styles.ear, styles.earLeft, leftEarStyle]} />
                    <Animated.View style={[styles.ear, styles.earRight, rightEarStyle]} />

                    {/* HEAD SHAPE */}
                    <View style={styles.headMain}>
                        {/* SNOUT */}
                        <View style={styles.snout}>
                            {/* NOSE */}
                            <View style={styles.noseTip} />

                            {/* MOUTH (opens when awake) */}
                            <Animated.View style={[styles.mouth, mouthStyle]} />
                        </View>

                        {/* EYES */}
                        <View style={styles.eyesContainer}>
                            <Animated.View style={[styles.eyeWrapper, eyeStyle]}>
                                <View style={styles.eye}>
                                    <View style={styles.eyeHighlight} />
                                </View>
                            </Animated.View>
                            <Animated.View style={[styles.eyeWrapper, eyeStyle]}>
                                <View style={styles.eye}>
                                    <View style={styles.eyeHighlight} />
                                </View>
                            </Animated.View>
                        </View>
                    </View>
                </Animated.View>

                {/* SHADOW */}
                <View style={styles.shadow} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 180 * SCALE,
        height: 160 * SCALE,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    dog: {
        width: 150 * SCALE,
        height: 120 * SCALE,
        alignItems: 'center',
        position: 'relative',
    },
    // BODY
    body: {
        position: 'absolute',
        bottom: 20 * SCALE,
        width: 100 * SCALE,
        height: 50 * SCALE,
        backgroundColor: COLORS.dogBody,
        borderTopLeftRadius: 25 * SCALE,
        borderTopRightRadius: 40 * SCALE,
        borderBottomLeftRadius: 35 * SCALE,
        borderBottomRightRadius: 15 * SCALE,
        zIndex: 1,
    },
    // TAIL
    tailWrapper: {
        position: 'absolute',
        bottom: 40 * SCALE,
        right: -5 * SCALE,
        zIndex: 0,
        transformOrigin: 'left center',
    },
    tail: {
        width: 35 * SCALE,
        height: 18 * SCALE,
        backgroundColor: COLORS.dogBody,
        borderRadius: 10 * SCALE,
    },
    // PAWS
    pawsRow: {
        position: 'absolute',
        bottom: 5 * SCALE,
        flexDirection: 'row',
        gap: 6 * SCALE,
        zIndex: 10,
    },
    paw: {
        width: 18 * SCALE,
        height: 18 * SCALE,
        backgroundColor: COLORS.paw,
        borderRadius: 9 * SCALE,
    },
    // HEAD
    headContainer: {
        position: 'absolute',
        bottom: 35 * SCALE,
        left: 10 * SCALE,
        zIndex: 20,
        alignItems: 'center',
    },
    headMain: {
        width: 70 * SCALE,
        height: 55 * SCALE,
        backgroundColor: COLORS.dogSkin,
        borderTopLeftRadius: 35 * SCALE,
        borderTopRightRadius: 35 * SCALE,
        borderBottomLeftRadius: 28 * SCALE,
        borderBottomRightRadius: 28 * SCALE,
        zIndex: 2,
        alignItems: 'center',
    },
    // SNOUT
    snout: {
        position: 'absolute',
        bottom: -5 * SCALE,
        left: -12 * SCALE,
        width: 55 * SCALE,
        height: 30 * SCALE,
        backgroundColor: COLORS.snout,
        borderTopRightRadius: 20 * SCALE,
        borderBottomRightRadius: 20 * SCALE,
        borderBottomLeftRadius: 30 * SCALE,
        zIndex: 3,
    },
    noseTip: {
        position: 'absolute',
        top: 2 * SCALE,
        left: 3 * SCALE,
        width: 15 * SCALE,
        height: 10 * SCALE,
        backgroundColor: COLORS.nose,
        borderRadius: 6 * SCALE,
    },
    mouth: {
        position: 'absolute',
        bottom: 3 * SCALE,
        left: 18 * SCALE,
        width: 18 * SCALE,
        height: 8 * SCALE,
        backgroundColor: COLORS.mouth,
        borderBottomLeftRadius: 10 * SCALE,
        borderBottomRightRadius: 10 * SCALE,
    },
    // EYES
    eyesContainer: {
        position: 'absolute',
        top: 20 * SCALE,
        left: 8 * SCALE,
        flexDirection: 'row',
        gap: 18 * SCALE,
    },
    eyeWrapper: {
        // For animation
    },
    eye: {
        width: 10 * SCALE,
        height: 10 * SCALE,
        backgroundColor: COLORS.eye,
        borderRadius: 5 * SCALE,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        padding: 2 * SCALE,
    },
    eyeHighlight: {
        width: 3 * SCALE,
        height: 3 * SCALE,
        backgroundColor: '#fff',
        borderRadius: 1.5 * SCALE,
    },
    // EARS
    ear: {
        position: 'absolute',
        width: 35 * SCALE,
        height: 28 * SCALE,
        backgroundColor: COLORS.dogSkin,
        borderTopLeftRadius: 20 * SCALE,
        borderTopRightRadius: 18 * SCALE,
        borderBottomRightRadius: 30 * SCALE,
        borderBottomLeftRadius: 30 * SCALE,
        zIndex: 1,
    },
    earLeft: {
        top: 0,
        left: 40 * SCALE,
        transformOrigin: 'bottom left',
    },
    earRight: {
        top: 0,
        right: -5 * SCALE,
        transformOrigin: 'bottom right',
    },
    // SHADOW
    shadow: {
        position: 'absolute',
        bottom: 0,
        width: 120 * SCALE,
        height: 12 * SCALE,
        backgroundColor: COLORS.shadow,
        borderRadius: 50,
        opacity: 0.5,
    },
});

