import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Inspirational quotes about nature and environment
const QUOTES = [
    "Cada gota de agua limpia es un regalo para el futuro.",
    "El océano nos da vida, nosotros le damos esperanza.",
    "No heredamos la tierra de nuestros padres, la tomamos prestada de nuestros hijos.",
    "La naturaleza no necesita de nosotros. Nosotros necesitamos de ella.",
    "Un pequeño acto de bondad puede crear olas infinitas.",
    "El planeta no necesita más personas exitosas. Necesita más pacificadores, sanadores y restauradores.",
    "La Tierra es lo que todos tenemos en común.",
    "Tus acciones de hoy son el legado de mañana.",
];

// Dark/Blue gradient palettes matching app theme
const GRADIENT_PALETTES = [
    ['#00334e', '#145374'],              // Deep Navy to Steel Blue
    ['#0a1628', '#1a3a52'],              // Dark Navy
    ['#171717', '#2d2d2d'],              // Dark Gray
    ['#0d1b2a', '#1b263b', '#415a77'],   // Navy Gradient
    ['#1a1a2e', '#16213e', '#0f3460'],   // Midnight Blue
    ['#2c3e50', '#3d5a73'],              // Slate Blue
    ['#1c1c1c', '#363636', '#4a4a4a'],   // Charcoal Gray
    ['#001f3f', '#003366', '#004080'],   // Ocean Blue
];

export default function NFTDetailModal({ visible, nft, onClose, index }) {
    if (!nft) return null;

    const gradientIndex = (index || 0) % GRADIENT_PALETTES.length;
    const gradient = GRADIENT_PALETTES[gradientIndex];
    const quoteIndex = (index || 0) % QUOTES.length;
    const quote = QUOTES[quoteIndex];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientHeader}
                    >
                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>

                        {/* Watermark */}
                        <View style={styles.watermark}>
                            <Svg width={60} height={60} viewBox="0 0 100 100">
                                <Path
                                    d="M50 0 Q80 50 100 70 Q100 100 50 100 Q0 100 0 70 Q20 50 50 0 Z"
                                    fill="#fff"
                                    opacity={0.2}
                                />
                            </Svg>
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>{nft.title}</Text>
                        <Text style={styles.type}>{nft.type}</Text>
                    </LinearGradient>

                    {/* Quote Section */}
                    <View style={styles.quoteSection}>
                        <Text style={styles.quoteText}>"{quote}"</Text>
                    </View>

                    {/* Details Section */}
                    <View style={styles.detailsSection}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Fecha de Expedición</Text>
                            <Text style={styles.detailValue}>{nft.date}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Bloqueado Hasta</Text>
                            <Text style={styles.detailValueLocked}>{nft.lockedUntil}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Valor en Puntos</Text>
                            <Text style={styles.detailValue}>{nft.price} PTS</Text>
                        </View>

                        {/* Hash ID */}
                        {nft.hash && (
                            <View style={styles.hashRow}>
                                <Text style={styles.detailLabel}>Token ID</Text>
                                <Text style={styles.hashValue} numberOfLines={1}>
                                    {nft.hash.slice(0, 10)}...{nft.hash.slice(-8)}
                                </Text>
                            </View>
                        )}

                        <View style={styles.divider} />

                        {/* Owner Section */}
                        <View style={styles.ownerSection}>
                            {nft.ownerAvatar ? (
                                <Image
                                    source={{ uri: nft.ownerAvatar }}
                                    style={styles.ownerAvatarImage}
                                />
                            ) : (
                                <View style={styles.ownerAvatar}>
                                    <Text style={styles.ownerAvatarText}>{nft.ownerInitials || 'OG'}</Text>
                                </View>
                            )}
                            <View style={styles.ownerInfo}>
                                <Text style={styles.ownerLabel}>Propietario</Text>
                                <Text style={styles.ownerName}>{nft.owner || 'Ocean Guardian'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.impactSection}>
                            <Text style={styles.impactTitle}>Tu Impacto</Text>
                            <Text style={styles.impactText}>
                                Con este NFT ayudaste a mantener limpia una playa y proteger la vida marina. ¡Gracias!
                            </Text>
                        </View>
                    </View>

                    {/* Close Action */}
                    <TouchableOpacity style={styles.actionButton} onPress={onClose}>
                        <LinearGradient
                            colors={[COLORS.secondary, COLORS.primary]}
                            style={styles.actionGradient}
                        >
                            <Text style={styles.actionText}>CERRAR</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.9,
        maxHeight: height * 0.8,
        backgroundColor: '#0a1520',
        borderRadius: 24,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    gradientHeader: {
        padding: 30,
        alignItems: 'center',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    watermark: {
        position: 'absolute',
        top: 20,
        left: 20,
        opacity: 0.5,
    },
    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 20,
        textAlign: 'center',
    },
    type: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        letterSpacing: 2,
        marginTop: 5,
    },
    quoteSection: {
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderLeftWidth: 3,
        borderLeftColor: COLORS.secondary,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 8,
    },
    quoteText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 22,
    },
    detailsSection: {
        padding: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    detailLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    detailValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    detailValueLocked: {
        color: COLORS.error || '#e53935',
        fontSize: 14,
        fontWeight: 'bold',
    },
    hashRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    hashValue: {
        color: COLORS.secondary,
        fontSize: 11,
        fontFamily: 'monospace',
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 15,
    },
    impactSection: {
        alignItems: 'center',
    },
    impactTitle: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    impactText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
    actionButton: {
        margin: 20,
        borderRadius: 25,
        overflow: 'hidden',
    },
    actionGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    ownerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    ownerAvatar: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    ownerAvatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    ownerAvatarImage: {
        width: 45,
        height: 45,
        borderRadius: 23,
        marginRight: 15,
        borderWidth: 2,
        borderColor: COLORS.secondary,
    },
    ownerInfo: {
        flex: 1,
    },
    ownerLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    ownerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 2,
    },
});
