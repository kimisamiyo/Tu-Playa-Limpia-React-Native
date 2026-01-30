import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import AnimatedDog from './AnimatedDog';
import LiquidButton from './LiquidButton';

const { width, height } = Dimensions.get('window');

export default function CelebrationModal({ visible, onClose, message = "¡MUCHAS GRACIAS!" }) {
    const [isAwake, setIsAwake] = useState(false);

    useEffect(() => {
        if (visible) {
            // Wake up shortly after modal opens
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
                {/* Gradient Backdrop */}
                <LinearGradient
                    colors={['rgba(0,51,78,0.95)', 'rgba(0,16,26,0.98)']}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.contentContainer}>
                    {/* Speech Bubble */}
                    {isAwake && (
                        <View style={styles.bubble}>
                            <Text style={styles.bubbleText}>{message}</Text>
                            <View style={styles.bubbleArrow} />
                        </View>
                    )}

                    {/* Character */}
                    <AnimatedDog isAwake={isAwake} />

                    <View style={{ height: 40 }} />

                    {/* Action */}
                    <LiquidButton onPress={onClose} label="CONTINUAR" />
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
        backgroundColor: '#fff',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 20,
        marginBottom: 25,
        minWidth: 200,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    bubbleText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
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
        borderTopColor: '#fff',
    }
});

