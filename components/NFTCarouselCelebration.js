import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Card colors for the carousel (RGB values)
const CARD_COLORS = [
    [142, 249, 252], // Cyan
    [142, 252, 204], // Mint
    [142, 252, 157], // Green
    [215, 252, 142], // Lime
    [252, 252, 142], // Yellow
    [252, 208, 142], // Orange
    [252, 142, 142], // Red
    [252, 142, 239], // Pink
    [204, 142, 252], // Purple
    [142, 202, 252], // Blue
];

// Single rotating card
function CarouselCard({ index, totalCards, rotation, colorRGB }) {
    const anglePerCard = 360 / totalCards;
    const cardAngle = anglePerCard * index;
    const translateZ = 120; // Distance from center

    const animatedStyle = useAnimatedStyle(() => {
        const currentRotation = rotation.value + cardAngle;
        const radians = (currentRotation * Math.PI) / 180;

        // Calculate position on the circle
        const x = Math.sin(radians) * translateZ;
        const z = Math.cos(radians) * translateZ;

        // Scale based on z position (depth)
        const scale = interpolate(z, [-translateZ, translateZ], [0.6, 1.2]);
        const opacity = interpolate(z, [-translateZ, translateZ], [0.3, 1]);

        return {
            transform: [
                { translateX: x },
                { scale },
            ],
            opacity,
            zIndex: Math.round(z + translateZ),
        };
    });

    return (
        <Animated.View style={[styles.carouselCard, animatedStyle]}>
            <LinearGradient
                colors={[
                    `rgba(${colorRGB.join(',')}, 0.9)`,
                    `rgba(${colorRGB.join(',')}, 0.5)`,
                    `rgba(${colorRGB.join(',')}, 0.2)`,
                ]}
                style={styles.cardGradient}
            >
                {/* Watermark */}
                <Svg width={30} height={30} viewBox="0 0 100 100" style={styles.cardWatermark}>
                    <Path
                        d="M50 0 Q80 50 100 70 Q100 100 50 100 Q0 100 0 70 Q20 50 50 0 Z"
                        fill="#fff"
                        opacity={0.5}
                    />
                </Svg>
                <Text style={styles.cardNumber}>#{index + 1}</Text>
            </LinearGradient>
        </Animated.View>
    );
}

export default function NFTCarouselCelebration({ visible, onClose, nfts, userName }) {
    const rotation = useSharedValue(0);
    const cardCount = Math.min(nfts?.length || 8, 10); // Max 10 cards in carousel

    useEffect(() => {
        if (visible) {
            rotation.value = 0;
            rotation.value = withRepeat(
                withTiming(360, { duration: 15000, easing: Easing.linear }),
                -1, // Infinite
                false // Don't reverse
            );
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                {/* Background Gradient */}
                <LinearGradient
                    colors={['#0a0a1a', '#1a1a3a', '#0a0a1a']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Stars/Particles (decorative) */}
                <View style={styles.starsContainer}>
                    {[...Array(20)].map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.star,
                                {
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    opacity: Math.random() * 0.5 + 0.2,
                                    width: Math.random() * 3 + 1,
                                    height: Math.random() * 3 + 1,
                                }
                            ]}
                        />
                    ))}
                </View>

                {/* Congratulation Message */}
                <View style={styles.messageContainer}>
                    <Text style={styles.congrats}>¡FELICIDADES!</Text>
                    <Text style={styles.userName}>{userName || 'Ocean Guardian'}</Text>
                    <Text style={styles.achievement}>Has alcanzado {cardCount} NFTs</Text>
                </View>

                {/* 3D Carousel */}
                <View style={styles.carouselContainer}>
                    {[...Array(cardCount)].map((_, index) => (
                        <CarouselCard
                            key={index}
                            index={index}
                            totalCards={cardCount}
                            rotation={rotation}
                            colorRGB={CARD_COLORS[index % CARD_COLORS.length]}
                        />
                    ))}
                </View>

                {/* Proud Message + Level Up */}
                <View style={styles.proudContainer}>
                    {/* Level Up Badge */}
                    <View style={styles.levelUpBadge}>
                        <Text style={styles.levelUpText}>¡NIVEL 2 DESBLOQUEADO!</Text>
                    </View>

                    <Text style={styles.proudText}>
                        Estamos muy orgullosos de ti por ayudar al planeta
                    </Text>
                    <Text style={styles.subProudText}>
                        Cada NFT representa tu compromiso con el medio ambiente
                    </Text>

                    {/* Unlock Announcement */}
                    <View style={styles.unlockAnnouncement}>
                        <Text style={styles.unlockText}>¡Promociones Especiales Desbloqueadas!</Text>
                    </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <LinearGradient
                        colors={[COLORS.secondary, COLORS.primary]}
                        style={styles.closeGradient}
                    >
                        <Text style={styles.closeText}>CONTINUAR</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const CARD_WIDTH = 70;
const CARD_HEIGHT = 100;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    starsContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    star: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    messageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    congrats: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: COLORS.secondary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginTop: 10,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    achievement: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 5,
    },
    carouselContainer: {
        width: width,
        height: CARD_HEIGHT + 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    carouselCard: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 12,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    cardGradient: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardWatermark: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    cardNumber: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    proudContainer: {
        alignItems: 'center',
        paddingHorizontal: 30,
        marginTop: 20,
    },
    proudText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subProudText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginTop: 8,
    },
    closeButton: {
        marginTop: 30,
        borderRadius: 30,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    closeGradient: {
        paddingVertical: 15,
        paddingHorizontal: 50,
    },
    closeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 2,
    },
    levelUpBadge: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 15,
    },
    levelUpText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    unlockAnnouncement: {
        marginTop: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    unlockText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
