import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { BRAND } from '../constants/theme';
import { rs, rf, rh, SPACING, RADIUS, SCREEN } from '../constants/responsive';
import { SPRING } from '../constants/animations';
import LivingWater from '../components/LivingWater';
import FloatingBubbles from '../components/premium/FloatingBubbles';
import AstronautCard from '../components/premium/AstronautCard';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PROMOTIONS = [
    {
        id: 1,
        titleKey: 'promo_eco_title',
        descKey: 'promo_eco_desc',
        discount: '20%',
        validUntil: '31/03/2026',
        partner: 'EcoStore',
        icon: 'leaf',
        gradient: ['#134e5e', '#71b280'],
    },
    {
        id: 2,
        titleKey: 'promo_clean_title',
        descKey: 'promo_clean_desc',
        discountKey: 'promo_free',
        validUntil: '15/02/2026',
        partner: 'Clean Ocean Co.',
        icon: 'water',
        gradient: ['#0f2027', '#203a43', '#2c5364'],
    },
    {
        id: 3,
        titleKey: 'promo_snorkel_title',
        descKey: 'promo_snorkel_desc',
        discount: '2x1',
        validUntil: '28/02/2026',
        partner: 'AquaAdventures',
        icon: 'fish',
        gradient: ['#1a2a6c', '#4b79a1'],
    },
    {
        id: 4,
        titleKey: 'promo_coffee_title',
        descKey: 'promo_coffee_desc',
        discountKey: 'promo_free',
        validUntil: '30/04/2026',
        partner: 'Green Café',
        icon: 'cafe',
        gradient: ['#3a1c71', '#d76d77'],
    },
];
const PromotionCard = ({ promo, index, t }) => {
    const { colors, shadows } = useTheme();
    const scale = useSharedValue(1);
    const handlePressIn = () => {
        scale.value = withSpring(0.97, SPRING.snappy);
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, SPRING.smooth);
    };
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };
    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={cardStyle}
        >
            <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
                <LinearGradient
                    colors={promo.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.promoCard, shadows.lg]}
                >
                    {}
                    <View style={styles.cardShine} />
                    {}
                    <View style={styles.iconContainer}>
                        <Ionicons name={`${promo.icon}-outline`} size={rs(40)} color="rgba(255,255,255,0.9)" />
                    </View>
                    {}
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                            {promo.discountKey ? t(promo.discountKey) : promo.discount}
                        </Text>
                    </View>
                    {}
                    <View style={styles.promoContent}>
                        <Text style={styles.partnerName}>{promo.partner}</Text>
                        <Text style={styles.promoTitle}>{t(promo.titleKey)}</Text>
                        <Text style={styles.promoDesc}>{t(promo.descKey)}</Text>
                        <View style={styles.validRow}>
                            <Ionicons name="calendar-outline" size={rs(12)} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.validUntil}>{promo.validUntil}</Text>
                        </View>
                    </View>
                    {}
                    <TouchableOpacity style={styles.useButton} activeOpacity={0.8}>
                        <Text style={styles.useButtonText}>{t('promos_redeem')}</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </AnimatedPressable>
    );
};
export default function PromotionsScreen() {
    const { user, level, nfts } = useGame();
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {}
            {isDark && (
                <LinearGradient
                    colors={[BRAND.oceanDeep, BRAND.oceanDark]}
                    style={StyleSheet.absoluteFill}
                />
            )}
            {isDark && <FloatingBubbles count={6} minSize={4} maxSize={12} />}
            <View style={styles.bgWater}>
                <LivingWater />
            </View>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {}
                    <Animated.View entering={FadeInDown.delay(100).springify()}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            {t('promos_title')}
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                            {t('promos_exclusive')} {level}+ {t('promos_with_nfts')} {nfts.length} NFTs
                        </Text>
                    </Animated.View>
                    {}
                    {level >= 2 ? (
                        <View style={{ paddingVertical: SPACING.xl }}>
                            <AstronautCard />
                        </View>
                    ) : (
                        <View style={styles.promosList}>
                            {PROMOTIONS.map((promo, index) => (
                                <PromotionCard key={promo.id} promo={promo} index={index} t={t} />
                            ))}
                        </View>
                    )}
                    {}
                    <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.footer}>
                        <Ionicons name="information-circle-outline" size={rs(16)} color={colors.textMuted} />
                        <Text style={[styles.footerText, { color: colors.textMuted }]}>
                            {t('promos_footer')}
                        </Text>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1 },
    bgWater: { ...StyleSheet.absoluteFillObject, opacity: 0.2 },
    safeArea: { flex: 1 },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: rh(120),
    },
    headerTitle: {
        fontSize: rf(26),
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: rf(14),
        marginTop: rs(4),
        marginBottom: SPACING.lg,
    },
    promosList: {
        gap: SPACING.md,
    },
    promoCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        overflow: 'hidden',
        minHeight: rh(160),
    },
    cardShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        position: 'absolute',
        top: SPACING.lg,
        right: SPACING.lg,
        opacity: 0.3,
    },
    discountBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: rs(6),
        paddingHorizontal: rs(14),
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
    },
    discountText: {
        color: '#fff',
        fontSize: rf(14),
        fontWeight: '800',
    },
    promoContent: {
        flex: 1,
    },
    partnerName: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: rf(11),
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: rs(4),
    },
    promoTitle: {
        color: '#fff',
        fontSize: rf(18),
        fontWeight: '700',
        marginBottom: rs(4),
    },
    promoDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: rf(13),
        marginBottom: SPACING.sm,
    },
    validRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(4),
    },
    validUntil: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: rf(11),
    },
    useButton: {
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: rs(8),
        paddingHorizontal: rs(20),
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    useButtonText: {
        color: '#fff',
        fontSize: rf(12),
        fontWeight: '700',
        letterSpacing: 1,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.xl,
        gap: SPACING.xs,
    },
    footerText: {
        fontSize: rf(11),
        textAlign: 'center',
    },
});
