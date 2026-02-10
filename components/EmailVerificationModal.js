import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { rs, rf, rh } from '../constants/responsive';
import { BRAND } from '../constants/theme';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/config';

export default function EmailVerificationModal({ visible, onClose, onVerified }) {
    const { colors, isDark } = useTheme();
    const [step, setStep] = useState('email'); // 'email' o 'code'
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [devCode, setDevCode] = useState(''); // Solo para desarrollo

    const resetState = () => {
        setStep('email');
        setEmail('');
        setCode('');
        setError('');
        setDevCode('');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleSendCode = async () => {
        if (!email.trim()) {
            setError('Por favor ingresa tu correo');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor ingresa un correo válido');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SEND_CODE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.toLowerCase().trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Error al enviar código');
            }

            // En modo desarrollo, guardar el código para mostrarlo
            if (data.dev_code) {
                setDevCode(data.dev_code);
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStep('code');
        } catch (err) {
            setError(err.message || 'Error al enviar código');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code.trim()) {
            setError('Por favor ingresa el código');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_CODE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    code: code.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Código incorrecto');
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            resetState();
            onVerified();
        } catch (err) {
            setError(err.message || 'Código incorrecto');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />

                <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
                    <LinearGradient
                        colors={isDark
                            ? [BRAND.oceanDeep, BRAND.oceanDark]
                            : [colors.primary, colors.accent]
                        }
                        style={styles.header}
                    >
                        <Text style={styles.headerTitle}>
                            {step === 'email' ? '📧 Verificación por Email' : '🔐 Ingresa el Código'}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {step === 'email'
                                ? 'Te enviaremos un código de verificación'
                                : 'Revisa tu correo electrónico'}
                        </Text>
                    </LinearGradient>

                    <View style={styles.content}>
                        {step === 'email' ? (
                            <>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Correo Electrónico
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.background,
                                            color: colors.text,
                                            borderColor: error ? '#f44336' : colors.border,
                                        },
                                    ]}
                                    placeholder="ejemplo@correo.com"
                                    placeholderTextColor={colors.textMuted}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setError('');
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!loading}
                                />
                            </>
                        ) : (
                            <>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Código de Verificación
                                </Text>
                                <Text style={[styles.emailDisplay, { color: colors.textSecondary }]}>
                                    Enviado a: {email}
                                </Text>
                                {devCode && (
                                    <View style={styles.devCodeBox}>
                                        <Text style={styles.devCodeLabel}>🔧 Modo Desarrollo</Text>
                                        <Text style={styles.devCodeText}>Código: {devCode}</Text>
                                    </View>
                                )}
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.codeInput,
                                        {
                                            backgroundColor: colors.background,
                                            color: colors.text,
                                            borderColor: error ? '#f44336' : colors.border,
                                        },
                                    ]}
                                    placeholder="000000"
                                    placeholderTextColor={colors.textMuted}
                                    value={code}
                                    onChangeText={(text) => {
                                        setCode(text);
                                        setError('');
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        setStep('email');
                                        setCode('');
                                        setError('');
                                    }}
                                    disabled={loading}
                                >
                                    <Text style={[styles.backButton, { color: colors.accent }]}>
                                        ← Cambiar correo
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : null}

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={step === 'email' ? handleSendCode : handleVerifyCode}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={isDark
                                    ? [BRAND.accent, BRAND.accentDark]
                                    : [colors.accent, colors.primary]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        {step === 'email' ? 'Enviar Código' : 'Verificar'}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        borderTopLeftRadius: rs(24),
        borderTopRightRadius: rs(24),
        overflow: 'hidden',
        maxHeight: '85%',
    },
    header: {
        padding: rs(24),
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: rf(22),
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: rs(8),
    },
    headerSubtitle: {
        fontSize: rf(14),
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    content: {
        padding: rs(24),
    },
    label: {
        fontSize: rf(14),
        fontWeight: '600',
        marginBottom: rs(8),
    },
    input: {
        borderWidth: 2,
        borderRadius: rs(12),
        padding: rs(16),
        fontSize: rf(16),
        marginBottom: rs(16),
    },
    codeInput: {
        fontSize: rf(24),
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: rs(8),
    },
    emailDisplay: {
        fontSize: rf(12),
        marginBottom: rs(16),
        fontStyle: 'italic',
    },
    devCodeBox: {
        backgroundColor: '#fff3cd',
        padding: rs(12),
        borderRadius: rs(8),
        marginBottom: rs(16),
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    devCodeLabel: {
        fontSize: rf(12),
        fontWeight: '600',
        color: '#856404',
        marginBottom: rs(4),
    },
    devCodeText: {
        fontSize: rf(16),
        fontWeight: '700',
        color: '#856404',
        letterSpacing: rs(4),
    },
    backButton: {
        fontSize: rf(14),
        fontWeight: '600',
        marginBottom: rs(16),
    },
    errorText: {
        color: '#f44336',
        fontSize: rf(13),
        marginBottom: rs(16),
        textAlign: 'center',
    },
    actionButton: {
        marginBottom: rs(12),
        borderRadius: rs(12),
        overflow: 'hidden',
    },
    buttonGradient: {
        padding: rs(16),
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: rf(16),
        fontWeight: '700',
    },
    cancelButton: {
        padding: rs(12),
        alignItems: 'center',
    },
    cancelText: {
        fontSize: rf(14),
        fontWeight: '600',
    },
});
