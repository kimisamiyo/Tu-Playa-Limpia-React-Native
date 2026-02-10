import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

// Local SHADOWS definition since it's not exported directly from theme
const SHADOWS = {
    medium: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
};

const { width } = Dimensions.get('window');

export default function LiquidButton({ onPress, label = "CONTINUAR" }) {
    const drop1Progress = useSharedValue(0);
    const drop2Progress = useSharedValue(0);
    const drop3Progress = useSharedValue(0);
    const buttonPulse = useSharedValue(1);

    useEffect(() => {
        // Drop 1 - Left
        drop1Progress.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1200, easing: Easing.in(Easing.quad) }),
                withTiming(0, { duration: 0 })
            ),
            -1,
            false
        );

        // Drop 2 - Center (delayed)
        drop2Progress.value = withDelay(
            400,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 1400, easing: Easing.in(Easing.quad) }),
                    withTiming(0, { duration: 0 })
                ),
                -1,
                false
            )
        );

        // Drop 3 - Right (more delayed)
        drop3Progress.value = withDelay(
            800,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 1000, easing: Easing.in(Easing.quad) }),
                    withTiming(0, { duration: 0 })
                ),
                -1,
                false
            )
        );

        // Button subtle pulse
        buttonPulse.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 1000, easing: Easing.ease }),
                withTiming(1, { duration: 1000, easing: Easing.ease })
            ),
            -1,
            true
        );
    }, []);

    const drop1Style = useAnimatedStyle(() => {
        const translateY = interpolate(drop1Progress.value, [0, 1], [0, 60]);
        const opacity = interpolate(drop1Progress.value, [0, 0.7, 1], [1, 0.8, 0]);
        const scale = interpolate(drop1Progress.value, [0, 0.5, 1], [1, 1.2, 0.8]);
        return {
            transform: [{ translateY }, { scale }],
            opacity,
        };
    });

    const drop2Style = useAnimatedStyle(() => {
        const translateY = interpolate(drop2Progress.value, [0, 1], [0, 70]);
        const opacity = interpolate(drop2Progress.value, [0, 0.7, 1], [1, 0.8, 0]);
        const scale = interpolate(drop2Progress.value, [0, 0.5, 1], [1, 1.3, 0.7]);
        return {
            transform: [{ translateY }, { scale }],
            opacity,
        };
    });

    const drop3Style = useAnimatedStyle(() => {
        const translateY = interpolate(drop3Progress.value, [0, 1], [0, 50]);
        const opacity = interpolate(drop3Progress.value, [0, 0.7, 1], [1, 0.8, 0]);
        const scale = interpolate(drop3Progress.value, [0, 0.5, 1], [1, 1.1, 0.9]);
        return {
            transform: [{ translateY }, { scale }],
            opacity,
        };
    });

    const buttonAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonPulse.value }],
    }));

    return (
        <View style={styles.wrapper}>
            {/* Drip Container */}
            <View style={styles.dripsContainer}>
                <Animated.View style={[styles.drop, styles.dropLeft, drop1Style]} />
                <Animated.View style={[styles.drop, styles.dropCenter, drop2Style]} />
                <Animated.View style={[styles.drop, styles.dropRight, drop3Style]} />
            </View>

            {/* Liquid Base */}
            <View style={styles.liquidBase} />

            {/* Button */}
            <Animated.View style={[styles.buttonWrapper, buttonAnimStyle]}>
                <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                    <LinearGradient
                        colors={[COLORS.secondary, COLORS.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.buttonContainer}
                    >
                        <Text style={styles.label}>{label}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        position: 'relative',
    },
    buttonWrapper: {
        zIndex: 10,
    },
    buttonContainer: {
        paddingVertical: 16,
        paddingHorizontal: 50,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        ...SHADOWS.medium,
    },
    label: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 2,
        textAlign: 'center',
    },
    dripsContainer: {
        position: 'absolute',
        bottom: -25,
        left: 0,
        right: 0,
        height: 80,
        alignItems: 'center',
        zIndex: 1,
    },
    liquidBase: {
        position: 'absolute',
        bottom: 25,
        width: 180,
        height: 10,
        backgroundColor: COLORS.secondary,
        borderRadius: 5,
        zIndex: 5,
    },
    drop: {
        position: 'absolute',
        top: 0,
        width: 14,
        height: 20,
        backgroundColor: COLORS.secondary,
        borderRadius: 10,
    },
    dropLeft: {
        left: '25%',
    },
    dropCenter: {
        left: '50%',
        marginLeft: -7,
        width: 12,
        height: 18,
    },
    dropRight: {
        right: '25%',
        width: 10,
        height: 16,
    },
});

