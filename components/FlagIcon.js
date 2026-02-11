import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { rs } from '../constants/responsive';

/**
 * FlagIcon component renders a flag image from flagcdn.com
 * @param {string} code - ISO 3166-1 alpha-2 country code (lowercase)
 * @param {number} size - Optional size multiplier
 * @param {object} style - Optional additional styles
 */
const FlagIcon = ({ code, size = 1, style }) => {
    if (!code || code === 'all') return null;

    // flagcdn uses lowercase codes
    const countryCode = code.toLowerCase();

    // High quality PNG flags from flagcdn.com
    const url = `https://flagcdn.com/w80/${countryCode}.png`;

    return (
        <View style={[styles.container, { width: rs(20 * size), height: rs(14 * size) }, style]}>
            <Image
                source={{ uri: url }}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 2,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)', // Light background for visibility
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default FlagIcon;
