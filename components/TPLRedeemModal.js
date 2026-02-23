import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { rs, rf, SPACING, RADIUS } from '../constants/responsive';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import GlassCard from './premium/GlassCard';
import TPLTitle from './premium/TPLTitle';
import AnimatedButton from './premium/AnimatedButton';

const TITLES_CONFIG = [
    {
        id: 'legend',
        name: 'Golden Eco Legend',
        min: 300,
        color: '#FFD700',
        desc: 'La leyenda definitiva de la conservación costera.',
    },
    {
        id: 'protector',
        name: 'Ocean Protector',
        min: 100,
        color: '#00FFFF',
        desc: 'Un protector incansable de los ecosistemas marinos.',
    },
    {
        id: 'guardian',
        name: 'Beach Guardian',
        min: 50,
        color: '#F4A460',
        desc: 'Vigilante ejemplar de nuestras playas.',
    },
    {
        id: 'collector',
        name: 'Collector Starter',
        min: 5,
        color: '#32CD32', // Lime Green
        desc: 'Comenzando a coleccionar actos de impacto positivo.',
    },
    {
        id: 'rookie',
        name: 'Cleanup Rookie',
        min: 0,
        color: '#A9A9A9',
        desc: 'Iniciando el camino hacia un planeta más limpio.',
    }
];

const TPLRedeemModal = ({ visible, onClose, points, currentTitle, onUpdateTitle }) => {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)' }]} />

                <SafeAreaView style={styles.container}>
                    <Animated.View
                        entering={FadeInDown.springify()}
                        style={[styles.modalContent, { backgroundColor: isDark ? 'rgba(10, 25, 41, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.text }]}>{t('home_redeem_tpl')}</Text>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={rs(28)} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.pointsDisplay}>
                            <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>TUS PUNTOS ACTUALES</Text>
                            <Text style={[styles.pointsValue, { color: colors.primary }]}>{points} TPL</Text>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                        >
                            {TITLES_CONFIG.map((config, index) => {
                                const isUnlocked = points >= config.min;
                                const isActive = currentTitle === config.name;

                                return (
                                    <Animated.View
                                        key={config.id}
                                        entering={FadeInDown.delay(index * 100).springify()}
                                        layout={Layout.springify()}
                                    >
                                        <GlassCard
                                            variant={isActive ? 'elevated' : 'bordered'}
                                            style={[
                                                styles.card,
                                                isActive && { borderColor: config.color, borderWidth: 2 }
                                            ]}
                                        >
                                            <View style={styles.cardHeader}>
                                                <TPLTitle title={config.name} size="lg" />
                                                {!isUnlocked && (
                                                    <View style={styles.lockBadge}>
                                                        <Ionicons name="lock-closed" size={rs(14)} color="#fff" />
                                                        <Text style={styles.lockText}>{config.min} TPL</Text>
                                                    </View>
                                                )}
                                                {isActive && (
                                                    <View style={[styles.activeBadge, { backgroundColor: config.color }]}>
                                                        <Text style={styles.activeText}>ACTIVO</Text>
                                                    </View>
                                                )}
                                            </View>

                                            <Text style={[styles.description, { color: colors.textSecondary }]}>
                                                {config.desc}
                                            </Text>

                                            {isUnlocked && !isActive && (
                                                <TouchableOpacity
                                                    style={[styles.claimButton, { backgroundColor: config.color }]}
                                                    onPress={() => onUpdateTitle(config.name)}
                                                >
                                                    <Text style={styles.claimButtonText}>EQUIPAR TÍTULO</Text>
                                                </TouchableOpacity>
                                            )}
                                        </GlassCard>
                                    </Animated.View>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.footer}>
                            <AnimatedButton
                                title="CERRAR"
                                onPress={onClose}
                                variant="secondary"
                                fullWidth
                            />
                        </View>
                    </Animated.View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    modalContent: {
        maxHeight: '85%',
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: rf(22),
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    pointsDisplay: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.xl,
    },
    pointsLabel: {
        fontSize: rf(11),
        fontWeight: '700',
        letterSpacing: 1,
    },
    pointsValue: {
        fontSize: rf(28),
        fontWeight: '900',
    },
    list: {
        paddingBottom: SPACING.xl,
    },
    card: {
        marginBottom: SPACING.md,
        padding: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    lockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: rs(10),
        paddingVertical: rs(4),
        borderRadius: rs(12),
        gap: rs(4),
    },
    lockText: {
        color: '#fff',
        fontSize: rf(11),
        fontWeight: '700',
    },
    activeBadge: {
        paddingHorizontal: rs(10),
        paddingVertical: rs(4),
        borderRadius: rs(12),
    },
    activeText: {
        color: '#000',
        fontSize: rf(10),
        fontWeight: '900',
    },
    description: {
        fontSize: rf(13),
        lineHeight: rf(18),
        marginBottom: SPACING.md,
    },
    claimButton: {
        paddingVertical: rs(10),
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    claimButtonText: {
        color: '#000',
        fontSize: rf(12),
        fontWeight: '800',
    },
    footer: {
        marginTop: SPACING.lg,
    }
});

export default TPLRedeemModal;
