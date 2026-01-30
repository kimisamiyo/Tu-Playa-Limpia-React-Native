import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export function WalletScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Billetera de Tokens</Text>
        </View>
    );
}

export function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Perfil de Usuario</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    text: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: 'bold',
    }
});
