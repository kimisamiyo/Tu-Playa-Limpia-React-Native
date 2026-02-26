import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { BRAND } from '../../constants/theme';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const Bubble = ({ size, startX, delay, duration, zDepth }) => {
    const { isDark } = useTheme();
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-SCREEN_HEIGHT - 100, {
                    duration,
                    easing: Easing.linear,
                }),
                -1,
                false
            )
        );
        translateX.value = withDelay(
            delay,
            withRepeat(
                withTiming(20, {
                    duration: duration * 0.4,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
        scale.value = withDelay(
            delay,
            withRepeat(
                withTiming(1.15, {
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
        opacity.value = withDelay(
            delay,
            withTiming(1, { duration: 1000 })
        );
    }, []);
    const animatedStyle = useAnimatedStyle(() => {
        const positionOpacity = interpolate(
            translateY.value,
            [-SCREEN_HEIGHT, -SCREEN_HEIGHT * 0.8, -SCREEN_HEIGHT * 0.2, 0],
            [0, 1, 1, 0.3]
        );
        return {
            transform: [
                { translateY: translateY.value },
                { translateX: translateX.value },
                { scale: scale.value },
            ],
            opacity: opacity.value * positionOpacity * zDepth,
        };
    });
    const bubbleColor = isDark
        ? `rgba(0, 255, 255, ${0.15 * zDepth})`
        : `rgba(13, 74, 111, ${0.08 * zDepth})`;
    const borderColor = isDark
        ? `rgba(0, 255, 255, ${0.3 * zDepth})`
        : `rgba(13, 74, 111, ${0.15 * zDepth})`;
    return (
        <Animated.View
            style={[
                styles.bubble,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    left: startX,
                    backgroundColor: bubbleColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                },
                animatedStyle,
            ]}
        >
            {}
            <View
                style={[
                    styles.highlight,
                    {
                        width: size * 0.25,
                        height: size * 0.25,
                        borderRadius: size * 0.125,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)',
                    }
                ]}
            />
        </Animated.View>
    );
};
export default function FloatingBubbles({
    count = 12,
    minSize = 4,
    maxSize = 18,
    zIndex = -1,  
}) {
    const { width } = Dimensions.get('window');
    const bubbles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            size: minSize + Math.random() * (maxSize - minSize),
            startX: Math.random() * width,
            delay: Math.random() * 8000,
            duration: 12000 + Math.random() * 10000,
            zDepth: 0.4 + Math.random() * 0.6, 
        }));
    }, [count, minSize, maxSize, width]);
    return (
        <View style={[styles.container, { zIndex }]} pointerEvents="none">
            {bubbles.map((bubble) => (
                <Bubble
                    key={bubble.id}
                    size={bubble.size}
                    startX={bubble.startX}
                    delay={bubble.delay}
                    duration={bubble.duration}
                    zDepth={bubble.zDepth}
                />
            ))}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    bubble: {
        position: 'absolute',
        bottom: -50,
    },
    highlight: {
        position: 'absolute',
        top: '15%',
        left: '20%',
    },
});
