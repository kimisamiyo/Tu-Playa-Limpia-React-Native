import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ScannerScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Scanner Screen (Debug)</Text>
            <Text style={styles.subtext}>Si ves esto, la navegación funciona.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        color: COLORS.highlight,
        fontWeight: 'bold',
    },
    subtext: {
        fontSize: 16,
        color: 'white',
        marginTop: 10,
    }
});
