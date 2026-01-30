import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

export default function PinDisplay({ pinLength, shakeValue }) {
    const shakeStyle = useAnimatedStyle(() => {
        return { transform: [{ translateX: shakeValue.value }] };
    });

    return (
        <Animated.View style={[styles.container, shakeStyle]}>
            {[...Array(4)].map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        pinLength > i ? styles.dotFilled : styles.dotEmpty,
                    ]}
                />
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 15,
    },
    dotEmpty: {
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    dotFilled: {
        backgroundColor: COLORS.highlight,
    },
});
