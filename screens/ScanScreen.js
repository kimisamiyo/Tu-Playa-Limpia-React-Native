import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/theme';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

export default function ScanScreen({ navigation }) {
    const { scanItem } = useGame();
    const [isScanning, setIsScanning] = useState(true);
    const [lastScanned, setLastScanned] = useState(null);

    // Scanner Line Animation
    const scanLineY = useSharedValue(0);

    useEffect(() => {
        scanLineY.value = withRepeat(
            withTiming(height * 0.6, { duration: 2500, easing: Easing.linear }),
            -1,
            true
        );
    }, []);

    const animatedLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }]
    }));

    const handleSimulatedScan = (type) => {
        const points = scanItem(type);
        setLastScanned({ type, points });

        // Brief feedback
        setTimeout(() => setLastScanned(null), 2000);
    };

    return (
        <View style={styles.container}>
            {/* Simulated Camera Feed (Deep Dark Teal placeholder) */}
            <LinearGradient
                colors={['#001122', '#002233', '#001122']}
                style={StyleSheet.absoluteFill}
            />

            {/* Grid Overlay */}
            <View style={styles.overlay}>
                <View style={styles.focusFrame} />
                <Animated.View style={[styles.scanLine, animatedLineStyle]} />
                <Text style={styles.scanText}>BUSCANDO BASURA...</Text>
            </View>

            {/* Feedback Overlay */}
            {lastScanned && (
                <View style={styles.feedbackContainer}>
                    <Ionicons name="checkmark-circle" size={50} color={COLORS.success} />
                    <Text style={styles.feedbackText}>
                        +{lastScanned.points} PTS
                    </Text>
                    <Text style={styles.feedbackSubText}>
                        {lastScanned.type.toUpperCase()} DETECTADO
                    </Text>
                </View>
            )}

            {/* Controls (Simulation) */}
            <SafeAreaView style={styles.controlsArea}>
                <Text style={styles.debugTitle}>SIMULACIÓN DE DETECCIÓN</Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.simButton, { borderColor: '#4caf50' }]}
                        onPress={() => handleSimulatedScan('bottle')}
                    >
                        <Ionicons name="water-outline" size={24} color="#4caf50" />
                        <Text style={styles.btnText}>BOTELLA</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.simButton, { borderColor: '#ffa726' }]}
                        onPress={() => handleSimulatedScan('can')}
                    >
                        <Ionicons name="beer-outline" size={24} color="#ffa726" />
                        <Text style={styles.btnText}>LATA</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.simButton, { borderColor: '#e53935' }]}
                        onPress={() => handleSimulatedScan('trash')}
                    >
                        <Ionicons name="trash-outline" size={24} color="#e53935" />
                        <Text style={styles.btnText}>BASURA</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    focusFrame: {
        width: width * 0.7,
        height: width * 0.7,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderStyle: 'dashed',
    },
    scanLine: {
        width: width * 0.9,
        height: 2,
        backgroundColor: COLORS.secondary,
        shadowColor: COLORS.secondary,
        shadowOpacity: 1,
        shadowRadius: 10,
        position: 'absolute',
        top: '20%',
    },
    scanText: {
        color: 'rgba(255,255,255,0.7)',
        marginTop: 20,
        letterSpacing: 2,
        fontSize: 12,
    },
    controlsArea: {
        position: 'absolute',
        bottom: 100, // Above tabs
        width: '100%',
        alignItems: 'center',
        zIndex: 10,
    },
    debugTitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 15,
    },
    simButton: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        width: 90,
    },
    btnText: {
        color: '#fff',
        fontSize: 10,
        marginTop: 5,
        fontWeight: 'bold',
    },
    feedbackContainer: {
        position: 'absolute',
        top: '40%',
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 20,
        borderRadius: 20,
        zIndex: 20,
    },
    feedbackText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    feedbackSubText: {
        color: COLORS.highlight,
        fontSize: 12,
        marginTop: 5,
    },
});
