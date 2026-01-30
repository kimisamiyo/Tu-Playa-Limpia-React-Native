import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import ScalePressable from './ScalePressable';

export default function PinPad({ onPinPress, onBiometricPress, onDeletePress }) {

    const handlePress = (val) => {
        // Haptic feedback moved here for self-containment, or keep in parent based on preference.
        // Parent logic currently handles logic, we just trigger.
        onPinPress(val);
    };

    const numbers = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        ['bio', 0, 'del']
    ];

    return (
        <View style={styles.container}>
            {numbers.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((item, colIndex) => {
                        // Render Biometric Button
                        if (item === 'bio') {
                            return (
                                <ScalePressable key={item} style={styles.keyWrapper} onPress={onBiometricPress}>
                                    <Ionicons name="finger-print" size={32} color={COLORS.highlight} />
                                </ScalePressable>
                            );
                        }
                        // Render Delete Button
                        if (item === 'del') {
                            return (
                                <ScalePressable key={item} style={styles.keyWrapper} onPress={onDeletePress}>
                                    <Ionicons name="backspace-outline" size={28} color={COLORS.accent} />
                                </ScalePressable>
                            );
                        }
                        // Render Number Button
                        return (
                            <ScalePressable
                                key={item}
                                style={styles.keyWrapper}
                                onPress={() => onPinPress(item.toString())}
                            >
                                <Text style={styles.number}>{item}</Text>
                            </ScalePressable>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        maxWidth: 350, // Constrain width on tablets
        marginBottom: 20, // Increased spacing for comfort
    },
    keyWrapper: {
        width: 70, // Slightly larger touch target
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    number: {
        fontSize: 28,
        color: '#fff',
        fontWeight: '400',
    }
});
