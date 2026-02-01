import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Dimensions, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { BRAND, GRADIENTS } from '../constants/theme';
import { rs, rf, rh, SPACING, RADIUS, SCREEN } from '../constants/responsive';
import NFTMiniCard from '../components/NFTMiniCard';
import LivingWater from '../components/LivingWater';
import Scoreboard from '../components/Scoreboard';
import FloatingBubbles from '../components/premium/FloatingBubbles';
import GlassCard from '../components/premium/GlassCard';
import AnimatedButton from '../components/premium/AnimatedButton';

// ═══════════════════════════════════════════════════════════════════════════
// CELEBRATION MODAL (No emojis - using icons)
// ═══════════════════════════════════════════════════════════════════════════
const CelebrationModal = ({ visible, onClose, nft }) => {
    const { colors, shadows, isDark } = useTheme();

    if (!nft) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.celebrationOverlay}>
                <Animated.View
                    entering={FadeInUp.springify()}
                    style={[styles.celebrationContent, { backgroundColor: colors.surface }, shadows.xl]}
                >
                    {/* Icon badge instead of emoji */}
                    <LinearGradient
                        colors={[BRAND.sandGold, '#fbbf24']}
                        style={styles.celebrationIconBg}
                    >
                        <Ionicons name="sparkles" size={rs(36)} color="#fff" />
                    </LinearGradient>

                    <Text style={[styles.celebrationTitle, { color: colors.text }]}>
                        ¡Nuevo NFT Desbloqueado!
                    </Text>
                    <Text style={[styles.celebrationSubtitle, { color: colors.textSecondary }]}>
                        Has canjeado tu recompensa ecológica
                    </Text>
                    <View style={styles.celebrationNFT}>
                        <NFTMiniCard nft={nft} size="large" />
                    </View>
                    <AnimatedButton
                        title="Continuar"
                        onPress={onClose}
                        variant="primary"
                        fullWidth
                    />
                </Animated.View>
            </View>
        </Modal>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// NFT DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════
