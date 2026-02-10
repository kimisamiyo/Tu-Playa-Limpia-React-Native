import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { rs, rf, SPACING, RADIUS } from '../../constants/responsive';
import { BRAND } from '../../constants/theme';
import GenerativeNFT from '../GenerativeNFT';
import { useLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');
// Default card dimensions
const DEFAULT_CARD_WIDTH = width * 0.85;
const DEFAULT_CARD_HEIGHT = DEFAULT_CARD_WIDTH * 1.4;

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED BUBBLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const AnimatedBubble = ({ index, total, sizeScale = 1 }) => {
    const size = (4 + (index % 5) * 2) * sizeScale;
    const duration = 4000 + (index % 4) * 1000;
    const delay = (index * 800) % 3000;
    const leftPos = `${10 + (index * 15) % 80}%`;

    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    // We can't access card height deeply here easily without context,
    // but a relative value works if container clips.
    // Assuming standard travel distance.
    const travelDist = 200 * sizeScale;

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-travelDist, { duration: duration, easing: Easing.linear }),
                -1,
                false
            )
        );

        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.6, { duration: duration * 0.2 }),
                    withTiming(0.6, { duration: duration * 0.6 }),
                    withTiming(0, { duration: duration * 0.2 })
                ),
                -1,
                false
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.bubble,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    left: leftPos,
                    bottom: -10,
                },
                animatedStyle,
            ]}
        />
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MOON / PEARL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const MoonPearl = ({ scale = 1 }) => {
    return (
        <View style={[styles.moonContainer, { transform: [{ scale }] }]}>
            <LinearGradient
                colors={['#ffffff', '#f0f0f0', '#e0e0e0']}
                style={styles.moon}
            >
                <View style={[styles.crater, styles.cr1]} />
                <View style={[styles.crater, styles.cr2]} />
                <View style={[styles.crater, styles.cr3]} />
            </LinearGradient>
            <View style={styles.moonGlow} />
        </View>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CARD
// ═══════════════════════════════════════════════════════════════════════════
const EarthCard = ({
    children,
    title,
    rarity,
    description,
    image, // Added image prop
    date,
    isNew, // Added isNew prop
    attributes, // New prop for generative NFTs
    width = DEFAULT_CARD_WIDTH,
    height = DEFAULT_CARD_HEIGHT,
    compact = false
}) => {
    const { t } = useLanguage();
    const bubbles = Array.from({ length: compact ? 4 : 8 }, (_, i) => i);
    const scale = compact ? 0.4 : 1;

    // Determine if we should show the generative view
    const isGenerative = attributes && attributes.length > 0;

    return (
        <View style={[
            styles.cardContainer,
            { width, height, borderRadius: compact ? 12 : 20 }
        ]}>
            <LinearGradient
                colors={[BRAND.oceanDeep, '#0a0a2e', '#000000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, { borderRadius: compact ? 12 : 20 }]}
            >
                {/* 1. Background Content */}
                {isGenerative ? (
                    /* RENDER GENERATIVE NFT */
                    <View style={StyleSheet.absoluteFill}>
                        <GenerativeNFT
                            attributes={attributes}
                            width={width}
                            height={height}
                        />
                        {/* Overlay bubbles for effect if desired, or keep clean */}
                        <View style={[StyleSheet.absoluteFill, { zIndex: 5 }]}>
                            {bubbles.map((i) => (
                                <AnimatedBubble key={i} index={i} total={8} sizeScale={scale} />
                            ))}
                        </View>
                        {/* New Badge/Glow Overlay */}
                        {isNew && (
                            <View style={styles.newOverlay}>
                                <View style={styles.newBadge}>
                                    <Text style={styles.newText}>{t('nft_badge_new')}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                ) : image ? (
                    /* STATIC IMAGE VIEW */
                    <View style={StyleSheet.absoluteFill}>
                        <Image
                            source={{ uri: image }}
                            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                        />
                        {/* Gradient overlay for text readability */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
                        />
                        {/* New Badge/Glow Overlay for Image Mode */}
                        {isNew && (
                            <View style={styles.newOverlay}>
                                <View style={styles.newBadge}>
                                    <Text style={styles.newText}>{t('nft_badge_new')}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                ) : (
                    /* DEFAULT MOON/PEARL VIEW */
                    <>
                        <View style={StyleSheet.absoluteFill}>
                            {bubbles.map((i) => (
                                <AnimatedBubble key={i} index={i} total={8} sizeScale={scale} />
                            ))}
                        </View>
                        <View style={{ position: 'absolute', top: compact ? 5 : 20, right: compact ? 5 : 20, zIndex: 10 }}>
                            <MoonPearl scale={scale} />
                        </View>
                    </>
                )}

                {/* 3. Content Overlay (Text) */}
                <View style={[styles.contentContainer, { padding: compact ? 8 : SPACING.lg }]}>
                    {children}

                    {/* Default content layout if props provided */}
                    {(title || rarity) && (
                        <View style={[
                            styles.infoBlock,
                            compact && { padding: 6, borderWidth: 0, backgroundColor: 'rgba(0,0,0,0.5)' }
                        ]}>
                            {rarity && (
                                <View style={[
                                    styles.rarityBadge,
                                    { backgroundColor: getRarityColor(rarity) },
                                    compact && { marginBottom: 2, paddingVertical: 2, paddingHorizontal: 4 }
                                ]}>
                                    <Text style={[styles.rarityText, compact && { fontSize: 8 }]}>{rarity}</Text>
                                </View>
                            )}

                            {title && (
                                <Text
                                    style={[
                                        styles.title,
                                        compact && { fontSize: rf(11), marginBottom: 0 }
                                    ]}
                                    numberOfLines={compact ? 2 : undefined}
                                >
                                    {title}
                                </Text>
                            )}

                            {!compact && description && <Text style={styles.description}>{description}</Text>}

                            {!compact && date && (
                                <View style={styles.footer}>
                                    <Text style={styles.dateLabel}>{t('nft_discovered_on')}</Text>
                                    <Text style={styles.dateValue}>{date}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
};

// Helper for rarity colors
const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
        case 'legendary': return '#FFD700'; // Gold
        case 'epic': return '#9333EA';      // Purple
        case 'rare': return '#3B82F6';      // Blue
        case 'uncommon': return '#14b8a6';  // Teal
        case 'common': return '#10B981';    // Green
        default: return '#6B7280';          // Grey
    }
};

const styles = StyleSheet.create({
    cardContainer: {
        // Dimensions set via props
        // shadowColor: BRAND.biolum,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    card: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    // Bubbles
    bubble: {
        position: 'absolute',
        backgroundColor: 'rgba(173, 216, 230, 0.6)',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    // Moon (internal styles mostly replaced by prop scaling but kept for structure)
    moonContainer: {
        width: 80,
        height: 80,
    },
    moon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 2,
    },
    moonGlow: {
        position: 'absolute',
        top: -10,
        right: -10,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    crater: {
        position: 'absolute',
        backgroundColor: 'rgba(200, 200, 200, 0.4)',
        borderRadius: 50,
    },
    cr1: { width: 12, height: 12, top: 15, left: 10 },
    cr2: { width: 18, height: 18, top: 30, left: 28 },
    cr3: { width: 8, height: 8, top: 40, left: 15 },

    // Content
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        zIndex: 20,
    },
    infoBlock: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    rarityBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
        marginBottom: SPACING.sm,
    },
    rarityText: {
        color: '#000',
        fontSize: rf(10),
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    title: {
        color: '#fff',
        fontSize: rf(22),
        fontWeight: '800',
        marginBottom: SPACING.xs,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    description: {
        color: '#cbd5e1',
        fontSize: rf(12),
        marginBottom: SPACING.md,
        lineHeight: rf(18),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    dateLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: rf(10),
        fontWeight: '600',
    },
    dateValue: {
        color: '#fff',
        fontSize: rf(12),
        fontWeight: '600',
    },
    // NEW Badge & Glow
    newOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        padding: 8,
        borderWidth: 2,
        borderColor: '#FFD700', // Gold border for glow effect
        borderRadius: 12,
    },
    newBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    newText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default EarthCard;
