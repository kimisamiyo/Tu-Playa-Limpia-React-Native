import React from 'react';
import { Pressable, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ScalePressable({ children, onPress, style, scaleTo = 0.96 }) {
    const scale = useSharedValue(1);
    const hoverScale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value * hoverScale.value }]
    }));

    const handlePressIn = () => {
        'worklet';
        scale.value = withSpring(scaleTo, { damping: 10, stiffness: 300 });
    };

    const handlePressOut = () => {
        'worklet';
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    };

    // Web Hover Support
    const handleHoverIn = () => {
        if (Platform.OS === 'web') {
            hoverScale.value = withTiming(1.03, { duration: 200 });
        }
    };

    const handleHoverOut = () => {
        if (Platform.OS === 'web') {
            hoverScale.value = withTiming(1, { duration: 200 });
        }
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            style={[style, animatedStyle, Platform.OS === 'web' && { cursor: 'pointer' }]}
        >
            {children}
        </AnimatedPressable>
    );
}
