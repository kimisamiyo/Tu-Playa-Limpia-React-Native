import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useGame } from '../context/GameContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RewardsScreen from '../screens/RewardsScreen';
import AuthScreen from '../components/AuthScreen';
import ScanScreen from '../screens/ScanScreen';
import PromotionsScreen from '../screens/PromotionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnimatedTabIcon from './AnimatedTabIcon';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Locked Screen Placeholder
function LockedPromotionsScreen({ navigation }) {
    return (
        <View style={styles.lockedContainer}>
            {/* Darkened Preview Background */}
            <View style={styles.lockedOverlay} />

            {/* Lock Content */}
            <View style={styles.lockContent}>
                <Text style={styles.lockEmoji}>🔒</Text>
                <Text style={styles.lockTitle}>Promociones Bloqueadas</Text>
                <Text style={styles.lockDesc}>
                    Alcanza Nivel 2 (8 NFTs) para desbloquear
                </Text>
                <Text style={styles.lockHint}>
                    ¡Sigue escaneando basura y canjeando recompensas!
                </Text>
            </View>

            {/* Preview Cards (Blurred/Darkened) */}
            <View style={styles.previewContainer}>
                {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.previewCard}>
                        <View style={styles.previewBadge} />
                        <View style={styles.previewLine} />
                        <View style={styles.previewLineShort} />
                    </View>
                ))}
            </View>
        </View>
    );
}

// Tab Icon with Lock indicator
function LockedTabIcon({ name, size, color, focused, isLocked }) {
    return (
        <View style={styles.tabIconContainer}>
            <Ionicons
                name={name}
                size={size}
                color={isLocked ? 'rgba(255,255,255,0.3)' : color}
            />
            {isLocked && (
                <View style={styles.lockBadge}>
                    <Text style={styles.lockBadgeText}>🔒</Text>
                </View>
            )}
        </View>
    );
}

// Custom Tab Bar Design
function TabNavigator() {
    const { level } = useGame();
    const isPromotionsLocked = level < 2;

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarActiveTintColor: COLORS.text,
                tabBarInactiveTintColor: COLORS.textLight,
                lazy: false,
            }}
        >
            <Tab.Screen
                name="Inicio"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon name="home" size={24} color={color} focused={focused} />
                    )
                }}
            />

            <Tab.Screen
                name="Escanear"
                component={ScanScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon name="scan" size={24} color={color} focused={focused} />
                    )
                }}
            />

            <Tab.Screen
                name="Premios"
                component={RewardsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon name="trophy" size={24} color={color} focused={focused} />
                    )
                }}
            />

            <Tab.Screen
                name="Promos"
                component={isPromotionsLocked ? LockedPromotionsScreen : PromotionsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <LockedTabIcon
                            name="gift"
                            size={24}
                            color={color}
                            focused={focused}
                            isLocked={isPromotionsLocked}
                        />
                    )
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator({ isAuthenticated, onAuthSuccess }) {
    if (!isAuthenticated) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
                <Stack.Screen name="Auth">
                    {props => <AuthScreen {...props} onAuthenticated={onAuthSuccess} />}
                </Stack.Screen>
            </Stack.Navigator>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ animation: 'slide_from_right' }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        elevation: 0,
        backgroundColor: COLORS.primary,
        borderRadius: 35,
        height: 70,
        ...SHADOWS.medium,
        borderTopWidth: 0,
        paddingBottom: 0,
        paddingTop: 0,
        justifyContent: 'center',
        opacity: 0.98,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockBadge: {
        position: 'absolute',
        top: -5,
        right: -8,
    },
    lockBadgeText: {
        fontSize: 10,
    },
    // Locked Screen Styles
    lockedContainer: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    lockContent: {
        alignItems: 'center',
        zIndex: 10,
        padding: 30,
    },
    lockEmoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    lockTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    lockDesc: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 5,
    },
    lockHint: {
        color: COLORS.secondary,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
    },
    previewContainer: {
        position: 'absolute',
        bottom: 150,
        left: 20,
        right: 20,
        opacity: 0.3,
    },
    previewCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        height: 80,
    },
    previewBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 40,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
    },
    previewLine: {
        width: '60%',
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 6,
        marginBottom: 8,
    },
    previewLineShort: {
        width: '40%',
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 5,
    },
});
