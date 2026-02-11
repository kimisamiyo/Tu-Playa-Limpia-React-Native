import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AnimatedDog from './AnimatedDog';
import LiquidButton from './LiquidButton';
import { handleClaim } from '../utils/nftGenerator';

const { width, height } = Dimensions.get('window');

export default function CelebrationModal({ visible, onClose, message }) {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const [isAwake, setIsAwake] = useState(false);
    const [processing, setProcessing] = useState(false);

    const displayMessage = message || t('celebration_thanks');

    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                setIsAwake(true);
            }, 300);
        } else {
            setIsAwake(false);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                {/* Gradient Backdrop - Ocean themed */}
                <LinearGradient
                    colors={[
                        isDark ? 'rgba(0,51,78,0.97)' : 'rgba(0,51,78,0.95)',
                        isDark ? 'rgba(0,18,32,0.99)' : 'rgba(0,18,32,0.97)',
                    ]}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.contentContainer}>
                    {/* Speech Bubble */}
                    {isAwake && (
                        <View style={[
                            styles.bubble,
                            {
                                backgroundColor: isDark ? '#0a1f2e' : '#ffffff',
                                borderColor: BRAND.sandGold,
                            }
                        ]}>
                            <Text style={[
                                styles.bubbleText,
                                { color: isDark ? BRAND.biolum : BRAND.oceanDark }
                            ]}>
                                {displayMessage}
                            </Text>
                            <View style={[
                                styles.bubbleArrow,
                                { borderTopColor: isDark ? '#0a1f2e' : '#ffffff' }
                            ]} />
                        </View>
                    )}

                    {/* Character */}
                    <AnimatedDog isAwake={isAwake} />

                    <View style={{ height: 40 }} />

                    {/* Action */}
                    <LiquidButton
                        onPress={async () => {
                            console.log('[CelebrationModal] continue pressed');
                            if (processing) return;
                            setProcessing(true);
                            try {
                                // timeout wrapper to avoid infinite hang
                                const timeout = (ms) => new Promise((res) => setTimeout(() => res({ success: false, error: new Error('Timeout al mintear') }), ms));
                                const result = await Promise.race([handleClaim(), timeout(120000)]);
                                console.log('[CelebrationModal] claim result', result);
                                if (result?.success) {
                                    Alert.alert(t('celebration_thanks'));
                                    onClose && onClose();
                                } else {
                                    Alert.alert('Error', result?.error?.message || 'No se pudo mintear el NFT');
                                }
                            } catch (err) {
                                console.log('[CelebrationModal] claim error', err);
                                Alert.alert('Error', err?.message || 'Ocurrió un error');
                            } finally {
                                setProcessing(false);
                            }
                        }}
                        label={processing ? 'Procesando...' : t('celebration_continue')}
                    />
                    {processing && <View style={{ marginTop: 12 }}><ActivityIndicator size="small" color="#fff" /></View>}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        width: width * 0.85,
    },
    bubble: {
        paddingHorizontal: 25,
        paddingVertical: 18,
        borderRadius: 20,
        marginBottom: 25,
        minWidth: 200,
        alignItems: 'center',
        borderWidth: 1.5,
        shadowColor: BRAND.sandGold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    bubbleText: {
        fontWeight: 'bold',
        fontSize: 17,
        textAlign: 'center',
        lineHeight: 24,
    },
    bubbleArrow: {
        position: 'absolute',
        bottom: -10,
        left: '50%',
        marginLeft: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    }
});
