import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { rs } from '../constants/responsive';
const FlagIcon = ({ code, size = 1, style }) => {
    if (!code || code === 'all') return null;
    const countryCode = code.toLowerCase();
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
        backgroundColor: 'rgba(0,0,0,0.1)', 
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
export default FlagIcon;
