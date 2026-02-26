import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { rs, rf } from '../../constants/responsive';
const TPLTitle = ({ title, size = 'md' }) => {
    if (!title) return null;
    const getTitleStyles = () => {
        switch (title) {
            case "Golden Eco Legend":
                return {
                    color: '#FFD700',
                    textShadowColor: 'rgba(255, 215, 0, 0.8)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 15,
                };
            case "Ocean Protector":
                return {
                    color: '#00FFFF',
                    textShadowColor: 'rgba(0, 255, 255, 0.9)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 15,
                };
            case "Beach Guardian":
                return {
                    color: '#F4A460', 
                    textShadowColor: 'rgba(244, 164, 96, 0.8)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 10,
                };
            case "Collector Starter":
                return {
                    color: '#32CD32', 
                    textShadowColor: 'rgba(50, 205, 50, 0.9)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 15,
                };
            default:
                return {
                    color: '#A9A9A9', 
                };
        }
    };
    const fontSize = size === 'lg' ? rf(18) : rf(13);
    return (
        <View style={styles.container}>
            <Text style={[styles.title, getTitleStyles(), { fontSize }]}>
                {title.toUpperCase()}
            </Text>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        marginLeft: rs(8),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: rs(10),
        paddingVertical: rs(2),
        borderRadius: rs(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontWeight: '900',
        letterSpacing: 1,
    }
});
export default TPLTitle;
