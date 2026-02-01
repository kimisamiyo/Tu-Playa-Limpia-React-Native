import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TextInput, Image, Alert, Modal, Platform, Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { BRAND } from '../constants/theme';
import { rs, rf, rh, SPACING, RADIUS, SCREEN } from '../constants/responsive';
import { SPRING } from '../constants/animations';
import LivingWater from '../components/LivingWater';
import FloatingBubbles from '../components/premium/FloatingBubbles';
import GlassCard from '../components/premium/GlassCard';
import ScalePressable from '../components/ScalePressable';

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM PROFILE SCREEN
// ═══════════════════════════════════════════════════════════════════════════

export default function ProfileScreen({ navigation }) {
    const { user, updateUserProfile, nfts, points, level, scannedItems } = useGame();
    const { colors, shadows, isDark, themeMode, setDarkMode, setLightMode, setSystemMode, THEME_MODES } = useTheme();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user.name);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Animation values
    const toastOpacity = useSharedValue(0);
    const toastY = useSharedValue(rs(-50));

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessToast(true);
        toastOpacity.value = withSpring(1);
        toastY.value = withSpring(0);
        setTimeout(() => {
            toastOpacity.value = withTiming(0, { duration: 300 });
            toastY.value = withTiming(rs(-50), { duration: 300 });
            setTimeout(() => setShowSuccessToast(false), 300);
        }, 2500);
    };

    // Image picker functions
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso Requerido', 'Necesitamos acceso a tu galería.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            updateUserProfile({ avatar: result.assets[0].uri });
            showSuccess('Foto de perfil actualizada');
        }
        setShowImagePicker(false);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso Requerido', 'Necesitamos acceso a tu cámara.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            updateUserProfile({ avatar: result.assets[0].uri });
            showSuccess('Foto de perfil actualizada');
        }
        setShowImagePicker(false);
    };

    const handleSaveName = () => {
        if (user.hasChangedUsername) {
            Alert.alert('Cambio No Permitido', 'Solo puedes cambiar tu nombre una vez.');
            setIsEditingName(false);
            return;
        }

        const trimmedName = newName.trim();
        if (trimmedName.length < 3) {
            Alert.alert('Nombre Inválido', 'El nombre debe tener al menos 3 caracteres.');
            return;
        }

        if (trimmedName === user.name) {
            setIsEditingName(false);
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateUserProfile({ name: trimmedName });
        setIsEditingName(false);
        showSuccess('Nombre guardado');
    };

    // Theme mode selector
    const handleThemeChange = (mode) => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (mode === 'dark') setDarkMode();
        else if (mode === 'light') setLightMode();
        else setSystemMode();
        showSuccess(`Tema: ${mode === 'system' ? 'Automático' : mode === 'dark' ? 'Oscuro' : 'Claro'}`);
    };

    const toastStyle = useAnimatedStyle(() => ({
        opacity: toastOpacity.value,
        transform: [{ translateY: toastY.value }],
    }));

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Background */}
            {isDark && (
                <LinearGradient
                    colors={[BRAND.oceanDeep, BRAND.oceanDark, BRAND.oceanMid]}
                    style={StyleSheet.absoluteFill}
                />
            )}
            {isDark && <FloatingBubbles count={6} minSize={4} maxSize={12} />}
            <View style={styles.bgContainer}>
                <LivingWater />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    style={styles.header}
                >
                    <ScalePressable
                        onPress={() => navigation.goBack()}
                        style={[styles.backButton, { backgroundColor: colors.glass }]}
                    >
                        <Ionicons name="arrow-back" size={rs(24)} color={colors.text} />
                    </ScalePressable>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Mi Perfil</Text>
                    <View style={{ width: rs(44) }} />
                </Animated.View>

                {/* Avatar */}
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <ScalePressable
                        style={styles.avatarContainer}
                        onPress={() => setShowImagePicker(true)}
                    >
                        <LinearGradient
                            colors={[BRAND.sandGold, BRAND.goldShimmer, BRAND.sandGold]}
                            style={styles.avatarBorder}
                        >
                            {user.avatar ? (
                                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
                                    <Text style={[styles.avatarInitials, { color: colors.tabInactive }]}>
                                        {user.initials}
                                    </Text>
                                </View>
                            )}
                        </LinearGradient>
                        <View style={[styles.editBadge, { backgroundColor: colors.tabInactive }]}>
                            <Ionicons name="camera" size={rs(16)} color="#fff" />
                        </View>
                    </ScalePressable>
                </Animated.View>

                {/* Username */}
                <Animated.View
                    entering={FadeInUp.delay(300).springify()}
                    style={styles.nameContainer}
                >
                    {isEditingName ? (
                        <View style={styles.editNameContainer}>
                            <TextInput
                                style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="Nuevo nombre"
                                placeholderTextColor={colors.textMuted}
                                maxLength={20}
                                autoFocus
                            />
                            <ScalePressable onPress={handleSaveName} style={[styles.saveButton, { backgroundColor: isDark ? BRAND.oceanLight : BRAND.success }]}>
                                <Ionicons name="checkmark" size={rs(20)} color="#fff" />
                            </ScalePressable>
                            <ScalePressable
                                onPress={() => { setNewName(user.name); setIsEditingName(false); }}
                                style={[styles.cancelButton, { backgroundColor: colors.glass }]}
                            >
                                <Ionicons name="close" size={rs(20)} color={colors.text} />
                            </ScalePressable>
                        </View>
                    ) : (
                        <ScalePressable
                            onPress={() => !user.hasChangedUsername && setIsEditingName(true)}
                            style={styles.nameDisplay}
                        >
                            <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                            {!user.hasChangedUsername && (
                                <Ionicons name="pencil" size={rs(16)} color={colors.textSecondary} style={{ marginLeft: rs(10) }} />
                            )}
                        </ScalePressable>
                    )}
                    {user.hasChangedUsername && (
                        <Text style={[styles.nameLockedHint, { color: colors.textMuted }]}>
                            Nombre bloqueado (ya cambiado)
                        </Text>
                    )}
                </Animated.View>

                {/* Level Badge */}
                <Animated.View entering={FadeInUp.delay(350).springify()}>
                    <LinearGradient
                        colors={BRAND.goldShimmer ? [BRAND.sandGold, BRAND.goldShimmer] : ['#e8d5b5', '#FFD700']}
                        style={[styles.levelBadge, shadows.goldGlow]}
                    >
                        <Text style={styles.levelText}>NIVEL {level}</Text>
                    </LinearGradient>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View entering={FadeInUp.delay(400).springify()}>
                    <GlassCard variant="elevated" style={styles.statsCard}>
                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{nfts.length}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>NFTs</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{points}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Puntos</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{scannedItems.total}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Escaneos</Text>
                            </View>
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Theme Settings Section */}
                <Animated.View entering={FadeInUp.delay(450).springify()}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
                    <GlassCard variant="default" style={styles.settingsCard}>
                        <View style={styles.themeRow}>
                            <View style={styles.themeInfo}>
                                <Ionicons name={isDark ? 'moon' : 'sunny'} size={rs(22)} color={colors.accent} />
                                <View style={{ marginLeft: SPACING.md }}>
                                    <Text style={[styles.settingLabel, { color: colors.text }]}>Tema de la App</Text>
                                    <Text style={[styles.settingHint, { color: colors.textMuted }]}>
                                        {themeMode === THEME_MODES.SYSTEM
                                            ? 'Sigue tu dispositivo'
                                            : themeMode === THEME_MODES.DARK
                                                ? 'Modo oscuro'
                                                : 'Modo claro'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.themeButtons}>
                            {[
                                { mode: THEME_MODES.SYSTEM, icon: 'phone-portrait-outline', label: 'Auto' },
                                { mode: THEME_MODES.LIGHT, icon: 'sunny-outline', label: 'Claro' },
                                { mode: THEME_MODES.DARK, icon: 'moon-outline', label: 'Oscuro' },
                            ].map(({ mode, icon, label }) => (
                                <ScalePressable
                                    key={mode}
                                    style={[
                                        styles.themeButton,
                                        {
                                            backgroundColor: themeMode === mode
                                                ? (isDark ? colors.tabInactive : BRAND.oceanDark)
                                                : colors.glass,
                                            borderColor: themeMode === mode ? colors.accent : colors.border,
                                        }
                                    ]}
                                    onPress={() => handleThemeChange(mode)}
                                >
                                    <Ionicons
                                        name={icon}
                                        size={rs(18)}
                                        color={themeMode === mode ? '#fff' : colors.textSecondary}
                                    />
                                    <Text style={[
                                        styles.themeButtonText,
                                        { color: themeMode === mode ? '#fff' : colors.textSecondary }
                                    ]}>
                                        {label}
                                    </Text>
                                </ScalePressable>
                            ))}
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Profile Info Cards */}
                <Animated.View entering={FadeInUp.delay(500).springify()}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Privada</Text>
                    <GlassCard variant="default" style={styles.infoCard}>
                        <Ionicons name="calendar-outline" size={rs(20)} color={colors.accent} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Fecha de Registro</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{user.joinDate}</Text>
                        </View>
                    </GlassCard>

                    <GlassCard variant="default" style={styles.infoCard}>
                        <Ionicons name="wallet-outline" size={rs(20)} color={colors.accent} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Wallet Web3</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {user.walletAddress || 'No conectada'}
                            </Text>
                        </View>
                        <ScalePressable style={[styles.connectButton, { backgroundColor: colors.tabInactive }]}>
                            <Text style={styles.connectText}>CONECTAR</Text>
                        </ScalePressable>
                    </GlassCard>

                    <GlassCard variant="default" style={styles.infoCard}>
                        <Ionicons name="shield-checkmark-outline" size={rs(20)} color={colors.accent} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Seguridad</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>Cuenta Verificada</Text>
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Privacy Notice */}
                <Animated.View entering={FadeInUp.delay(550).springify()} style={styles.privacyNotice}>
                    <Ionicons name="lock-closed" size={rs(14)} color={colors.textMuted} />
                    <Text style={[styles.privacyText, { color: colors.textMuted }]}>
                        Tu información es privada y segura. Solo se comparte lo necesario para validar tus NFTs.
                    </Text>
                </Animated.View>

            </ScrollView>

            {/* Image Picker Modal */}
            <Modal visible={showImagePicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Cambiar Foto de Perfil</Text>

                        <ScalePressable style={styles.modalOption} onPress={takePhoto}>
                            <Ionicons name="camera" size={rs(24)} color={colors.accent} />
                            <Text style={[styles.modalOptionText, { color: colors.text }]}>Tomar Foto</Text>
                        </ScalePressable>

                        <ScalePressable style={styles.modalOption} onPress={pickImage}>
                            <Ionicons name="images" size={rs(24)} color={colors.accent} />
                            <Text style={[styles.modalOptionText, { color: colors.text }]}>Elegir de Galería</Text>
                        </ScalePressable>

                        <ScalePressable
                            style={[styles.modalCancel, { backgroundColor: colors.glass }]}
                            onPress={() => setShowImagePicker(false)}
                        >
                            <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancelar</Text>
                        </ScalePressable>
                    </View>
                </View>
            </Modal>

            {/* Success Toast */}
            {showSuccessToast && (
                <Animated.View style={[styles.toastCard, { backgroundColor: colors.surface }, shadows.lg, toastStyle]}>
                    <LinearGradient colors={isDark ? [BRAND.oceanLight, BRAND.oceanMid] : [BRAND.success, '#388e3c']} style={styles.toastIconGradient}>
                        <Ionicons name="checkmark" size={rs(18)} color="#fff" />
                    </LinearGradient>
                    <View style={styles.toastTextBox}>
                        <Text style={[styles.toastTitle, { color: colors.text }]}>Tu Playa Limpia</Text>
                        <Text style={[styles.toastMessage, { color: colors.textSecondary }]}>{successMessage}</Text>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.2 },
    scrollContent: {
        padding: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? rh(60) : rh(50),
        paddingBottom: rh(120),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    backButton: {
        width: rs(44),
        height: rs(44),
        borderRadius: rs(22),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: rf(20), fontWeight: '700' },

    // Avatar
    avatarContainer: { alignSelf: 'center', marginBottom: SPACING.lg },
    avatarBorder: {
        width: rs(124),
        height: rs(124),
        borderRadius: rs(62),
        padding: rs(4),
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: rs(116),
        height: rs(116),
        borderRadius: rs(58),
    },
    avatarPlaceholder: {
        width: rs(116),
        height: rs(116),
        borderRadius: rs(58),
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: { fontSize: rf(36), fontWeight: '700' },
    editBadge: {
        position: 'absolute',
        bottom: rs(4),
        right: rs(4),
        width: rs(36),
        height: rs(36),
        borderRadius: rs(18),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },

    // Name
    nameContainer: { alignItems: 'center', marginBottom: SPACING.md },
    nameDisplay: { flexDirection: 'row', alignItems: 'center' },
    userName: { fontSize: rf(24), fontWeight: '700' },
    nameLockedHint: { fontSize: rf(11), marginTop: rs(4) },
    editNameContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    nameInput: {
        fontSize: rf(18),
        fontWeight: '600',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderWidth: 1,
        borderRadius: RADIUS.md,
        minWidth: rs(150),
    },
    saveButton: {
        width: rs(40),
        height: rs(40),
        borderRadius: rs(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        width: rs(40),
        height: rs(40),
        borderRadius: rs(20),
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Level Badge
    levelBadge: {
        alignSelf: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg,
    },
    levelText: {
        fontSize: rf(12),
        fontWeight: '800',
        color: BRAND.oceanDark,
        letterSpacing: 2,
    },

    // Stats
    statsCard: { marginBottom: SPACING.xl, padding: SPACING.lg },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: rf(24), fontWeight: '700' },
    statLabel: { fontSize: rf(12), marginTop: rs(4), textTransform: 'uppercase' },
    statDivider: { width: 1, height: '80%', alignSelf: 'center' },

    // Section
    sectionTitle: {
        fontSize: rf(16),
        fontWeight: '700',
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },

    // Theme Settings
    settingsCard: { marginBottom: SPACING.lg, padding: SPACING.md },
    themeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    themeInfo: { flexDirection: 'row', alignItems: 'center' },
    settingLabel: { fontSize: rf(14), fontWeight: '600' },
    settingHint: { fontSize: rf(11), marginTop: rs(2) },
    themeButtons: { flexDirection: 'row', gap: SPACING.sm },
    themeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        gap: rs(6),
    },
    themeButtonText: { fontSize: rf(12), fontWeight: '600' },

    // Info Cards
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        marginBottom: SPACING.sm,
    },
    infoContent: { flex: 1, marginLeft: SPACING.md },
    infoLabel: { fontSize: rf(11), textTransform: 'uppercase', letterSpacing: 0.5 },
    infoValue: { fontSize: rf(14), fontWeight: '600', marginTop: rs(2) },
    connectButton: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.sm,
    },
    connectText: { color: '#fff', fontSize: rf(10), fontWeight: '700' },

    // Privacy
    privacyNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: SPACING.md,
        gap: SPACING.sm,
    },
    privacyText: { flex: 1, fontSize: rf(11), lineHeight: rf(16) },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.xl,
        paddingBottom: rh(40),
    },
    modalTitle: { fontSize: rf(18), fontWeight: '700', textAlign: 'center', marginBottom: SPACING.lg },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalOptionText: { fontSize: rf(16), marginLeft: SPACING.md },
    modalCancel: {
        marginTop: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    modalCancelText: { fontSize: rf(16), fontWeight: '600' },

    // Toast
    toastCard: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? rh(60) : rh(40),
        left: SPACING.lg,
        right: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    toastIconGradient: {
        width: rs(36),
        height: rs(36),
        borderRadius: rs(18),
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastTextBox: { marginLeft: SPACING.md },
    toastTitle: { fontSize: rf(12), fontWeight: '700' },
    toastMessage: { fontSize: rf(11), marginTop: rs(2) },
});
