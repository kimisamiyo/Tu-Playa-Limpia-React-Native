import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence
} from 'react-native-reanimated';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7; // Large card for rewards screen

export default function NFTCard({ title, type, price, isUnlocked = true }) {
    const shineCurrent = useSharedValue(-100);

    useEffect(() => {
        if (isUnlocked) {
            shineCurrent.value = withRepeat(
                withTiming(200, { duration: 2000 }),
                -1,
                false
            );
        }
    }, [isUnlocked]);

    const shineStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shineCurrent.value ? (shineCurrent.value + '%') : '-100%' }]
    }));

    return (
        <View style={styles.cardContainer}>
            {/* Main Card Body */}
            <LinearGradient
                colors={isUnlocked ? ['#1f2937', '#030712'] : ['#374151', '#4b5563']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, !isUnlocked && styles.lockedCard]}
            >
                {/* Image Placeholder / Icon */}
                <View style={styles.imagePlaceholder}>
                    <View style={styles.circleDecoration} />
                </View>

                {/* Watermark Brand */}
                <View style={styles.watermark}>
                    <Svg width={30} height={30} viewBox="0 0 100 100">
                        <Path
                            d="M50 0 Q80 50 100 70 Q100 100 50 100 Q0 100 0 70 Q20 50 50 0 Z"
                            fill={COLORS.accent}
                            opacity={0.6}
                        />
                    </Svg>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.pill} />
                    <Text style={styles.title}>{title || "CHAMOMILE"}</Text>
                    <Text style={styles.subtitle}>{type || "NATURAL, OIL"}</Text>

                    <View style={styles.footer}>
                        <Text style={styles.price}>{price || "39.00"} PTS</Text>
                        <Text style={styles.description}>Perfect everywhere</Text>
                    </View>
                </View>

                {/* Decorative border gradients */}
                <LinearGradient
                    colors={['transparent', '#fbbf24', 'transparent']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.bottomGlow}
                />
                <LinearGradient
                    colors={['transparent', '#fbbf24', 'transparent']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.topBorder}
                />
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.3,
        marginBottom: 20,
        ...SHADOWS.medium,
    },
    card: {
        flex: 1,
        borderRadius: 20,
        padding: 30,
        position: 'relative',
        overflow: 'hidden',
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: '#111827',
    },
    lockedCard: {
        opacity: 0.7,
        // Add grayscale if needed
    },
    imagePlaceholder: {
        marginBottom: 20,
    },
    circleDecoration: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f97316', // Orange-500
        borderTopLeftRadius: 0,
        elevation: 10,
        shadowColor: 'red',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    watermark: {
        position: 'absolute',
        top: 20,
        right: 20,
        opacity: 0.8,
    },
    pill: {
        width: '30%',
        height: 2,
        backgroundColor: '#d1d5db', // gray-300
        marginBottom: 15,
        opacity: 0.5,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e5e7eb', // gray-200
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af', // gray-400
        textTransform: 'uppercase',
        letterSpacing: 3,
        marginBottom: 30,
    },
    footer: {
        marginTop: 'auto',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#9ca3af',
    },
    description: {
        fontSize: 14,
        color: '#6b7280', // gray-500
    },
    bottomGlow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 8,
        opacity: 0.6,
    },
    topBorder: {
        position: 'absolute',
        top: 0,
        left: '15%',
        width: '70%',
        height: 2,
        opacity: 0.8,
    }

});
