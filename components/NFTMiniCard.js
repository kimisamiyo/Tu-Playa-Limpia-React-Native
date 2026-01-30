import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 3; // 3 columns with spacing
const BORDER_WIDTH = 2;

// Dark/Blue gradient palettes matching app theme
const GRADIENT_PALETTES = [
    ['#00334e', '#145374'],              // Deep Navy to Steel Blue
    ['#0a1628', '#1a3a52'],              // Dark Navy
    ['#171717', '#2d2d2d'],              // Dark Gray
    ['#0d1b2a', '#1b263b', '#415a77'],   // Navy Gradient
    ['#1a1a2e', '#16213e', '#0f3460'],   // Midnight Blue
    ['#2c3e50', '#3d5a73'],              // Slate Blue
    ['#1c1c1c', '#363636', '#4a4a4a'],   // Charcoal Gray
    ['#001f3f', '#003366', '#004080'],   // Ocean Blue
];

// Nature icons as simple SVG paths
const NATURE_ICONS = {
    Ocean: (
        <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#fff" opacity={0.8} />
        </Svg>
    ),
    Forest: (
        <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M17 12h2L12 2 5 12h2l-3 8h6v2h4v-2h6l-3-8z" fill="#fff" opacity={0.8} />
        </Svg>
    ),
    Mountain: (
        <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z" fill="#fff" opacity={0.8} />
        </Svg>
    ),
    River: (
        <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z" fill="#fff" opacity={0.8} />
        </Svg>
    ),
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function NFTMiniCard({ nft, onPress, index }) {
    // Use index to pick consistent but varied gradient
    const gradientIndex = (index || 0) % GRADIENT_PALETTES.length;
    const gradient = GRADIENT_PALETTES[gradientIndex];
    const natureType = nft?.image || 'Ocean';

    // Animation values
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const borderRotation = useSharedValue(0);

    // Start continuous border rotation animation
    useEffect(() => {
        borderRotation.value = withRepeat(
            withTiming(360, { duration: 4000, easing: Easing.linear }),
            -1, // Infinite
            false // Don't reverse
        );
    }, []);

    const handlePressIn = () => {
        rotateY.value = withSpring(15, { damping: 10 });
        rotateX.value = withSpring(-5, { damping: 10 });
        scale.value = withSpring(1.05, { damping: 10 });
    };

    const handlePressOut = () => {
        rotateY.value = withSpring(0, { damping: 10 });
        rotateX.value = withSpring(0, { damping: 10 });
        scale.value = withSpring(1, { damping: 10 });
    };

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 800 },
            { rotateY: `${rotateY.value}deg` },
            { rotateX: `${rotateX.value}deg` },
            { scale: scale.value },
        ],
    }));

    // Rotating border style
    const borderAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${borderRotation.value}deg` }],
    }));

    // Get owner info
    const ownerInitials = nft?.ownerInitials || 'OG';
    const ownerAvatar = nft?.ownerAvatar;

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
                {/* Rotating Gradient Border */}
                <View style={styles.borderWrapper}>
                    <Animated.View style={[styles.rotatingBorder, borderAnimatedStyle]}>
                        <LinearGradient
                            colors={[COLORS.secondary, '#00c6ff', COLORS.primary, COLORS.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.borderGradient}
                        />
                    </Animated.View>
                </View>

                {/* Inner Card Content */}
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    {/* Owner Avatar (Top Left) */}
                    <View style={styles.ownerBadge}>
                        {ownerAvatar ? (
                            <Image
                                source={{ uri: ownerAvatar }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>{ownerInitials}</Text>
                            </View>
                        )}
                    </View>

                    {/* Watermark Drop (Top Right) */}
                    <View style={styles.watermark}>
                        <Svg width={12} height={12} viewBox="0 0 100 100">
                            <Path
                                d="M50 0 Q80 50 100 70 Q100 100 50 100 Q0 100 0 70 Q20 50 50 0 Z"
                                fill="#fff"
                                opacity={0.4}
                            />
                        </Svg>
                    </View>

                    {/* Nature Icon (Center) */}
                    <View style={styles.iconContainer}>
                        {NATURE_ICONS[natureType] || NATURE_ICONS.Ocean}
                    </View>

                    {/* Title */}
                    <Text style={styles.title} numberOfLines={1}>
                        {nft?.title?.split(':')[1]?.trim() || 'Spirit'}
                    </Text>

                    {/* Lock Badge (Bottom Right) */}
                    <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={12} color="#fff" />
                    </View>

                    {/* 3D Shine Effect */}
                    <View style={styles.shineOverlay} />
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_SIZE,
        height: CARD_SIZE * 1.3,
        margin: 5,
        backgroundColor: '#171717',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 5,
    },
    borderWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    rotatingBorder: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 40,
        height: CARD_SIZE * 2,
        marginLeft: -20,
        marginTop: -CARD_SIZE,
    },
    borderGradient: {
        width: '100%',
        height: '100%',
    },
    card: {
        width: CARD_SIZE - 4,
        height: CARD_SIZE * 1.3 - 4,
        borderRadius: 5,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 1,
    },
    ownerBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        zIndex: 2,
    },
    avatarCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    avatarText: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#333',
    },
    avatarImage: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.9)',
    },
    watermark: {
        position: 'absolute',
        top: 6,
        right: 6,
        zIndex: 2,
    },
    iconContainer: {
        marginTop: 5,
        opacity: 0.9,
    },
    title: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
        marginTop: 8,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    lockBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        zIndex: 2,
    },
    lockText: {
        fontSize: 10,
    },
    shineOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
});

