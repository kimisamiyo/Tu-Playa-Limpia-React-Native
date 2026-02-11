import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Dimensions, Platform, useWindowDimensions, Alert, ActivityIndicator
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
import ConnectWalletScreen from './ConnectWalletScreen';

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
const NFTDetailModal = ({ visible, onClose, nft, onWalletConnected }) => {
    const { colors, shadows, isDark } = useTheme();
    const { t, language } = useLanguage();
    const { address } = useWallet();
    const { markNFTClaimed } = useGame();
    const [claiming, setClaiming] = useState(false);
    const [showConnectWallet, setShowConnectWallet] = useState(false);

    // Reset state when selected NFT changes or modal closes
    useEffect(() => {
        if (!visible || !nft) {
            setClaiming(false);
            setShowConnectWallet(false);
        }
    }, [visible, nft?.id]);

    if (!nft) return null;

    const claimLabels = REWARDS_CLAIM_LABELS[language] || REWARDS_CLAIM_LABELS['es'];

    const handleClaimPress = async () => {
        if (!address) {
            console.log('[NFTDetailModal] No wallet, showing connect screen');
            setShowConnectWallet(true);
            return;
        }

        setClaiming(true);
        try {
            console.log('[NFTDetailModal] Claiming NFT:', nft.id);
            const { handleClaim: claimFn } = await import('../utils/nftGenerator');
            const result = await claimFn();
            console.log('[NFTDetailModal] Claim result:', result);

            if (result?.success) {
                // Mark NFT as claimed in game state
                markNFTClaimed(nft.id);
                
                if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                    t('rewards_claim_success') || 'Success',
                    t('rewards_nft_claimed') || 'NFT claimed successfully!',
                    [{ text: 'OK', onPress: onClose }]
                );
            } else {
                if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert(
                    t('rewards_claim_error') || 'Error',
                    result?.error?.message || t('rewards_claim_failed') || 'Failed to claim NFT'
                );
            }
        } catch (error) {
            console.error('[NFTDetailModal] Claim error:', error);
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
                t('rewards_claim_error') || 'Error',
                error?.message || t('rewards_claim_failed') || 'An unexpected error occurred'
            );
        } finally {
            setClaiming(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={[styles.detailOverlay, { backgroundColor: isDark ? 'rgba(0,18,32,0.95)' : 'rgba(0,0,0,0.85)' }]}>
                <SafeAreaView style={styles.detailSafeArea}>
                    {showConnectWallet ? (
                        <View style={styles.connectWalletContainer}>
                            <TouchableOpacity
                                style={styles.detailClose}
                                onPress={() => setShowConnectWallet(false)}
                            >
                                <Ionicons name="close-circle" size={rs(36)} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <ConnectWalletScreen
                                onSuccess={() => {
                                    console.log('[NFTDetailModal] Wallet connected, auto-claiming...');
                                    setShowConnectWallet(false);
                                    onWalletConnected?.();
                                    setTimeout(() => handleClaimPress(), 500);
                                }}
                            />
                        </View>
                    ) : (
                        <>
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
                                            <Text style={[styles.detailStatLabel, { color: colors.textSecondary }]}>{t('rewards_created')}</Text>
                                            <Text style={[styles.detailStatValue, { color: colors.text }]}>{nft.date}</Text>
                                        </GlassCard>
                                        <GlassCard variant="flat" style={styles.detailStat}>
                                            <Text style={[styles.detailStatLabel, { color: colors.textSecondary }]}>{t('rewards_locked_until')}</Text>
                                            <Text style={[styles.detailStatValue, { color: colors.text }]}>{nft.lockedUntil}</Text>
                                        </GlassCard>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="person-circle" size={rs(18)} color={colors.accent} />
                                        <Text style={[styles.detailOwner, { color: colors.text }]}>
                                            {t('rewards_owner')}: {nft.owner}
                                        </Text>
                                    </View>
                                    {nft.acquisition && (
                                        <View style={[styles.detailRow, { marginTop: SPACING.sm }]}>
                                            <Ionicons name="sparkles" size={rs(16)} color={BRAND.sandGold} />
                                            <Text style={[styles.detailOwner, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                                                {nft.acquisition.includes(':')
                                                    ? `${t(nft.acquisition.split(':')[0])} ${nft.acquisition.split(':')[1]}`
                                                    : t(nft.acquisition)
                                                }
                                            </Text>
                                        </View>
                                    )}

                                    {/* Claim Button */}
                                    <View style={styles.claimSection}>
                                        <TouchableOpacity
                                            style={[
                                                styles.claimButton,
                                                {
                                                    backgroundColor: nft.claimed
                                                        ? colors.textMuted
                                                        : BRAND.oceanMid
                                                }
                                            ]}
                                            onPress={handleClaimPress}
                                            disabled={claiming || nft.claimed}
                                            activeOpacity={0.8}
                                        >
                                            {claiming ? (
                                                <>
                                                    <ActivityIndicator size="small" color="#fff" />
                                                    <Text style={styles.claimButtonText}>{claimLabels.claiming}</Text>
                                                </>
                                            ) : nft.claimed ? (
                                                <>
                                                    <Ionicons name="checkmark-done-circle" size={rs(18)} color="#fff" />
                                                    <Text style={styles.claimButtonText}>{claimLabels.alreadyClaimed}</Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Ionicons name="download" size={rs(18)} color="#fff" />
                                                    <Text style={styles.claimButtonText}>{claimLabels.claim}</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Animated.View>
                        </>
                    )}
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
    const { points, nfts, unlockNFT, markNFTSeen } = useGame();
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
                <GlassCard variant="default" style={{ padding: SPACING.xs }}>
                    <NFTMiniCard 
                        nft={item}
                        size={cardWidth}
                        isNew={item.isNew}
                        onPress={handleNFTPress}
                    />

                    {/* Action Row: Connect / Claim */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs }}>
                        {!address ? (
                            <TouchableOpacity
                                style={{ flex: 1, padding: rs(8), backgroundColor: BRAND.oceanMid, borderRadius: RADIUS.xs, alignItems: 'center', marginRight: rs(6) }}
                                onPress={() => setConnectTarget(item)}
                                activeOpacity={0.85}
                            >
                                <Text style={{ color: '#fff', fontWeight: '700' }}>{t('wallet_connect_short') || 'Conectar'}</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={{ flex: 1, padding: rs(8), backgroundColor: item.claimed ? colors.textMuted : BRAND.oceanMid, borderRadius: RADIUS.xs, alignItems: 'center', marginRight: rs(6) }}
                                onPress={async () => {
                                    if (item.claimed) return;
                                    setClaimingMap(prev => ({ ...prev, [item.id]: true }));
                                    try {
                                        const result = await handleClaim(signer);
                                        if (result?.success) {
                                            markNFTClaimed(item.id);
                                            Alert.alert(t('rewards_claim_success') || 'Success', t('rewards_nft_claimed') || 'NFT claimed successfully!');
                                        } else {
                                            Alert.alert(t('rewards_claim_error') || 'Error', result?.error?.message || t('rewards_claim_failed') || 'Failed to claim NFT');
                                        }
                                    } catch (err) {
                                        console.error('Claim error:', err);
                                        Alert.alert(t('rewards_claim_error') || 'Error', err?.message || 'Error');
                                    } finally {
                                        setClaimingMap(prev => ({ ...prev, [item.id]: false }));
                                    }
                                }}
                                disabled={claimingMap[item.id] || item.claimed}
                                activeOpacity={0.85}
                            >
                                {claimingMap[item.id] ? (
                                    <ActivityIndicator color="#fff" />
                                ) : item.claimed ? (
                                    <Text style={{ color: '#fff', fontWeight: '700' }}>{t('rewards_claimed') || 'Reclamado'}</Text>
                                ) : (
                                    <Text style={{ color: '#fff', fontWeight: '700' }}>{t('rewards_claim_now') || 'Reclamar'}</Text>
                                )}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={{ width: rs(40), height: rs(40), borderRadius: RADIUS.xs, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => handleNFTPress(item)}
                        >
                            <Ionicons name="information-circle" size={rs(20)} color={colors.accent} />
                        </TouchableOpacity>
                    </View>
                </GlassCard>
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
                onWalletConnected={() => console.log('[RewardsScreen] Wallet connected')}
            />
            {/* Connect wallet modal per-card */}
            <Modal visible={!!connectTarget} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(0,18,32,0.95)' : 'rgba(0,0,0,0.6)' }}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <TouchableOpacity style={{ position: 'absolute', top: rs(16), right: rs(16), zIndex: 50 }} onPress={() => setConnectTarget(null)}>
                            <Ionicons name="close-circle" size={rs(36)} color={'#fff'} />
                        </TouchableOpacity>
                        <ConnectWalletScreen onSuccess={() => {
                            // close modal and attempt claim if target exists
                            const target = connectTarget;
                            setConnectTarget(null);
                            setTimeout(async () => {
                                try {
                                    setClaimingMap(prev => ({ ...prev, [target.id]: true }));
                                    const result = await handleClaim(signer);
                                    if (result?.success) {
                                        markNFTClaimed(target.id);
                                        Alert.alert(t('rewards_claim_success') || 'Success', t('rewards_nft_claimed') || 'NFT claimed successfully!');
                                    } else {
                                        Alert.alert(t('rewards_claim_error') || 'Error', result?.error?.message || t('rewards_claim_failed') || 'Failed to claim NFT');
                                    }
                                } catch (err) {
                                    console.error('Auto-claim error after connect:', err);
                                } finally {
                                    setClaimingMap(prev => ({ ...prev, [target.id]: false }));
                                }
                            }, 400);
                        }} />
                    </SafeAreaView>
                </View>
            </Modal>
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
