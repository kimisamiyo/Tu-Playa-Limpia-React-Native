import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Dimensions, Platform, useWindowDimensions, Alert, Image, Linking, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInDown, FadeInUp,
    useSharedValue, useAnimatedStyle,
    withRepeat, withTiming, withSequence, withDelay,
    Easing,
} from 'react-native-reanimated';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import translations, { REWARDS_CLAIM_LABELS } from '../constants/translations';
import { useWallet } from '../context/WalletContext';
import { handleClaim } from '../utils/nftGenerator';
import { BRAND, GRADIENTS } from '../constants/theme';
import { rs, rf, rh, SPACING, RADIUS, SCREEN } from '../constants/responsive';
import NFTMiniCard from '../components/NFTMiniCard';
import LivingWater from '../components/LivingWater';
import Scoreboard from '../components/Scoreboard';
import FloatingBubbles from '../components/premium/FloatingBubbles';
import GlassCard from '../components/premium/GlassCard';
import AnimatedButton from '../components/premium/AnimatedButton';
import EarthCard from '../components/premium/EarthCard';

// ═══════════════════════════════════════════════════════════════════════════
// CELEBRATION MODAL
// ═══════════════════════════════════════════════════════════════════════════
const CelebrationModal = ({ visible, onClose, nft }) => {
    const { colors, shadows, isDark } = useTheme();
    const { t, language } = useLanguage();
    if (!nft) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.celebrationOverlay}>
                <Animated.View
                    entering={FadeInUp.springify()}
                    style={[styles.celebrationContent, { backgroundColor: colors.surface }, shadows.xl]}
                >
                    <LinearGradient
                        colors={[BRAND.sandGold, '#fbbf24']}
                        style={styles.celebrationIconBg}
                    >
                        <Ionicons name="sparkles" size={rs(36)} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.celebrationTitle, { color: colors.text }]}>
                        {t('rewards_nft_unlocked')}
                    </Text>
                    <Text style={[styles.celebrationSubtitle, { color: colors.textSecondary }]}>
                        {t('rewards_nft_redeemed')}
                    </Text>
                    <View style={styles.celebrationNFT}>
                        <NFTMiniCard nft={nft} size="large" />
                    </View>
                    <AnimatedButton
                        title={t('rewards_continue')}
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
const NFTDetailModal = ({ visible, onClose, nft, onClaim }) => {
    const { colors, shadows, isDark } = useTheme();
    const { t } = useLanguage();
    const [claiming, setClaiming] = useState(false);

    if (!nft) return null;

    const handleClaimPress = async (walletType = 'any') => {
        if (nft.claimed || claiming) return;
        setClaiming(true);
        try {
            await onClaim(nft, walletType);
        } catch (error) {
            console.error(error);
        } finally {
            setClaiming(false);
        }
    };

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
                            <Text style={[styles.detailTitle, { color: '#ffffff' }]}>{nft.title}</Text>
                            <View style={styles.detailRow}>
                                <Ionicons name="finger-print" size={rs(16)} color={colors.textMuted} />
                                <Text style={[styles.detailHash, { color: 'rgba(255,255,255,0.6)' }]} numberOfLines={1}>
                                    {nft.hash?.slice(0, 18)}...{nft.hash?.slice(-8)}
                                </Text>
                            </View>
                            <View style={styles.detailStats}>
                                <GlassCard variant="flat" style={styles.detailStat}>
                                    <Text style={[styles.detailStatLabel, { color: 'rgba(255,255,255,0.7)' }]}>{t('rewards_created')}</Text>
                                    <Text style={[styles.detailStatValue, { color: '#ffffff' }]}>{nft.date}</Text>
                                </GlassCard>
                                <GlassCard variant="flat" style={styles.detailStat}>
                                    <Text style={[styles.detailStatLabel, { color: 'rgba(255,255,255,0.7)' }]}>{t('rewards_locked_until')}</Text>
                                    <Text style={[styles.detailStatValue, { color: '#ffffff' }]}>{nft.lockedUntil}</Text>
                                </GlassCard>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="person-circle" size={rs(18)} color={colors.accent} />
                                <Text style={[styles.detailOwner, { color: '#ffffff' }]}>
                                    {t('rewards_owner')}: {nft.owner}
                                </Text>
                            </View>
                            {nft.acquisition && (
                                <View style={[styles.detailRow, { marginTop: SPACING.sm }]}>
                                    <Ionicons name="sparkles" size={rs(16)} color={BRAND.sandGold} />
                                    <Text style={[styles.detailOwner, { color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }]}>
                                        {nft.acquisition.includes(':')
                                            ? `${t(nft.acquisition.split(':')[0])} ${nft.acquisition.split(':')[1]}`
                                            : t(nft.acquisition)
                                        }
                                    </Text>
                                </View>
                            )}

                            <View style={{ marginTop: SPACING.xl, width: '100%', gap: SPACING.md }}>
                                {/* Pali Option (Primary) */}
                                <AnimatedButton
                                    title={nft.claimed ? t('rewards_claimed') : t('rewards_claim_pali')}
                                    onPress={() => handleClaimPress('pali')}
                                    variant="primary"
                                    icon={
                                        <Image
                                            source={require('../assets/logo-pali.png')}
                                            style={{ width: rs(32), height: rs(32), marginRight: rs(8) }}
                                            resizeMode="contain"
                                        />
                                    }
                                    disabled={nft.claimed || claiming}
                                    fullWidth
                                    style={{ justifyContent: 'center', alignItems: 'center' }}
                                />
                            </View>
                        </View>
                    </Animated.View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM "COMING SOON" PLACEHOLDER — Animated & Smooth
// Replaces the old redeem section with a beautiful blockchain-themed banner
// ═══════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════
// MAIN REWARDS SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export default function RewardsScreen() {
    const { points, nfts, unlockNFT, markNFTSeen, claimNFT } = useGame();
    const { colors, shadows, isDark } = useTheme();
    const { t } = useLanguage();
    const { address, signer, setProvider, setSigner, setAddress } = useWallet();
    const [showCelebration, setShowCelebration] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [lastUnlockedNFT, setLastUnlockedNFT] = useState(null);
    const [connectTarget, setConnectTarget] = useState(null);
    const [claimingMap, setClaimingMap] = useState({});

    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    const handleNFTPress = (nft) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (nft.isNew) {
            markNFTSeen(nft.id);
        }
        setSelectedNFT(nft);
        setShowDetail(true);
    };

    const numColumns = isDesktop ? 6 : 3;
    const cardGap = SPACING.sm;

    // Calculate width
    // Desktop: Screen - Sidebar (250) - Padding (2*24) - Gaps
    // Mobile: Screen - Padding (2*24) - Gaps
    const sidebarOffset = isDesktop ? 250 : 0;
    const availableWidth = width - sidebarOffset - (SPACING.lg * 2) - (cardGap * (numColumns - 1));
    const cardWidth = availableWidth / numColumns;
    const cardHeight = cardWidth * 1.4;

    const renderNFT = useCallback(({ item, index }) => {
        const isNew = lastUnlockedNFT?.id === item.id;
        return (
            <Animated.View
                entering={FadeInUp.delay(index * 60).springify()}
                style={{
                    marginBottom: cardGap,
                    width: cardWidth,
                }}
            >
                <TouchableOpacity onPress={() => handleNFTPress(item)} activeOpacity={0.9}>
                    <EarthCard
                        title={item.title}
                        rarity={item.rarity}
                        // Description and date are hidden in compact mode within EarthCard but passed anyway
                        description={item.description}
                        date={item.date}
                        attributes={item.attributes}
                        id={item.id} // Pass ID for consistent art generation
                        image={item.image}
                        width={cardWidth}
                        height={cardHeight}
                        compact={true}
                        isNew={item.isNew}
                        onPress={handleNFTPress}
                    />
                </TouchableOpacity>
            </Animated.View>
        );
    }, [lastUnlockedNFT, cardWidth, address, claimingMap, t, colors, signer]);

    const ListHeader = () => (
        <>
            {/* Header */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('rewards_title')}</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {nfts.length} {t('rewards_collection_count')}
                </Text>
            </Animated.View>

            {/* Scoreboard */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
                <Scoreboard />
            </Animated.View>

            {/* Collection Title */}
            {nfts.length > 0 && (
                <Animated.View entering={FadeInUp.delay(400).springify()}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('rewards_your_collection')}</Text>
                </Animated.View>
            )}
        </>
    );

    const EmptyState = () => (
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.emptyContainer}>
            <GlassCard variant="flat" style={styles.emptyCard}>
                <Ionicons name="diamond-outline" size={rs(48)} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('rewards_no_nfts')}</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {t('rewards_no_nfts_desc')}
                </Text>
            </GlassCard>
        </Animated.View>
    );

    const handleClaimNFT = async (nft, walletType = 'any') => {
        try {
            if (!nft) return;

            console.log(`🚀 Claim iniciado (${walletType}) para missionId:`, nft.id);

            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: la transacción tardó demasiado')), 120000)
            );

            const result = await Promise.race([
                handleClaim(nft.id, walletType), // ⬅️ Deja que handleClaim obtenga la cuenta activa directamente
                timeout
            ]);

            console.log("Resultado del claim:", result);

            if (result?.success) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                claimNFT(nft.id);

                Alert.alert(
                    t('rewards_success') || 'NFT minteado 🎉',
                    t('rewards_success_desc') || 'Tu NFT fue enviado a tu wallet'
                );
            } else {
                throw result?.error || new Error('Error desconocido');
            }

        } catch (err) {

            console.error("Error en handleClaimNFT:", err);

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                'Error',
                err?.message || 'No se pudo mintear el NFT'
            );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {isDark && (
                <LinearGradient
                    colors={[BRAND.oceanDeep, BRAND.oceanDark]}
                    style={StyleSheet.absoluteFill}
                />
            )}
            <FloatingBubbles count={10} minSize={4} maxSize={14} zIndex={0} />
            <View style={styles.bgWater}><LivingWater /></View>

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <FlatList
                    key={numColumns}
                    data={nfts}
                    renderItem={renderNFT}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={EmptyState}
                    columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>

            <CelebrationModal
                visible={showCelebration}
                onClose={() => setShowCelebration(false)}
                nft={lastUnlockedNFT}
            />
            <NFTDetailModal
                visible={showDetail}
                onClose={() => setShowDetail(false)}
                nft={selectedNFT}
                onClaim={handleClaimNFT}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgWater: { ...StyleSheet.absoluteFillObject, opacity: 0.2 },
    safeArea: { flex: 1 },
    listContent: { padding: SPACING.lg, paddingBottom: rh(120) },
    row: { justifyContent: 'flex-start', gap: SPACING.sm }, // Changed to flex-start with gap for equal spacing

    // Header
    header: { marginBottom: SPACING.lg },
    headerTitle: { fontSize: rf(26), fontWeight: '700' },
    headerSubtitle: { fontSize: rf(14), marginTop: rs(4) },

    // Section
    sectionTitle: { fontSize: rf(18), fontWeight: '700', marginBottom: SPACING.md },

    // ═══ COMING SOON Styles ═══


    // Empty State
    emptyContainer: { marginTop: SPACING.xl },
    emptyCard: { alignItems: 'center', padding: SPACING.xl },
    emptyTitle: { fontSize: rf(18), fontWeight: '700', marginTop: SPACING.md },
    emptyText: { fontSize: rf(13), textAlign: 'center', marginTop: SPACING.sm, lineHeight: rf(20) },

    // Celebration Modal
    celebrationOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
    celebrationContent: { width: '100%', maxWidth: rs(340), borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center' },
    celebrationIconBg: { width: rs(72), height: rs(72), borderRadius: rs(36), justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
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
    detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md, gap: SPACING.xs },
    detailHash: { fontSize: rf(11), fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    detailStats: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
    detailStat: { flex: 1, padding: SPACING.md, alignItems: 'center' },
    detailStatLabel: { fontSize: rf(10), textTransform: 'uppercase', letterSpacing: 0.5 },
    detailStatValue: { fontSize: rf(14), fontWeight: '600', marginTop: rs(4) },
    detailOwner: { fontSize: rf(14), fontWeight: '600' },

    // Claim Section
    claimSection: { marginTop: SPACING.lg, alignItems: 'center', width: '100%', gap: SPACING.md },
    walletWarning: { width: '100%', borderRadius: RADIUS.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    walletWarningText: { fontSize: rf(13), fontWeight: '600', flex: 1 },
    claimButton: { width: '100%', borderRadius: RADIUS.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
    claimButtonText: { fontSize: rf(14), fontWeight: '700', color: '#fff' },
    connectWalletContainer: { flex: 1, width: '100%' },
});
