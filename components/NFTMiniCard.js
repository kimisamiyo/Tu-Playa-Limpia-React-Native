import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSpring,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { BRAND } from '../constants/theme';
import { rs, rf, SPACING, RADIUS } from '../constants/responsive';
import { SPRING } from '../constants/animations';
import { useLanguage } from '../context/LanguageContext';
import GenerativeArt, { generatePatternFromId, NFT_PALETTES } from './GenerativeArt';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const RARITY_CONFIG = {
    'Común': { shimmerSpeed: 4000, borderWidth: 1 },
    'Raro': { shimmerSpeed: 3000, borderWidth: 1.5 },
    'Épico': { shimmerSpeed: 2000, borderWidth: 2 },
    'Legendario': { shimmerSpeed: 1500, borderWidth: 2.5 },
};
export default function NFTMiniCard({ nft, onPress, size = 'default', isNew = false }) {
    const { colors, shadows, isDark } = useTheme();
    const { t } = useLanguage();
    const shimmer = useSharedValue(0);
    const scale = useSharedValue(1);
    const rarityConfig = RARITY_CONFIG[nft?.rarity] || RARITY_CONFIG['Común'];
    const pattern = useMemo(() => generatePatternFromId(nft?.id), [nft?.id]);
    const palette = NFT_PALETTES[pattern.colorVariant];
    useEffect(() => {
        if (isNew) {
            shimmer.value = withRepeat(
                withTiming(1, { duration: rarityConfig.shimmerSpeed, easing: Easing.linear }),
                -1,
                false
            );
        }
    }, [isNew, rarityConfig.shimmerSpeed]);
    const handlePressIn = () => {
        scale.value = withSpring(0.96, SPRING.snappy);
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, SPRING.smooth);
    };
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(nft);
    };
    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    const shimmerStyle = useAnimatedStyle(() => {
        if (!isNew) return { opacity: 0 };
        const translateX = interpolate(shimmer.value, [0, 1], [-100, 100]);
        return {
            transform: [{ translateX }],
            opacity: 0.8,
        };
    });
    const cardWidth = size === 'large' ? rs(150) : rs(105);
    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={[styles.container, { width: cardWidth }, cardStyle]}
        >
            {}
            <View style={[
                styles.cardInner,
                {
                    backgroundColor: isDark ? 'rgba(0,18,32,0.95)' : colors.surface,
                    borderWidth: rarityConfig.borderWidth,
                    borderColor: isDark ? palette.secondary : palette.accent,
                },
                shadows.sm
            ]}>
                {}
                {isNew && (
                    <Animated.View style={[styles.shimmer, shimmerStyle]}>
                        <ExpoGradient
                            colors={['transparent', `${palette.accent}40`, 'transparent']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.shimmerGradient}
                        />
                    </Animated.View>
                )}
                {}
                {isNew && (
                    <View style={[styles.newBadge, { backgroundColor: BRAND.success }]}>
                        <Text style={styles.newBadgeText}>{t('nft_badge_new')}</Text>
                    </View>
                )}
                {}
                <View style={styles.artSection}>
                    <GenerativeArt id={nft?.id} size={cardWidth - rs(8)} isDark={isDark} />
                </View>
                {}
                <View style={[
                    styles.infoSection,
                    { backgroundColor: isDark ? 'rgba(0,18,32,0.9)' : 'rgba(13, 92, 117, 0.1)' }
                ]}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        {nft?.title || 'Eco Guardian'}
                    </Text>
                    <View style={[styles.rarityBadge, { backgroundColor: palette.primary }]}>
                        <Text style={styles.rarityText}>{nft?.rarity || 'Común'}</Text>
                    </View>
                </View>
            </View>
        </AnimatedPressable>
    );
}
const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.sm,
    },
    cardInner: {
        borderRadius: RADIUS.sm,  
        overflow: 'hidden',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: rs(80),
        zIndex: 10,
    },
    shimmerGradient: {
        flex: 1,
    },
    newBadge: {
        position: 'absolute',
        top: rs(4),
        right: rs(4),
        paddingHorizontal: rs(6),
        paddingVertical: rs(2),
        borderRadius: rs(3),
        zIndex: 20,
    },
    newBadgeText: {
        color: '#fff',
        fontSize: rf(8),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    artSection: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: rs(4),
    },
    infoSection: {
        padding: SPACING.xs,
    },
    title: {
        fontSize: rf(10),
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: rs(3),
    },
    rarityBadge: {
        alignSelf: 'center',
        paddingVertical: rs(2),
        paddingHorizontal: rs(6),
        borderRadius: RADIUS.xs,
    },
    rarityText: {
        fontSize: rf(7),
        fontWeight: '700',
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
});
