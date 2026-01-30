import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useGame } from '../context/GameContext';
import Water from '../components/Water';

export default function HomeScreen() {
    const navigation = useNavigation();
    const { user, points, nfts, level } = useGame();

    // Get current date in Spanish
    const today = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateString = today.toLocaleDateString('es-ES', options);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hola, {user.name.split(' ')[0]}</Text>
                        <Text style={styles.date}>{dateString}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.avatar}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        {user.avatar ? (
                            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarInitials}>{user.initials}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Main Card */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Balance Total</Text>
                    <Text style={styles.cardValue}>1,240.50 TPL</Text>
                    <View style={styles.cardRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>+12% esta semana</Text>
                        </View>
                    </View>
                </View>

                {/* Action Grid */}
                <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                <View style={styles.grid}>
                    <ActionItem icon="scan-outline" label="Escanear" />
                    <ActionItem icon="map-outline" label="Mapa" />
                    <ActionItem icon="stats-chart-outline" label="Impacto" />
                    <ActionItem icon="trophy-outline" label="Ranking" />
                </View>

            </ScrollView>
            <View style={styles.waterWrapper}>
                {/* Re-use water but maybe with different opacity/color in the future */}
                <Water />
            </View>
        </SafeAreaView>
    );
}

const ActionItem = ({ icon, label }) => (
    <View style={styles.actionItem}>
        <View style={styles.iconBox}>
            <Ionicons name={icon} size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SIZES.padding,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    greeting: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    date: {
        fontSize: SIZES.caption,
        color: COLORS.textDim,
        marginTop: 4,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: COLORS.highlight,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 45,
        height: 45,
        borderRadius: 25,
    },
    avatarInitials: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
        padding: 30,
        marginBottom: 30,
        ...SHADOWS.medium,
    },
    cardLabel: {
        color: COLORS.accent,
        fontSize: SIZES.caption,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardValue: {
        color: COLORS.textLight,
        fontSize: 36,
        fontWeight: '700',
        marginVertical: 10,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    badgeText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: SIZES.h3,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionItem: {
        width: '47%',
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: 20,
        ...SHADOWS.light,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionLabel: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    waterWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0, right: 0,
        height: 100,
        zIndex: -1,
        opacity: 0.5,
    }
});
