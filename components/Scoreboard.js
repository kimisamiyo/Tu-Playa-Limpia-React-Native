import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { BRAND } from '../constants/theme';
import { rs, rf, SPACING, RADIUS } from '../constants/responsive';
import GlassCard from './premium/GlassCard';

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM SCOREBOARD - Stats display with icons (no emojis)
// ═══════════════════════════════════════════════════════════════════════════

export default function Scoreboard() {
    const { points, nfts, level, scannedItems } = useGame();
    const { colors, shadows, isDark } = useTheme();

    const stats = [
        { label: 'Puntos', value: points, icon: 'star', color: '#fbbf24' },
        { label: 'NFTs', value: nfts.length, icon: 'diamond', color: '#60a5fa' },
        { label: 'Nivel', value: level, icon: 'trophy', color: '#f472b6' },
    ];

    const progressPercent = Math.min((nfts.length / 8) * 100, 100);

    return (
        <Animated.View entering={FadeIn.delay(150)} style={styles.container}>
            <GlassCard variant="elevated" style={styles.card}>
                <View style={styles.statsRow}>
                    {stats.map((stat, index) => (
                        <React.Fragment key={stat.label}>
                            <View style={styles.statItem}>
                                <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
                                    <Ionicons name={stat.icon} size={rs(18)} color={stat.color} />
                                </View>
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {stat.value}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                    {stat.label}
                                </Text>
                            </View>
                            {index < stats.length - 1 && (
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            )}
                        </React.Fragment>
                    ))}
                </View>

                {/* Progress to next level */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Ionicons name="arrow-up-circle" size={rs(14)} color={colors.textMuted} />
                        <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                            Progreso al Nivel {level + 1}
                        </Text>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,58,74,0.08)' }]}>
                        <LinearGradient
                            colors={[BRAND.sandGold, BRAND.goldShimmer || '#FFD700']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${progressPercent}%` }]}
                        />
                    </View>
                    <Text style={[styles.progressText, { color: colors.textMuted }]}>
                        {nfts.length}/8 NFTs recolectados
                    </Text>
                </View>
            </GlassCard>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    card: {
        padding: SPACING.lg,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: rs(36),
        height: rs(36),
        borderRadius: rs(18),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: rs(6),
    },
    statValue: {
        fontSize: rf(22),
        fontWeight: '700',
    },
    statLabel: {
        fontSize: rf(10),
        marginTop: rs(2),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        width: 1,
        height: rs(50),
    },
    progressSection: {
        marginTop: SPACING.lg,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rs(6),
        marginBottom: rs(10),
    },
    progressLabel: {
        fontSize: rf(11),
    },
    progressTrack: {
        height: rs(8),
        borderRadius: rs(4),
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: rs(4),
    },
    progressText: {
        fontSize: rf(10),
        marginTop: rs(8),
        textAlign: 'center',
    },
});
