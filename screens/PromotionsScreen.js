import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { COLORS, SHADOWS } from '../constants/theme';
import LivingWater from '../components/LivingWater';

const { width } = Dimensions.get('window');

// Sample promotions data
const PROMOTIONS = [
    {
        id: 1,
        title: '20% Descuento en Eco-Tienda',
        description: 'Válido en productos sostenibles',
        discount: '20%',
        validUntil: '31/03/2026',
        partner: 'EcoStore',
        color: ['#134e5e', '#71b280'],
    },
    {
        id: 2,
        title: 'Tour Gratis de Limpieza',
        description: 'Únete a nuestro próximo evento',
        discount: 'GRATIS',
        validUntil: '15/02/2026',
        partner: 'Clean Ocean Co.',
        color: ['#0f2027', '#203a43', '#2c5364'],
    },
    {
        id: 3,
        title: '2x1 en Snorkel Experience',
        description: 'Descubre la vida marina',
        discount: '2x1',
        validUntil: '28/02/2026',
        partner: 'AquaAdventures',
        color: ['#1a2a6c', '#b21f1f', '#fdbb2d'],
    },
    {
        id: 4,
        title: 'Café Sostenible Gratis',
        description: 'Un café por cada 5 NFTs',
        discount: 'GRATIS',
        validUntil: '30/04/2026',
        partner: 'Green Café',
        color: ['#3a1c71', '#d76d77', '#ffaf7b'],
    },
];

function PromotionCard({ promo }) {
    return (
        <TouchableOpacity activeOpacity={0.9}>
            <View style={styles.cardContainer}>
                <LinearGradient
                    colors={promo.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    {/* Discount Badge */}
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{promo.discount}</Text>
                    </View>

                    {/* Content */}
                    <View style={styles.cardContent}>
                        <Text style={styles.partnerName}>{promo.partner}</Text>
                        <Text style={styles.promoTitle}>{promo.title}</Text>
                        <Text style={styles.promoDesc}>{promo.description}</Text>
                        <Text style={styles.validUntil}>Válido hasta: {promo.validUntil}</Text>
                    </View>

                    {/* Use Button */}
                    <TouchableOpacity style={styles.useButton}>
                        <Text style={styles.useButtonText}>USAR</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
}

export default function PromotionsScreen() {
    const { user, level } = useGame();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, '#00101a']}
                style={StyleSheet.absoluteFill}
            />
            {/* Background Animation */}
            <View style={styles.bgContainer}>
                <LivingWater />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Promociones Especiales</Text>
                <Text style={styles.headerSub}>
                    ¡Hola {user?.name}! Nivel {level}
                </Text>
                <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>NIVEL {level}</Text>
                </View>
            </View>

            {/* Promotions List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>Ofertas Exclusivas</Text>
                {PROMOTIONS.map((promo) => (
                    <PromotionCard key={promo.id} promo={promo} />
                ))}

                {/* More Coming */}
                <View style={styles.moreSection}>
                    <Text style={styles.moreText}>¡Más promociones próximamente!</Text>
                    <Text style={styles.moreSub}>Sigue coleccionando NFTs para desbloquear más</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.2,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    headerSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    levelBadge: {
        marginTop: 10,
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 15,
    },
    levelText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 2,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    sectionTitle: {
        color: COLORS.highlight,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardContainer: {
        marginBottom: 15,
        borderRadius: 16,
        ...SHADOWS.medium,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        minHeight: 150,
        justifyContent: 'space-between',
    },
    discountBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    discountText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    cardContent: {
        flex: 1,
    },
    partnerName: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 5,
    },
    promoTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    promoDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        marginBottom: 10,
    },
    validUntil: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
    },
    useButton: {
        alignSelf: 'flex-start',
        marginTop: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    useButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    moreSection: {
        alignItems: 'center',
        marginTop: 30,
        padding: 20,
    },
    moreEmoji: {
        fontSize: 40,
        marginBottom: 10,
    },
    moreText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    moreSub: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        marginTop: 5,
        textAlign: 'center',
    },
});
