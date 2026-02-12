import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, TextInput, useWindowDimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withDelay,
    FadeInDown,
    FadeInUp,
    FadeIn,
    SlideInRight,
    SlideInLeft,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { rs, rf, rh, SPACING, RADIUS } from '../constants/responsive';
import { SPRING, DURATION } from '../constants/animations';
import { BRAND } from '../constants/theme';

// Modular Components
import FishBowlLoader from './FishBowlLoader';
import PinDisplay from './PinDisplay';
import PinPad from './PinPad';
import LivingWater from './LivingWater';
import FloatingBubbles from './premium/FloatingBubbles';
import GlassCard from './premium/GlassCard';

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM AUTH SCREEN - Multi-step registration, login, and import flows
//
// Modes:
//   choice           → "Create Account" / "Import Account"
//   register_name    → Username input
//   register_password → Password (x2)
//   create_pin       → PIN creation (x2)
//   login            → "Welcome, [username]" + PIN entry
//   import_file      → File picker + file password + new password
//   import_pin       → PIN creation after import
// ═══════════════════════════════════════════════════════════════════════════

export default function AuthScreen({ onAuthenticated, isFirstTime, onRegister, onLogin, onImport, username: savedUsername }) {
    const { colors, isDark } = useTheme();
    const { user } = useGame();
    const { t } = useLanguage();

    // Multi-step state
    const [mode, setMode] = useState(isFirstTime ? 'choice' : 'login');
    const [pin, setPin] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);

    // Missing state variables
    const [statusText, setStatusText] = useState('');
    const [errorText, setErrorText] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [importFileName, setImportFileName] = useState('');
    const [importFileContent, setImportFileContent] = useState('');
    const [importFilePassword, setImportFilePassword] = useState('');
    const [importNewPassword, setImportNewPassword] = useState('');
    const [importNewPasswordConfirm, setImportNewPasswordConfirm] = useState('');
    const [firstPin, setFirstPin] = useState('');

    const shake = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const contentY = useSharedValue(rs(30));

    // Entrance animation
    useEffect(() => {
        contentOpacity.value = withTiming(1, { duration: 600 });
        contentY.value = withSpring(0, SPRING.smooth);
    }, []);

    // Update status text when mode changes
    useEffect(() => {
        setErrorText('');
        switch (mode) {
            case 'choice':
                setStatusText(t('auth_your_impact'));
                break;
            case 'register_name':
                setStatusText(t('auth_enter_username'));
                break;
            case 'register_password':
                setStatusText(t('auth_create_password'));
                break;
            case 'create_pin':
                setStatusText(t('auth_create_pin'));
                break;
            case 'confirm_pin':
                setStatusText(t('auth_confirm_pin'));
                break;
            case 'login':
                setStatusText(t('auth_enter_pin'));
                break;
            case 'import_file':
                setStatusText(t('auth_import_desc'));
                break;
            case 'import_pin':
                setStatusText(t('auth_create_pin'));
                break;
            case 'import_confirm_pin':
                setStatusText(t('auth_confirm_pin'));
                break;
        }
    }, [mode, t]);

    // Try biometrics on login
    useEffect(() => {
        if (mode === 'login') {
            const checkBiometrics = async () => {
                try {
                    const hasHardware = await LocalAuthentication.hasHardwareAsync();
                    if (!hasHardware) return;
                    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
                    if (isEnrolled) authenticateBiometric();
                } catch (error) {
                    console.warn("Biometric check failed:", error);
                }
            };
            checkBiometrics();
        }
    }, [mode]);

    const authenticateBiometric = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: t('auth_biometric_prompt'),
                fallbackLabel: t('auth_biometric_fallback'),
            });
            if (result.success) {
                if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onAuthenticated();
            }
        } catch (err) {
            console.warn("Biometric auth failed:", err);
        }
    };

    const triggerShake = () => {
        shake.value = withSequence(
            withSpring(rs(12), { velocity: 100, stiffness: 500 }),
            withSpring(-rs(12), { velocity: 100, stiffness: 500 }),
            withSpring(rs(8), { velocity: 80, stiffness: 500 }),
            withSpring(-rs(8), { velocity: 80, stiffness: 500 }),
            withSpring(0, { velocity: 50, stiffness: 500 })
        );
    };

    const hapticLight = () => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const hapticSuccess = () => {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const hapticError = () => {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };

    // ═══════════════════════════════════════════
    // PIN HANDLERS
    // ═══════════════════════════════════════════
    const handlePinPress = (number) => {
        hapticLight();
        if (pin.length < 4) {
            const newPin = pin + number;
            setPin(newPin);
            if (newPin.length === 4) {
                handlePinComplete(newPin);
            }
        }
    };

    const handlePinComplete = async (completedPin) => {
        if (mode === 'create_pin') {
            setFirstPin(completedPin);
            setPin('');
            setMode('confirm_pin');
        } else if (mode === 'confirm_pin') {
            if (completedPin === firstPin) {
                hapticSuccess();
                setStatusText(t('auth_creating_account'));
                const result = await onRegister(regUsername, regPassword, completedPin);
                if (result.success) {
                    onAuthenticated();
                }
            } else {
                hapticError();
                triggerShake();
                setErrorText(t('auth_pin_mismatch'));
                setTimeout(() => {
                    setPin('');
                    setFirstPin('');
                    setMode('create_pin');
                }, 800);
            }
        } else if (mode === 'import_pin') {
            setFirstPin(completedPin);
            setPin('');
            setMode('import_confirm_pin');
        } else if (mode === 'import_confirm_pin') {
            if (completedPin === firstPin) {
                hapticSuccess();
                setStatusText(t('auth_creating_account'));
                const result = await onImport(importFileContent, importFilePassword, importNewPassword, completedPin);
                if (result.success) {
                    onAuthenticated();
                } else {
                    hapticError();
                    setErrorText(t('account_import_error'));
                    setTimeout(() => {
                        setPin('');
                        setFirstPin('');
                        setMode('import_file');
                    }, 1200);
                }
            } else {
                hapticError();
                triggerShake();
                setErrorText(t('auth_pin_mismatch'));
                setTimeout(() => {
                    setPin('');
                    setFirstPin('');
                    setMode('import_pin');
                }, 800);
            }
        } else if (mode === 'login') {
            const result = await onLogin(completedPin);
            if (result.success) {
                hapticSuccess();
                onAuthenticated();
            } else {
                hapticError();
                triggerShake();
                setTimeout(() => setPin(''), 300);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        hapticLight();
    };

    // ═══════════════════════════════════════════
    // REGISTRATION HANDLERS
    // ═══════════════════════════════════════════
    const handleRegisterNameNext = () => {
        const trimmed = regUsername.trim();
        if (trimmed.length < 3) {
            setErrorText(t('profile_name_invalid'));
            triggerShake();
            return;
        }
        hapticLight();
        setErrorText('');
        setMode('register_password');
    };

    const handleRegisterPasswordNext = () => {
        if (regPassword.length < 6) {
            setErrorText(t('auth_password_short'));
            triggerShake();
            return;
        }
        if (regPassword !== regPasswordConfirm) {
            setErrorText(t('auth_password_mismatch'));
            triggerShake();
            return;
        }
        hapticLight();
        setErrorText('');
        setMode('create_pin');
    };

    // ═══════════════════════════════════════════
    // IMPORT HANDLERS
    // ═══════════════════════════════════════════
    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setImportFileName(file.name);
                if (Platform.OS === 'web') {
                    // Web file reading
                    fetch(file.uri)
                        .then(res => res.text())
                        .then(text => setImportFileContent(text))
                        .catch(err => setErrorText('Error reading file: ' + err.message));
                } else {
                    const content = await FileSystem.readAsStringAsync(file.uri);
                    setImportFileContent(content);
                }
            }
        } catch (e) {
            setErrorText('Error: ' + e.message);
        }
    };

    const handleImportNext = () => {
        if (!importFileContent) {
            setErrorText(t('auth_select_file'));
            return;
        }
        if (importFilePassword.length < 1) {
            setErrorText(t('auth_enter_file_password'));
            return;
        }
        if (importNewPassword.length < 6) {
            setErrorText(t('auth_password_short'));
            triggerShake();
            return;
        }
        if (importNewPassword !== importNewPasswordConfirm) {
            setErrorText(t('auth_password_mismatch'));
            triggerShake();
            return;
        }
        hapticLight();
        setErrorText('');
        setMode('import_pin');
    };

    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentY.value }],
    }));

    // ═══════════════════════════════════════════
    // DYNAMIC HEADER
    // ═══════════════════════════════════════════
    const getTitle = () => {
        switch (mode) {
            case 'choice': return t('auth_welcome');
            case 'register_name': return t('auth_create_account');
            case 'register_password': return t('auth_create_account');
            case 'create_pin':
            case 'confirm_pin': return t('auth_first_time_title');
            case 'login': return `${t('auth_welcome_back')}, ${savedUsername || ''}`;
            case 'import_file': return t('auth_import_account');
            case 'import_pin':
            case 'import_confirm_pin': return t('auth_first_time_title');
            default: return t('auth_welcome');
        }
    };

    const getSubtitle = () => {
        switch (mode) {
            case 'choice': return t('auth_your_impact');
            case 'register_name': return t('auth_enter_username');
            case 'register_password': return t('auth_create_password');
            case 'create_pin': return t('auth_first_time_subtitle');
            case 'confirm_pin': return t('auth_confirm_pin');
            case 'login': return t('auth_login_title');
            case 'import_file': return t('auth_import_desc');
            case 'import_pin': return t('auth_first_time_subtitle');
            case 'import_confirm_pin': return t('auth_confirm_pin');
            default: return '';
        }
    };

    // ═══════════════════════════════════════════
    // PIN MODES — show PIN pad
    // ═══════════════════════════════════════════
    const isPinMode = ['create_pin', 'confirm_pin', 'login', 'import_pin', 'import_confirm_pin'].includes(mode);

    // ═══════════════════════════════════════════
    // HEADER COMPONENT
    // ═══════════════════════════════════════════
    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? colors.accent : colors.primary }]}>
                {getTitle()}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {getSubtitle()}
            </Text>
        </View>
    );

    // ═══════════════════════════════════════════
    // RENDER FORM CONTENT (non-PIN modes)
    // ═══════════════════════════════════════════
    const renderFormContent = () => {
        const content = (() => {
            if (mode === 'choice') {
                return (
                    <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.choiceContainer}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => { hapticLight(); setMode('register_name'); }}
                        >
                            <GlassCard variant="elevated" style={styles.choiceCard}>
                                <LinearGradient
                                    colors={isDark
                                        ? ['rgba(10,31,46,0.8)', 'rgba(5,20,30,0.9)']
                                        : ['rgba(255,255,255,0.9)', 'rgba(230,245,255,0.9)']
                                    }
                                    style={StyleSheet.absoluteFill}
                                />
                                <View style={styles.choiceContent}>
                                    <LinearGradient
                                        colors={[BRAND.oceanMid, BRAND.oceanDark]}
                                        style={styles.choiceIconBg}
                                    >
                                        <Ionicons name="person-add-outline" size={rs(32)} color="#fff" />
                                    </LinearGradient>
                                    <Text style={[styles.choiceTitle, { color: isDark ? '#fff' : BRAND.oceanDeep }]}>
                                        {t('auth_create_account')}
                                    </Text>
                                    <Text style={[styles.choiceDesc, { color: isDark ? '#9ca3af' : colors.textSecondary }]}>
                                        {t('auth_create_account_desc')}
                                    </Text>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => { hapticLight(); setMode('import_file'); }}
                        >
                            <GlassCard variant="elevated" style={styles.choiceCard}>
                                <LinearGradient
                                    colors={isDark
                                        ? ['rgba(10,31,46,0.6)', 'rgba(5,20,30,0.8)']
                                        : ['rgba(255,255,255,0.6)', 'rgba(230,245,255,0.8)']
                                    }
                                    style={StyleSheet.absoluteFill}
                                />
                                <View style={styles.choiceContent}>
                                    <View style={[styles.choiceIconBgAlt, {
                                        backgroundColor: isDark ? 'rgba(100,210,255,0.1)' : 'rgba(0,51,78,0.08)',
                                    }]}>
                                        <Ionicons name="cloud-download-outline" size={rs(32)}
                                            color={isDark ? BRAND.oceanLight : BRAND.oceanDark} />
                                    </View>
                                    <Text style={[styles.choiceTitle, { color: isDark ? '#fff' : BRAND.oceanDeep }]}>
                                        {t('auth_import_account')}
                                    </Text>
                                    <Text style={[styles.choiceDesc, { color: isDark ? '#9ca3af' : colors.textSecondary }]}>
                                        {t('auth_import_account_desc')}
                                    </Text>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    </Animated.View>
                );
            }

            if (mode === 'register_name') {
                return (
                    <Animated.View entering={SlideInRight.springify()} style={styles.formContainer}>
                        <GlassCard variant="default" style={styles.formCard}>
                            <View style={styles.formIconRow}>
                                <Ionicons name="person-outline" size={rs(24)} color={colors.accent} />
                            </View>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.glass }]}
                                placeholder={t('auth_username_placeholder')}
                                placeholderTextColor={colors.textMuted}
                                value={regUsername}
                                onChangeText={setRegUsername}
                                autoCapitalize="words"
                                autoFocus
                                maxLength={30}
                            />
                            {errorText ? (
                                <Text style={styles.errorText}>{errorText}</Text>
                            ) : null}
                            <TouchableOpacity
                                style={[styles.nextButton, { backgroundColor: isDark ? BRAND.oceanLight : BRAND.oceanDark }]}
                                onPress={handleRegisterNameNext}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.nextButtonText}>{t('auth_next')}</Text>
                                <Ionicons name="arrow-forward" size={rs(18)} color="#fff" />
                            </TouchableOpacity>
                        </GlassCard>

                        <TouchableOpacity style={styles.backButton} onPress={() => { setMode('choice'); setErrorText(''); }}>
                            <Ionicons name="arrow-back" size={rs(18)} color={colors.textSecondary} />
                            <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>{t('auth_back')}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            }

            if (mode === 'register_password') {
                return (
                    <Animated.View entering={SlideInRight.springify()} style={styles.formContainer}>
                        <GlassCard variant="default" style={styles.formCard}>
                            <View style={styles.formIconRow}>
                                <Ionicons name="lock-closed-outline" size={rs(24)} color={colors.accent} />
                            </View>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.glass }]}
                                    placeholder={t('auth_password_placeholder')}
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry={!showPassword}
                                    value={regPassword}
                                    onChangeText={setRegPassword}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.accent} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.glass }]}
                                placeholder={t('auth_password_confirm_placeholder')}
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry={!showPassword}
                                value={regPasswordConfirm}
                                onChangeText={setRegPasswordConfirm}
                            />
                            <Text style={[styles.hintText, { color: colors.textMuted }]}>
                                {t('auth_password_hint')}
                            </Text>
                            {errorText ? (
                                <Text style={styles.errorText}>{errorText}</Text>
                            ) : null}
                            <TouchableOpacity
                                style={[styles.nextButton, { backgroundColor: isDark ? BRAND.oceanLight : BRAND.oceanDark }]}
                                onPress={handleRegisterPasswordNext}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.nextButtonText}>{t('auth_next')}</Text>
                                <Ionicons name="arrow-forward" size={rs(18)} color="#fff" />
                            </TouchableOpacity>
                        </GlassCard>

                        <TouchableOpacity style={styles.backButton} onPress={() => { setMode('register_name'); setErrorText(''); }}>
                            <Ionicons name="arrow-back" size={rs(18)} color={colors.textSecondary} />
                            <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>{t('auth_back')}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            }

            if (mode === 'import_file') {
                return (
                    <Animated.View entering={SlideInRight.springify()} style={styles.formContainer}>
                        <GlassCard variant="default" style={styles.formCard}>
                            <View style={styles.formIconRow}>
                                <Ionicons name="cloud-download-outline" size={rs(24)} color={colors.accent} />
                            </View>

                            {/* File picker */}
                            <TouchableOpacity
                                style={[styles.filePicker, { borderColor: colors.border, backgroundColor: colors.glass }]}
                                onPress={handlePickFile}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="document-outline" size={rs(20)} color={colors.accent} />
                                <Text style={[styles.filePickerText, { color: importFileName ? colors.text : colors.textMuted }]} numberOfLines={1}>
                                    {importFileName || t('account_import_button')}
                                </Text>
                            </TouchableOpacity>

                            {/* File password */}
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.glass }]}
                                    placeholder={t('auth_file_password_placeholder')}
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry={!showPassword}
                                    value={importFilePassword}
                                    onChangeText={setImportFilePassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.accent} />
                                </TouchableOpacity>
                            </View>

                            {/* New session password */}
                            <View style={styles.sectionDivider}>
                                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                <Text style={[styles.dividerText, { color: colors.textMuted }]}>{t('auth_new_credentials')}</Text>
                                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            </View>

                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.glass }]}
                                    placeholder={t('auth_new_password_placeholder')}
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry={!showPassword}
                                    value={importNewPassword}
                                    onChangeText={setImportNewPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.accent} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.glass }]}
                                placeholder={t('auth_password_confirm_placeholder')}
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry={!showPassword}
                                value={importNewPasswordConfirm}
                                onChangeText={setImportNewPasswordConfirm}
                            />
                            <Text style={[styles.hintText, { color: colors.textMuted }]}>
                                {t('auth_password_hint')}
                            </Text>

                            {errorText ? (
                                <Text style={styles.errorText}>{errorText}</Text>
                            ) : null}

                            <TouchableOpacity
                                style={[styles.nextButton, { backgroundColor: isDark ? BRAND.oceanLight : BRAND.oceanDark }]}
                                onPress={handleImportNext}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.nextButtonText}>{t('auth_next')}</Text>
                                <Ionicons name="arrow-forward" size={rs(18)} color="#fff" />
                            </TouchableOpacity>
                        </GlassCard>

                        <TouchableOpacity style={styles.backButton} onPress={() => { setMode('choice'); setErrorText(''); }}>
                            <Ionicons name="arrow-back" size={rs(18)} color={colors.textSecondary} />
                            <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>{t('auth_back')}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            }
            return null;
        })();

        return (
            <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1, alignItems: 'center' }}>
                {renderHeader()}
                {content}
            </Animated.View>
        );
    };

    // ═══════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════
    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={isDark
                    ? [BRAND.oceanDeep, BRAND.oceanDark, BRAND.oceanMid]
                    : [BRAND.biolumSoft, colors.background, colors.backgroundSecondary]
                }
                style={StyleSheet.absoluteFill}
            />

            <FloatingBubbles count={8} minSize={6} maxSize={16} pointerEvents="none" />

            <View style={styles.bgContainer} pointerEvents="none">
                <LivingWater />
            </View>

            <SafeAreaView style={styles.safeContainer}>
                {isPinMode ? (
                    /* ═══ PIN mode layout ═══ */
                    <Animated.View style={[styles.contentWrapper, contentStyle]}>
                        {renderHeader()}

                        {(mode === 'create_pin' || mode === 'confirm_pin') && (
                            <View style={styles.centerStage}>
                                <FishBowlLoader />
                            </View>
                        )}

                        {/* PIN Display */}
                        <View style={styles.feedbackArea}>
                            <PinDisplay pinLength={pin.length} shakeValue={shake} />
                            <Text style={[styles.pinHint, { color: colors.textMuted }]}>{statusText}</Text>
                            {errorText ? <Text style={[styles.pinError]}>{errorText}</Text> : null}
                        </View>

                        {/* Input Area */}
                        <View style={styles.inputArea}>
                            <PinPad
                                onPinPress={handlePinPress}
                                onBiometricPress={authenticateBiometric}
                                onDeletePress={handleDelete}
                            />
                        </View>
                    </Animated.View>
                ) : (
                    renderFormContent()
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    bgContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.3 },
    safeContainer: { flex: 1 },
    contentWrapper: { flex: 1 },

    // Header
    header: {
        alignItems: 'center',
        paddingVertical: rh(30),
        justifyContent: 'center',
    },
    title: {
        fontSize: rf(26),
        fontWeight: '800',
        letterSpacing: rs(0.5),
        marginBottom: rs(8),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: rf(12),
        textTransform: 'uppercase',
        letterSpacing: rs(2),
        fontWeight: '600',
        textAlign: 'center',
    },

    // Fish
    centerStage: { flex: 2.5, alignItems: 'center', justifyContent: 'center' },

    // PIN area
    feedbackArea: { flex: 0.8, justifyContent: 'center', alignItems: 'center' },
    pinHint: { fontSize: rf(12), marginTop: rs(8), letterSpacing: rs(0.5), textAlign: 'center' },
    pinError: { fontSize: rf(11), marginTop: rs(6), color: '#ef4444', textAlign: 'center', fontWeight: '600' },
    inputArea: { flex: 3.5, justifyContent: 'center', paddingBottom: rh(20) },

    // ═══ CHOICE CARDS ═══
    choiceContainer: { width: '100%', gap: SPACING.lg, paddingHorizontal: SPACING.md },
    choiceCard: {
        borderRadius: rs(24),
        overflow: 'hidden',
        minHeight: rh(160),
        justifyContent: 'center',
    },
    choiceContent: {
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    choiceIconBg: {
        width: rs(60), height: rs(60), borderRadius: rs(30),
        justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
        shadowColor: BRAND.oceanLight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    choiceIconBgAlt: {
        width: rs(60), height: rs(60), borderRadius: rs(30),
        justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
    },
    choiceTitle: {
        fontSize: rf(18),
        fontWeight: '700',
        marginBottom: SPACING.xs,
        textAlign: 'center',
        letterSpacing: rs(0.5),
    },
    choiceDesc: {
        fontSize: rf(13),
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: rf(18),
        paddingHorizontal: SPACING.sm,
    },

    // ═══ GENERAL FORM ═══
    formContainer: { width: '100%', paddingHorizontal: SPACING.md },
    formCard: { padding: SPACING.xl, borderRadius: rs(24) },
    formIconRow: { alignItems: 'center', marginBottom: SPACING.lg },

    input: {
        height: rs(54),
        borderWidth: 1,
        borderRadius: rs(16),
        paddingHorizontal: SPACING.lg,
        fontSize: rf(16),
        marginBottom: SPACING.md,
    },
    passwordContainer: { position: 'relative', marginBottom: SPACING.md },
    passwordInput: { marginBottom: 0, paddingRight: rs(50) },
    eyeIcon: { position: 'absolute', right: rs(16), top: rs(16), padding: 4 },

    nextButton: {
        flexDirection: 'row',
        height: rs(54),
        borderRadius: rs(16),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.md,
        shadowColor: BRAND.oceanDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: rf(16),
        fontWeight: '700',
        marginRight: SPACING.sm,
    },

    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.lg,
        padding: SPACING.sm,
    },
    backButtonText: { marginLeft: SPACING.xs, fontSize: rf(14), fontWeight: '600' },
    errorText: { color: '#ef4444', textAlign: 'center', marginBottom: SPACING.md, fontSize: rf(13) },
    hintText: { fontSize: rf(12), textAlign: 'center', marginBottom: SPACING.md },

    // File Picker
    filePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderWidth: 1,
        borderRadius: rs(16),
        borderStyle: 'dashed',
        marginBottom: SPACING.lg,
    },
    filePickerText: { flex: 1, marginLeft: SPACING.sm, fontSize: rf(14) },
    sectionDivider: {
        flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md,
    },
    dividerLine: { flex: 1, height: 1, opacity: 0.3 },
    dividerText: { marginHorizontal: SPACING.md, fontSize: rf(12), textTransform: 'uppercase' },

    emailButton: { marginTop: rs(16), padding: rs(12), alignItems: 'center' },
    emailButtonText: { fontSize: rf(14), fontWeight: '600', textDecorationLine: 'underline' },
});
