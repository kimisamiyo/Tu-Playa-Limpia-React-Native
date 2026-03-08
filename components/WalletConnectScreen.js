import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions, Image, Modal, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { rs, rf, rh, SPACING, RADIUS } from '../constants/responsive';
import { SPRING } from '../constants/animations';
import { BRAND } from '../constants/theme';
import LivingWater from './LivingWater';
import FloatingBubbles from './premium/FloatingBubbles';
import GlassCard from './premium/GlassCard';
import AnimatedButton from './premium/AnimatedButton';
import ScalePressable from './ScalePressable';
import FlagIcon from './FlagIcon';

export default function WalletConnectScreen({ onComplete }) {
    const { colors, isDark } = useTheme();
    const { connectMetaMask, connectPali, address, setHasSkippedConnection } = useWallet();
    const { t, language, setLanguage, LANGUAGES, LANGUAGE_LABELS } = useLanguage();
    const { height: winH } = useWindowDimensions();

    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const contentOpacity = useSharedValue(0);
    const contentY = useSharedValue(rs(30));

    // Entrance animation
    useEffect(() => {
        contentOpacity.value = withTiming(1, { duration: 600 });
        contentY.value = withSpring(0, SPRING.smooth);
    }, []);

    // If connected successfully, move to main app
    useEffect(() => {
        if (address) {
            handleComplete();
        }
    }, [address]);

    const handleComplete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete();
    };

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setHasSkippedConnection(true);
        handleComplete();
    };

    const handleConnectMetamask = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await connectMetaMask();
    };

    const handleConnectPali = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await connectPali();
    };

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentY.value }],
    }));

    const renderLangSelector = () => (
        <View style={styles.langSelectorContainer}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowLangDropdown(true); }}
                style={[styles.langButton, { backgroundColor: isDark ? 'rgba(0,18,32,0.6)' : 'rgba(255,255,255,0.6)', borderColor: colors.border }]}
            >
                <Text style={{ color: colors.textSecondary, fontSize: rf(12), marginRight: rs(4) }}>{t('profile_language') || 'Selecciona idioma:'}</Text>
                <FlagIcon code={LANGUAGE_LABELS[language]?.code} size={0.7} style={{ marginRight: rs(4) }} />
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: rf(12) }}>
                    {language.toUpperCase()}
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginLeft: rs(4) }} />
            </TouchableOpacity>

            <Modal visible={showLangDropdown} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLangDropdown(false)}>
                    <View style={[styles.langDropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.langMenuTitle, { color: colors.textSecondary }]}>{t('profile_language') || 'Selecciona idioma:'}</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {LANGUAGES && Object.values(LANGUAGES).map((lang) => (
                                <TouchableOpacity
                                    key={lang}
                                    style={[
                                        styles.langMenuItem,
                                        language === lang && { backgroundColor: isDark ? BRAND.oceanMid : BRAND.oceanLight + '30' }
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setLanguage(lang);
                                        setShowLangDropdown(false);
                                    }}
                                >
                                    <FlagIcon code={LANGUAGE_LABELS[lang]?.code} size={0.8} style={{ marginRight: rs(10) }} />
                                    <Text style={[
                                        styles.langMenuItemText,
                                        { color: language === lang ? colors.accent : colors.text },
                                        language === lang && { fontWeight: '700' }
                                    ]}>
                                        {LANGUAGE_LABELS[lang]?.name || lang.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Background elements */}
            <LivingWater />
            <FloatingBubbles count={15} minSize={4} maxSize={16} />

            <SafeAreaView style={styles.safeArea}>
                {renderLangSelector()}
                <View style={styles.contentWrap}>
                    <Animated.View style={[styles.mainContent, animatedContentStyle]}>

                        <GlassCard variant="form" style={styles.authCard}>
                            <View style={styles.header}>
                                <Text style={[styles.title, { color: colors.text }]}>
                                    {t('wallet_connect_title') || 'Conectar Billetera'}
                                </Text>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                    {t('wallet_connect_subtitle') || 'Reclama tus recompensas y verifica tu impacto en la red.'}
                                </Text>
                            </View>

                            <View style={styles.buttonsContainer}>
                                <AnimatedButton
                                    title={t('wallet_connect_pali') || 'Conectar Pali'}
                                    onPress={handleConnectPali}
                                    variant="primary"
                                    icon={
                                        <Image
                                            source={require('../assets/logo-pali.png')}
                                            style={{ width: rs(24), height: rs(24), marginRight: rs(8) }}
                                            resizeMode="contain"
                                        />
                                    }
                                    fullWidth
                                    style={styles.walletBtn}
                                />

                                <AnimatedButton
                                    title={t('wallet_connect_metamask') || 'Conectar MetaMask'}
                                    onPress={handleConnectMetamask}
                                    variant="secondary"
                                    icon={
                                        <Image
                                            source={require('../assets/logo-metamask.png')}
                                            style={{ width: rs(24), height: rs(24), marginRight: rs(8) }}
                                            resizeMode="contain"
                                        />
                                    }
                                    fullWidth
                                    style={styles.walletBtn}
                                />
                            </View>
                        </GlassCard>

                        <Animated.View entering={FadeInUp.delay(300).springify()}>
                            <ScalePressable style={styles.skipButton} onPress={handleSkip}>
                                <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                                    {t('wallet_connect_skip') || 'Saltar / Conectar más tarde'}
                                </Text>
                            </ScalePressable>
                            <Text style={[styles.connectionHint, { color: colors.textSecondary }]}>
                                {t('wallet_connect_hint')}
                            </Text>
                        </Animated.View>

                    </Animated.View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    safeArea: {
        flex: 1,
    },
    contentWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    mainContent: {
        width: '100%',
        maxWidth: rs(440),
        alignItems: 'center',
    },
    authCard: {
        width: '100%',
        padding: SPACING.xl,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: rf(28),
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: rf(15),
        textAlign: 'center',
        lineHeight: rf(22),
        paddingHorizontal: SPACING.md,
    },
    buttonsContainer: {
        width: '100%',
        gap: SPACING.md,
    },
    walletBtn: {
        height: rs(56),
    },
    skipButton: {
        marginTop: SPACING.xl,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xl,
    },
    skipText: {
        fontSize: rf(14),
        fontWeight: '600',
        textAlign: 'center',
    },
    connectionHint: {
        fontSize: rf(12),
        textAlign: 'center',
        marginTop: SPACING.md,
        paddingHorizontal: SPACING.lg,
        opacity: 0.8,
    },
    langSelectorContainer: {
        position: 'absolute',
        top: Platform.OS === 'web' ? rs(16) : rs(10), // Safe area handles mobile offset
        right: SPACING.md,
        zIndex: 50,
        elevation: 10,
    },
    langButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rs(10),
        paddingVertical: rs(6),
        borderRadius: rs(20),
        borderWidth: 1,
        backdropFilter: 'blur(10px)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    langDropdownMenu: {
        width: '100%',
        maxWidth: rs(320),
        maxHeight: rh(400),
        borderRadius: rs(16),
        padding: SPACING.md,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    langMenuTitle: {
        fontSize: rf(14),
        fontWeight: '600',
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    langMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        borderRadius: rs(10),
        marginBottom: rs(4),
    },
    langMenuItemText: {
        fontSize: rf(14),
    },
});
