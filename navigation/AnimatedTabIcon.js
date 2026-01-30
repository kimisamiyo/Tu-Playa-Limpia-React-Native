import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

export default function AnimatedTabIcon({ name, focused, size, color }) {
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (focused) {
            // Move up and scale up slightly
            translateY.value = withSpring(-10, { damping: 12 });
            scale.value = withSpring(1.2);
            opacity.value = withTiming(1, { duration: 200 });
        } else {
            // Reset
            translateY.value = withSpring(0);
            scale.value = withSpring(1);
            opacity.value = withTiming(0.7, { duration: 200 }); // Dim inactive
        }
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value }
        ],
        opacity: opacity.value
    }));

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={[styles.iconContainer, focused ? styles.activeBg : null]}>
                <Ionicons name={name} size={size} color={focused ? COLORS.primary : color} />
            </View>

            {/* Optional: Small Dot indicator below if needed, but the bubble bg is enough */}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeBg: {
        backgroundColor: COLORS.highlight,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    }
});
