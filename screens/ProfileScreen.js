import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Image, Alert, Dimensions, Modal, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useGame } from '../context/GameContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import LivingWater from '../components/LivingWater';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const scale = width / 375; // Base design on iPhone X width

export default function ProfileScreen({ navigation }) {
    const { user, updateUserProfile, nfts, points, level, scannedItems } = useGame();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user.name);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Show success toast
    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2500);
    };

    // Pick image from gallery
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso Requerido', 'Necesitamos acceso a tu galería para cambiar la foto de perfil.');
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

    // Take photo with camera
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso Requerido', 'Necesitamos acceso a tu cámara para tomar una foto.');
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

    // Handle username change - Direct save without confirmation dialog
    const handleSaveName = () => {
        console.log('=== handleSaveName START ===');
        console.log('Current user.name:', user.name);
        console.log('New name to save:', newName);
        console.log('hasChangedUsername:', user.hasChangedUsername);

        // Already changed check
        if (user.hasChangedUsername) {
            Alert.alert(
                'Cambio No Permitido',
                'Solo puedes cambiar tu nombre de usuario una vez por razones de seguridad Web3.'
            );
            setIsEditingName(false);
            return;
        }

        // Validate length
        const trimmedName = newName.trim();
        if (trimmedName.length < 3) {
            Alert.alert('Nombre Inválido', 'El nombre debe tener al menos 3 caracteres.');
            return;
        }

        // Same name check
        if (trimmedName === user.name) {
            setIsEditingName(false);
            return;
        }

        // Direct save - no confirmation dialog
        console.log('=== SAVING NAME ===', trimmedName);
        updateUserProfile({ name: trimmedName });
        setIsEditingName(false);
        showSuccess('Nombre guardado');
        console.log('=== handleSaveName END ===');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, '#00101a']}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.bgContainer}>
                <LivingWater />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header with Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Profile Picture */}
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={() => setShowImagePicker(true)}
                >
                    {user.avatar ? (
                        <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitials}>{user.initials}</Text>
                        </View>
                    )}
                    <View style={styles.editBadge}>
                        <Ionicons name="camera" size={16} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* Username */}
                <View style={styles.nameContainer}>
                    {isEditingName ? (
                        <View style={styles.editNameContainer}>
                            <TextInput
                                style={styles.nameInput}
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="Nuevo nombre"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                maxLength={20}
                                autoFocus={true}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    console.log('Save button pressed');
                                    handleSaveName();
                                }}
                                style={styles.saveButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="checkmark" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setNewName(user.name);
                                    setIsEditingName(false);
                                }}
                                style={styles.cancelButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => !user.hasChangedUsername && setIsEditingName(true)}
                            style={styles.nameDisplay}
                        >
                            <Text style={styles.userName}>{user.name}</Text>
                            {!user.hasChangedUsername && (
                                <Ionicons name="pencil" size={16} color={COLORS.secondary} style={{ marginLeft: 10 }} />
                            )}
                        </TouchableOpacity>
                    )}
                    {user.hasChangedUsername && (
                        <Text style={styles.nameLockedHint}>Nombre bloqueado (ya cambiado)</Text>
                    )}
                </View>

                {/* Level Badge */}
                <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>NIVEL {level}</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{nfts.length}</Text>
                        <Text style={styles.statLabel}>NFTs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{points}</Text>
                        <Text style={styles.statLabel}>Puntos</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{scannedItems.total}</Text>
                        <Text style={styles.statLabel}>Escaneos</Text>
                    </View>
                </View>

                {/* Profile Info Cards */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Información Privada</Text>

                    <View style={styles.infoCard}>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Fecha de Registro</Text>
                            <Text style={styles.infoValue}>{user.joinDate}</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <Ionicons name="wallet-outline" size={20} color={COLORS.secondary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Wallet Web3</Text>
                            <Text style={styles.infoValue}>
                                {user.walletAddress || 'No conectada'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.connectButton}>
                            <Text style={styles.connectText}>CONECTAR</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoCard}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.secondary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Seguridad</Text>
                            <Text style={styles.infoValue}>Cuenta Verificada</Text>
                        </View>
                    </View>
                </View>

                {/* Privacy Notice */}
                <View style={styles.privacyNotice}>
                    <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.privacyText}>
                        Tu información es privada y segura. Solo se comparte lo necesario para validar tus NFTs en la blockchain.
                    </Text>
                </View>

            </ScrollView>

            {/* Image Picker Modal */}
            <Modal
                visible={showImagePicker}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cambiar Foto de Perfil</Text>

                        <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
                            <Ionicons name="camera" size={24} color={COLORS.secondary} />
                            <Text style={styles.modalOptionText}>Tomar Foto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
                            <Ionicons name="images" size={24} color={COLORS.secondary} />
                            <Text style={styles.modalOptionText}>Elegir de Galería</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setShowImagePicker(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Success Toast - Card Style */}
            {showSuccessToast && (
                <View style={styles.toastCard}>
                    <View style={styles.toastIconBox}>
                        <LinearGradient
                            colors={[COLORS.accent, COLORS.secondary]}
                            style={styles.toastIconGradient}
                        >
                            <Ionicons name="checkmark" size={20} color="#fff" />
                        </LinearGradient>
                    </View>
                    <View style={styles.toastTextBox}>
                        <Text style={styles.toastTitle}>Tu Playa Limpia</Text>
                        <Text style={styles.toastMessage}>{successMessage}</Text>
                    </View>
                </View>
            )}
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
    scrollContent: {
        padding: Math.max(16, 20 * scale),
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25 * scale,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: Math.max(18, 20 * scale),
        fontWeight: 'bold',
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    avatarImage: {
        width: Math.min(120, width * 0.3),
        height: Math.min(120, width * 0.3),
        borderRadius: Math.min(60, width * 0.15),
        borderWidth: 3,
        borderColor: COLORS.secondary,
    },
    avatarPlaceholder: {
        width: Math.min(120, width * 0.3),
        height: Math.min(120, width * 0.3),
        borderRadius: Math.min(60, width * 0.15),
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarInitials: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    nameContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    nameDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    editNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameInput: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        color: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: Math.max(16, 18 * scale),
        minWidth: Math.max(120, width * 0.35),
        textAlign: 'center',
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    saveButton: {
        marginLeft: 10,
        backgroundColor: COLORS.secondary,
        width: 44, // Apple HIG minimum touch target
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        marginLeft: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameLockedHint: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        marginTop: 5,
    },
    levelBadge: {
        alignSelf: 'center',
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 25,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 25,
    },
    levelText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 2,
    },
    statsGrid: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 5,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    infoSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: COLORS.highlight,
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    infoContent: {
        flex: 1,
        marginLeft: 15,
    },
    infoLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        textTransform: 'uppercase',
    },
    infoValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    connectButton: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    connectText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    privacyNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
    },
    privacyText: {
        flex: 1,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginLeft: 10,
        lineHeight: 18,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        marginBottom: 10,
    },
    modalOptionText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 15,
    },
    modalCancel: {
        marginTop: 10,
        padding: 15,
        alignItems: 'center',
    },
    modalCancelText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
    },
    // Success Toast
    successToast: {
        position: 'absolute',
        top: 80,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    // Card-style Toast
    toastCard: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: '#353535',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    toastIconBox: {
        width: 50,
        height: 50,
        borderRadius: 10,
        overflow: 'hidden',
    },
    toastIconGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastTextBox: {
        flex: 1,
        marginLeft: 12,
    },
    toastTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    toastMessage: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 2,
    },
});