const NFTDetailModal = ({ visible, onClose, nft }) => {
    const { colors, shadows, isDark } = useTheme();

    if (!nft) return null;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={[styles.detailOverlay, { backgroundColor: isDark ? 'rgba(0,18,32,0.95)' : 'rgba(0,0,0,0.85)' }]}>
                <SafeAreaView style={styles.detailSafeArea}>
                    <TouchableOpacity style={styles.detailClose} onPress={onClose}>
                        <Ionicons name="close-circle" size={rs(36)} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.detailContent}>
                        <NFTMiniCard nft={nft} size="large" static />

                        <View style={styles.detailInfo}>
                            <Text style={[styles.detailTitle, { color: colors.text }]}>{nft.title}</Text>

                            <View style={styles.detailRow}>
                                <Ionicons name="finger-print" size={rs(16)} color={colors.textMuted} />
                                <Text style={[styles.detailHash, { color: colors.textMuted }]} numberOfLines={1}>
                                    {nft.hash?.slice(0, 18)}...{nft.hash?.slice(-8)}
                                </Text>
                            </View>

                            <View style={styles.detailStats}>
                                <GlassCard variant="flat" style={styles.detailStat}>
                                    <Text style={[styles.detailStatLabel, { color: colors.textSecondary }]}>Creado</Text>
                                    <Text style={[styles.detailStatValue, { color: colors.text }]}>{nft.date}</Text>
                                </GlassCard>
                                <GlassCard variant="flat" style={styles.detailStat}>
                                    <Text style={[styles.detailStatLabel, { color: colors.textSecondary }]}>Bloqueado hasta</Text>
                                    <Text style={[styles.detailStatValue, { color: colors.text }]}>{nft.lockedUntil}</Text>
                                </GlassCard>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="person-circle" size={rs(18)} color={colors.accent} />
                                <Text style={[styles.detailOwner, { color: colors.text }]}>
                                    Propietario: {nft.owner}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN REWARDS SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export default function RewardsScreen() {
    const { points, nfts, unlockNFT } = useGame();
    const { colors, shadows, isDark } = useTheme();
    const [showCelebration, setShowCelebration] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [lastUnlockedNFT, setLastUnlockedNFT] = useState(null);

    const REDEEM_COST = 50;
    const canRedeem = points >= REDEEM_COST;

    const handleRedeem = () => {
        if (!canRedeem) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const newNFT = {
            title: `Eco Guardian #${nfts.length + 1}`,
            rarity: ['Común', 'Raro', 'Épico'][Math.floor(Math.random() * 3)],
        };

        unlockNFT(newNFT);
        setLastUnlockedNFT({ ...newNFT, id: Date.now().toString() });
        setShowCelebration(true);
    };

    const handleNFTPress = (nft) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedNFT(nft);
        setShowDetail(true);
    };

    // Responsive grid - dynamic columns based on screen width
    const getNumColumns = () => {
        if (SCREEN.width >= 1024) return 6;      // Large tablet
        if (SCREEN.width >= 768) return 5;       // Tablet
        if (SCREEN.width >= 600) return 4;       // Large phone/small tablet
        return 3;                                 // Phone
    };
    const numColumns = getNumColumns();
    const cardGap = SPACING.sm;
    const cardWidth = (SCREEN.width - SPACING.lg * 2 - cardGap * (numColumns - 1)) / numColumns;

    const renderNFT = useCallback(({ item, index }) => {
        // Check if this NFT is the newly unlocked one
        const isNew = lastUnlockedNFT?.id === item.id;

        return (
            <Animated.View
                entering={FadeInUp.delay(index * 60).springify()}
                style={{
                    width: cardWidth,
                    marginBottom: cardGap,
                    marginRight: (index + 1) % numColumns === 0 ? 0 : cardGap,
                }}
            >
                <NFTMiniCard
                    nft={item}
                    onPress={() => handleNFTPress(item)}
                    isNew={isNew}
                />
            </Animated.View>
        );
    }, [cardWidth, lastUnlockedNFT]);

    const ListHeader = () => (
        <>
            {/* Header */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Mis Recompensas</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {nfts.length} NFTs en tu colección
                </Text>
            </Animated.View>

            {/* Scoreboard */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
                <Scoreboard />
            </Animated.View>

            {/* Redeem Section */}
            <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.redeemSection}>
                <GlassCard variant="elevated" style={styles.redeemCard}>
                    <View style={styles.redeemRow}>
                        <View>
                            <Text style={[styles.redeemTitle, { color: colors.text }]}>Canjear NFT</Text>
                            <Text style={[styles.redeemCost, { color: colors.textSecondary }]}>
                                Costo: {REDEEM_COST} puntos
                            </Text>
                        </View>
                        <AnimatedButton
                            title="Canjear"
                            onPress={handleRedeem}
                            variant={canRedeem ? 'primary' : 'ghost'}
                            disabled={!canRedeem}
                            size="sm"
                            icon={<Ionicons name="diamond-outline" size={rs(16)} color="#fff" />}
                        />
                    </View>
                    {!canRedeem && (
                        <Text style={[styles.redeemHint, { color: colors.textMuted }]}>
                            Necesitas {REDEEM_COST - points} puntos más
                        </Text>
                    )}
                </GlassCard>
            </Animated.View>

            {/* Collection Title */}
            {nfts.length > 0 && (
                <Animated.View entering={FadeInUp.delay(400).springify()}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Tu Colección</Text>
                </Animated.View>
            )}
        </>
    );

    const EmptyState = () => (
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.emptyContainer}>
            <GlassCard variant="flat" style={styles.emptyCard}>
                <Ionicons name="diamond-outline" size={rs(48)} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin NFTs aún</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Escanea basura y acumula puntos para desbloquear tus primeros NFTs ecológicos
                </Text>
            </GlassCard>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Background */}
            {isDark && (
                <LinearGradient
                    colors={[BRAND.oceanDeep, BRAND.oceanDark]}
                    style={StyleSheet.absoluteFill}
                />
            )}
            {/* Bubbles - both modes */}
            <FloatingBubbles count={10} minSize={4} maxSize={14} zIndex={0} />
            <View style={styles.bgWater}><LivingWater /></View>

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <FlatList
                    data={nfts}
                    renderItem={renderNFT}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={EmptyState}
                    columnWrapperStyle={nfts.length > 0 ? styles.row : undefined}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>

            {/* Modals */}
            <CelebrationModal
                visible={showCelebration}
                onClose={() => setShowCelebration(false)}
                nft={lastUnlockedNFT}
            />
            <NFTDetailModal
                visible={showDetail}
                onClose={() => setShowDetail(false)}
                nft={selectedNFT}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgWater: { ...StyleSheet.absoluteFillObject, opacity: 0.2 },
    safeArea: { flex: 1 },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: rh(120),
    },
    row: { justifyContent: 'space-between' },

    // Header
    header: { marginBottom: SPACING.lg },
    headerTitle: { fontSize: rf(26), fontWeight: '700' },
    headerSubtitle: { fontSize: rf(14), marginTop: rs(4) },

    // Redeem
    redeemSection: { marginBottom: SPACING.xl },
    redeemCard: { padding: SPACING.lg },
    redeemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    redeemTitle: { fontSize: rf(16), fontWeight: '700' },
    redeemCost: { fontSize: rf(12), marginTop: rs(2) },
    redeemHint: { fontSize: rf(11), marginTop: SPACING.sm },

    // Section
    sectionTitle: {
        fontSize: rf(18),
        fontWeight: '700',
        marginBottom: SPACING.md,
    },

    // Empty State
    emptyContainer: { marginTop: SPACING.xl },
    emptyCard: { alignItems: 'center', padding: SPACING.xl },
    emptyTitle: { fontSize: rf(18), fontWeight: '700', marginTop: SPACING.md },
    emptyText: { fontSize: rf(13), textAlign: 'center', marginTop: SPACING.sm, lineHeight: rf(20) },

    // Celebration Modal
    celebrationOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    celebrationContent: {
        width: '100%',
        maxWidth: rs(340),
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
    },
    celebrationIconBg: {
        width: rs(72),
        height: rs(72),
        borderRadius: rs(36),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    celebrationTitle: { fontSize: rf(22), fontWeight: '700', textAlign: 'center' },
    celebrationSubtitle: { fontSize: rf(14), textAlign: 'center', marginTop: SPACING.xs },
    celebrationNFT: { marginVertical: SPACING.xl },

    // Detail Modal
    detailOverlay: { flex: 1 },
    detailSafeArea: { flex: 1 },
    detailClose: { alignSelf: 'flex-end', padding: SPACING.md },
    detailContent: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.xl },
    detailInfo: { marginTop: SPACING.xl, width: '100%' },
    detailTitle: { fontSize: rf(24), fontWeight: '700', textAlign: 'center' },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.md,
        gap: SPACING.xs,
    },
    detailHash: { fontSize: rf(11), fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    detailStats: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
    detailStat: { flex: 1, padding: SPACING.md, alignItems: 'center' },
    detailStatLabel: { fontSize: rf(10), textTransform: 'uppercase', letterSpacing: 0.5 },
    detailStatValue: { fontSize: rf(14), fontWeight: '600', marginTop: rs(4) },
    detailOwner: { fontSize: rf(14), fontWeight: '600' },
});
