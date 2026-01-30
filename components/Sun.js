import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

export default function Sun() {
    return (
        <View style={styles.container}>
            <Svg height="200" width="200" viewBox="0 0 100 100">
                <Defs>
                    <RadialGradient
                        id="grad"
                        cx="50%"
                        cy="50%"
                        rx="50%"
                        ry="50%"
                        fx="50%"
                        fy="50%"
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop offset="0%" stopColor="#FFF9C4" stopOpacity="1" />
                        <Stop offset="50%" stopColor="#FDD835" stopOpacity="0.8" />
                        <Stop offset="100%" stopColor="#F57F17" stopOpacity="0" />
                    </RadialGradient>
                </Defs>
                <Circle cx="50" cy="50" r="50" fill="url(#grad)" />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: -30,
        right: -30,
        zIndex: 1,
    },
});
