import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSpring,
    withSequence,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeInLeft,
    FadeOut,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { BRAND } from '../constants/theme';
import { rs, rf, rh, rw, SPACING, RADIUS, SCREEN } from '../constants/responsive';
import { SPRING } from '../constants/animations';
import FloatingBubbles from '../components/premium/FloatingBubbles';
import CelebrationModal from '../components/CelebrationModal';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width, height } = Dimensions.get('window');

// Responsive scanner size - adapts to screen
const getScannerSize = () => {
    const baseSize = Math.min(SCREEN.width, SCREEN.height) * 0.7;
    return Math.min(baseSize, 350); // Cap for tablets
};

// ═══════════════════════════════════════════════════════════════════════════
// CORNER BRACKET COMPONENT - Properly positioned at corners
// ═══════════════════════════════════════════════════════════════════════════
const CornerBracket = ({ position, color, size = 28 }) => {
    const thickness = 4;
    const length = size;

    const getPositionStyle = () => {
        switch (position) {
            case 'topLeft':
                return { top: 0, left: 0 };
            case 'topRight':
                return { top: 0, right: 0 };
            case 'bottomLeft':
                return { bottom: 0, left: 0 };
            case 'bottomRight':
                return { bottom: 0, right: 0 };
            default:
                return {};
        }
    };

    const getLineStyles = () => {
        const isTop = position.includes('top');
        const isLeft = position.includes('Left');

        return {
            horizontal: {
                position: 'absolute',
                width: length,
                height: thickness,
                backgroundColor: color,
                borderRadius: thickness / 2,
                [isTop ? 'top' : 'bottom']: 0,
                [isLeft ? 'left' : 'right']: 0,
            },
            vertical: {
                position: 'absolute',
                width: thickness,
                height: length,
                backgroundColor: color,
                borderRadius: thickness / 2,
                [isTop ? 'top' : 'bottom']: 0,
                [isLeft ? 'left' : 'right']: 0,
            },
        };
    };

    const lines = getLineStyles();

    return (
        <View style={[styles.cornerBracket, getPositionStyle()]}>
            <View style={lines.horizontal} />
            <View style={lines.vertical} />
        </View>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCAN BUTTON
// ═══════════════════════════════════════════════════════════════════════════
const ScanButton = ({ icon, color, label, onPress, delay }) => {
    const { colors, isDark } = useTheme();
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.92, SPRING.snappy);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, SPRING.smooth);
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
    };

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Button Background: Gradient for Dark Mode, Solid for Light Mode
    const ButtonBackground = isDark ? LinearGradient : View;
    const buttonProps = isDark ? {
        colors: [BRAND.oceanDeep, '#002844'], // Matching background gradient
        style: [styles.scanButtonInner, { borderColor: color }]
    } : {
        style: [
            styles.scanButtonInner,
            {
                borderColor: color,
                backgroundColor: 'rgba(255,255,255,0.95)',
            }
        ]
    };

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={[styles.scanButton, buttonStyle]}
        >
            <Animated.View entering={FadeInUp.delay(delay).springify()}>
                <ButtonBackground {...buttonProps}>
                    <Ionicons name={icon} size={rs(24)} color={color} />
                </ButtonBackground>
                <Text style={[styles.scanButtonLabel, { color: isDark ? '#fff' : '#1a3a4a' }]}>
                    {label}
                </Text>
            </Animated.View>
        </AnimatedPressable>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUCCESS POPUP
// ═══════════════════════════════════════════════════════════════════════════
const SuccessPopup = ({ visible, points, type }) => {
    const { colors, shadows, isDark } = useTheme();
    const { t } = useLanguage();

    if (!visible) return null;

    const translatedType = type ? t(`scan_type_${type.toLowerCase()}`, type) : type;

    return (
        <Animated.View
            entering={FadeIn.springify()}
            style={[styles.successPopup, { backgroundColor: colors.surface }, shadows.xl]}
        >
            <LinearGradient
                colors={isDark ? [BRAND.oceanLight, BRAND.oceanMid] : [BRAND.success, '#2e7d32']}
                style={styles.successIcon}
            >
                <Ionicons name="checkmark" size={rs(26)} color="#fff" />
            </LinearGradient>
            <View style={styles.successContent}>
                <Text style={[styles.successPoints, { color: colors.text }]}>+{points} TPL</Text>
                <Text style={[styles.successType, { color: colors.textSecondary }]}>
                    {t('scan_detected', { type: translatedType?.toUpperCase() })}
                </Text>
            </View>
        </Animated.View>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION REQUEST SCREEN
// ═══════════════════════════════════════════════════════════════════════════
const PermissionScreen = ({ onRequestPermission, isDark }) => {
    const { t } = useLanguage();
    const waterGradient = isDark
        ? [BRAND.oceanDeep, '#002844', BRAND.oceanMid]
        : ['#1a6b8f', '#2d8ab0', '#4aa3c7'];

    return (
        <View style={styles.container}>
            <LinearGradient colors={waterGradient} style={StyleSheet.absoluteFill} />
            <FloatingBubbles count={12} minSize={4} maxSize={16} zIndex={1} />

            <View style={styles.permissionContainer}>
                <Animated.View
                    entering={FadeIn.springify()}
                    style={[
                        styles.permissionCard,
                        { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.95)' }
                    ]}
                >
                    <View style={[
                        styles.permissionIconContainer,
                        { backgroundColor: isDark ? BRAND.oceanMid : '#e0f2fe' }
                    ]}>
                        <Ionicons
                            name="camera"
                            size={rs(48)}
                            color={isDark ? BRAND.biolum : '#0d4a6f'}
                        />
                    </View>

                    <Text style={[
                        styles.permissionTitle,
                        { color: isDark ? '#fff' : '#1a3a4a' }
                    ]}>
                        {t('scan_camera_permission')}
                    </Text>

                    <Text style={[
                        styles.permissionDescription,
                        { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }
                    ]}>
                        {t('scan_camera_permission_desc')}
                    </Text>

                    <Pressable
                        onPress={onRequestPermission}
                        style={({ pressed }) => [
                            styles.permissionButton,
                            {
                                backgroundColor: isDark ? BRAND.biolum : '#0d4a6f',
                                opacity: pressed ? 0.8 : 1
                            }
                        ]}
                    >
                        <Ionicons name="checkmark-circle" size={rs(20)} color="#fff" />
                        <Text style={styles.permissionButtonText}>{t('scan_permission_allow')}</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ROBOFLOW API CONFIGURATION - Direct API call, no backend needed
// ═══════════════════════════════════════════════════════════════════════════
const ROBOFLOW_API_KEY = 'Ea6ZGPtYBMLo2MM6lh0P';
const ROBOFLOW_MODEL = 'ocean-waste/2';
const ROBOFLOW_URL = `https://serverless.roboflow.com/${ROBOFLOW_MODEL}`;
const SCAN_INTERVAL_MS = 1500; // Scan every 1.5 seconds for real-time detection
const CONFIDENCE_THRESHOLD = 40; // Minimum confidence % to show detection

// Mapeo de clases detectadas a tipos y puntos
// Mapeo de clases detectadas a tipos y puntos
const CLASS_MAPPING = {
    'plastic-bottle': { type: 'bottle', labelKey: 'scan_label_plastic_bottle', points: 5, color: '#22c55e' },
    'bottle': { type: 'bottle', labelKey: 'scan_label_bottle', points: 5, color: '#22c55e' },
    'can': { type: 'can', labelKey: 'scan_label_can', points: 3, color: '#eab308' },
    'plastic': { type: 'trash', labelKey: 'scan_label_plastic', points: 1, color: '#3b82f6' },
    'trash': { type: 'trash', labelKey: 'scan_label_trash', points: 1, color: '#ef4444' },
    'paper': { type: 'trash', labelKey: 'scan_label_paper', points: 1, color: '#a855f7' },
    'cardboard': { type: 'trash', labelKey: 'scan_label_cardboard', points: 1, color: '#f97316' },
    'glass': { type: 'bottle', labelKey: 'scan_label_glass', points: 5, color: '#06b6d4' },
    'metal': { type: 'can', labelKey: 'scan_label_metal', points: 3, color: '#64748b' },
};

// ═══════════════════════════════════════════════════════════════════════════
// DETECTION BOX COMPONENT - Shows bounding box around detected objects
// ═══════════════════════════════════════════════════════════════════════════
const DetectionBox = ({ prediction, frameSize, imageSize }) => {
    const { t } = useLanguage();
    // Convert Roboflow coordinates (center x,y + width,height) to screen position
    const scaleX = frameSize / imageSize.width;
    const scaleY = frameSize / imageSize.height;

    const boxWidth = prediction.width * scaleX;
    const boxHeight = prediction.height * scaleY;
    const left = (prediction.x * scaleX) - (boxWidth / 2);
    const top = (prediction.y * scaleY) - (boxHeight / 2);

    const mapping = CLASS_MAPPING[prediction.class.toLowerCase()] || { label: prediction.class, color: '#22c55e' };
    const label = mapping.labelKey ? t(mapping.labelKey) : (mapping.label || prediction.class);
    const confidence = Math.round(prediction.confidence * 100);

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            style={[
                styles.detectionBox,
                {
                    left,
                    top,
                    width: boxWidth,
                    height: boxHeight,
                    borderColor: mapping.color,
                }
            ]}
        >
            <View style={[styles.detectionLabel, { backgroundColor: mapping.color }]}>
                <Text style={styles.detectionLabelText}>
                    {label} {confidence}%
                </Text>
            </View>
        </Animated.View>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// DETECTION INFO PANEL - Shows friendly summary of detections
// ═══════════════════════════════════════════════════════════════════════════
const DetectionPanel = ({ counts, totalPoints, isDark }) => {
    const { t } = useLanguage();
    if (!counts || Object.keys(counts).length === 0) return null;

    return (
        <Animated.View
            entering={FadeInUp.springify()}
            style={[
                styles.detectionPanel,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)' }
            ]}
        >
            <View style={styles.detectionPanelHeader}>
                <Ionicons name="checkmark-circle" size={rs(20)} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <Text style={[styles.detectionPanelTitle, { color: isDark ? '#fff' : '#1a3a4a' }]}>
                    {t('scan_waste_found')}
                </Text>
            </View>
            <View style={styles.detectionCounts}>
                {Object.entries(counts).map(([className, count]) => {
                    const mapping = CLASS_MAPPING[className.toLowerCase()] || { label: className, color: '#22c55e' };
                    const label = mapping.labelKey ? t(mapping.labelKey) : (mapping.label || className);
                    return (
                        <View key={className} style={styles.detectionCountItem}>
                            <View style={[styles.detectionDot, { backgroundColor: mapping.color }]} />
                            <Text style={[styles.detectionCountText, { color: isDark ? '#e0e0e0' : '#1a3a4a' }]}>
                                {count}x {label}
                            </Text>
                        </View>
                    );
                })}
            </View>
            <View style={[styles.pointsBadge, { backgroundColor: isDark ? BRAND.biolum : '#3b82f6' }]}>
                <Text style={[styles.pointsBadgeText, { color: isDark ? '#001220' : '#fff' }]}>
                    +{totalPoints} TPL
                </Text>
            </View>
        </Animated.View>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// LAST SCAN INFO PANEL - Shows detailed info about the last scanned items
// ═══════════════════════════════════════════════════════════════════════════
const LastScanInfoPanel = ({ scanInfo, isDark, onDismiss }) => {
    const { t } = useLanguage();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768; // Simple breakpoint for desktop/web

    // Auto-dismiss on mobile only
    useEffect(() => {
        if (!isDesktop && scanInfo) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 5000); // 5 seconds as requested
            return () => clearTimeout(timer);
        }
    }, [scanInfo, isDesktop, onDismiss]);

    if (!scanInfo) return null;

    return (
        <Animated.View
            entering={isDesktop ? FadeInLeft.springify() : FadeInUp.springify()}
            exiting={FadeOut}
            style={[
                styles.lastScanPanel,
                {
                    backgroundColor: isDark ? 'rgba(0,18,32,0.95)' : 'rgba(255,255,255,0.98)',
                    // Responsive positioning
                    ...(isDesktop ? {
                        top: 100,
                        left: 20,
                        right: undefined,
                        width: 300,
                        bottom: 100, // Stretch vertically or fixed height? User said "mini list"
                        maxHeight: 500, // Limit height on large screens
                    } : {
                        top: rs(87), // Reverted to original position
                        left: rs(16),
                        right: rs(16),
                        // Mobile: Reverted to original styles (no sticker look, just clean panel)
                        backgroundColor: isDark ? 'rgba(0,18,32,0.95)' : 'rgba(255,255,255,0.98)',
                    })
                }
            ]}
        >
            <View style={styles.lastScanHeader}>
                <View style={styles.lastScanHeaderLeft}>
                    <Ionicons name="checkmark-circle" size={rs(18)} color={isDark ? '#60a5fa' : '#2563eb'} />
                    <Text style={[styles.lastScanTitle, { color: isDark ? '#fff' : '#1a3a4a' }]}>
                        {t('scan_last_scan')}
                    </Text>
                </View>
                {/* Timestamp removed for privacy */}
            </View>

            <View style={styles.lastScanItems}>
                {scanInfo.items.map((item, index) => (
                    <View key={index} style={styles.lastScanItem}>
                        <View style={styles.lastScanItemLeft}>
                            <Text style={[styles.lastScanItemLabel, { color: isDark ? '#e0e0e0' : '#374151' }]}>
                                {item.count}x {item.labelKey ? t(item.labelKey) : item.label}
                            </Text>
                            {/* Display Dimensions instead of just %, or both */}
                            <Text style={[styles.lastScanItemSize, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                                {item.width > 0 && item.height > 0
                                    ? `${t('scan_width')}: ${item.width}px | ${t('scan_height')}: ${item.height}px`
                                    : `${t('scan_size')}: ${item.sizePercent}%`}
                            </Text>
                        </View>
                        <Text style={[styles.lastScanItemPoints, { color: isDark ? '#60a5fa' : '#2563eb' }]}>
                            +{item.points}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={[styles.lastScanTotal, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <Text style={[styles.lastScanTotalLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                    {t('scan_total_objects', { count: scanInfo.totalItems })}
                </Text>
                <Text style={[styles.lastScanTotalPoints, { color: isDark ? '#60a5fa' : '#2563eb' }]}>
                    +{scanInfo.totalPoints} TPL
                </Text>
            </View>

            <Pressable onPress={onDismiss} style={styles.lastScanDismiss}>
                <Ionicons name="close-circle" size={rs(20)} color={isDark ? '#6b7280' : '#9ca3af'} />
            </Pressable>
        </Animated.View>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCAN SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export default function ScanScreen() {
    const { scanItem } = useGame();
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const [lastScanned, setLastScanned] = useState(null);
    const [permission, requestPermission] = useCameraPermissions();

    // AI Scanning states
    const cameraRef = useRef(null);
    const scanIntervalRef = useRef(null);
    const isScanningRef = useRef(false);
    const isReadyToCollectRef = useRef(false);

    const [isScanning, setIsScanningState] = useState(false);
    const [isAutoScanning, setIsAutoScanning] = useState(true);
    const [isReadyToCollect, setIsReadyToCollectState] = useState(false);

    // Helper to update both ref and state
    const setIsScanning = (val) => {
        isScanningRef.current = val;
        setIsScanningState(val);
    };

    const setIsReadyToCollect = (val) => {
        isReadyToCollectRef.current = val;
        setIsReadyToCollectState(val);
    };

    const [detectionResults, setDetectionResults] = useState(null);
    const [scanError, setScanError] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [imageSize, setImageSize] = useState({ width: 640, height: 480 });
    const [lastScanInfo, setLastScanInfo] = useState(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState('');

    const scannerSize = getScannerSize();

    // Scanner line animation
    const scanLineY = useSharedValue(0);
    const pulseOpacity = useSharedValue(0.6);

    useEffect(() => {
        scanLineY.value = withRepeat(
            withTiming(scannerSize - 10, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.6, { duration: 1000 })
            ),
            -1,
            false
        );
    }, [scannerSize]);

    // Continuous scanning effect with locking logic
    useEffect(() => {
        if (permission?.granted && isAutoScanning && cameraRef.current) {
            console.log('Starting continuous scan loop...');

            // Clear existing interval
            if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

            // Start locked scanning interval
            scanIntervalRef.current = setInterval(() => {
                // VERIFICATION LOGIC: Continues scanning to verify object presence
                // Only skip if currently processing a frame (isScanningRef)
                if (!isScanningRef.current && cameraRef.current) {
                    performScan();
                }
            }, SCAN_INTERVAL_MS);

            return () => {
                if (scanIntervalRef.current) {
                    clearInterval(scanIntervalRef.current);
                }
            };
        }
    }, [permission?.granted, isAutoScanning]);

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    // Real-time scan function - calls Roboflow API directly
    const performScan = async () => {
        if (!cameraRef.current || isScanning) return;

        // If locked, we are verifying. If not locked, we are searching.
        setIsScanning(true);

        try {
            // Capture photo from camera
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,  // Lower quality for faster upload
                base64: true,  // Need base64 for Roboflow API
            });

            if (!photo || !photo.base64) {
                console.log('No photo captured');
                return;
            }

            // Store image size
            if (photo.width && photo.height) {
                setImageSize({ width: photo.width, height: photo.height });
            }

            // Get just the base64 data (remove prefix if present)
            let base64Data = photo.base64;
            if (base64Data.startsWith('data:')) {
                base64Data = base64Data.split(',')[1];
            }

            // Call Roboflow API directly
            const response = await fetch(
                `${ROBOFLOW_URL}?api_key=${ROBOFLOW_API_KEY}&confidence=${CONFIDENCE_THRESHOLD}&overlap=50`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: base64Data,
                }
            );

            if (!response.ok) {
                console.log('Roboflow error:', response.status);
                return;
            }

            const data = await response.json();
            let apiPredictions = data.predictions || [];

            // FILTER: Only keep objects fully inside the frame (with margin)
            const margin = 10; // pixels margin from edge
            const imgW = photo.width;
            const imgH = photo.height;

            apiPredictions = apiPredictions.filter(p => {
                const x = p.x;
                const y = p.y;
                const w = p.width;
                const h = p.height;

                const minX = x - w / 2;
                const maxX = x + w / 2;
                const minY = y - h / 2;
                const maxY = y + h / 2;

                // Check if touches borders
                const safelyInside = minX > margin && maxX < (imgW - margin) &&
                    minY > margin && maxY < (imgH - margin);
                return safelyInside;
            });

            // Update predictions for drawing boxes
            setPredictions(apiPredictions);

            if (apiPredictions.length > 0) {
                // ... same calculation logic ...
                // Calculate counts
                const counts = {};
                for (const pred of apiPredictions) {
                    const cls = pred.class;
                    if (cls) {
                        counts[cls] = (counts[cls] || 0) + 1;
                    }
                }

                // Calculate total points with size multiplier
                let totalPoints = 0;
                const detectedItems = [];

                for (const pred of apiPredictions) {
                    const className = pred.class;
                    const mapping = CLASS_MAPPING[className.toLowerCase()] ||
                        { type: 'trash', label: className, points: 5, color: '#3b82f6' };

                    // Size multiplier: larger objects = more points
                    const area = pred.width * pred.height;
                    const imageArea = imageSize.width * imageSize.height;
                    const sizePercent = (area / imageArea) * 100;

                    let sizeMultiplier = 1;
                    if (sizePercent > 20) sizeMultiplier = 3;
                    else if (sizePercent > 10) sizeMultiplier = 2;
                    else if (sizePercent > 5) sizeMultiplier = 1.5;

                    const itemPoints = Math.round(mapping.points * sizeMultiplier);
                    totalPoints += itemPoints;

                    // Check if this item type already exists
                    const existingItem = detectedItems.find(i => i.className === className);
                    if (existingItem) {
                        existingItem.count++;
                        existingItem.points += itemPoints;
                    } else {
                        detectedItems.push({
                            className,
                            count: 1,
                            labelKey: mapping.labelKey,
                            label: mapping.label || className,
                            points: itemPoints,
                            sizePercent: Math.round(sizePercent),
                            width: Math.round(pred.width),
                            height: Math.round(pred.height),
                        });
                    }
                }

                // Calculate counts for panel
                const finalCounts = {};
                for (const item of detectedItems) {
                    finalCounts[item.className] = item.count;
                }

                setDetectionResults({
                    items: detectedItems,
                    totalPoints,
                    count: apiPredictions.length,
                    counts: finalCounts,
                });

                // Mark as ready to collect (LOCK)
                setIsReadyToCollect(true);
            } else {
                // No valid detections found (or object left the screen) -> UNLOCK
                if (isReadyToCollectRef.current) {
                    // Only clear if we were locked, to avoid flickering
                    setPredictions([]);
                    setDetectionResults(null);
                    setIsReadyToCollect(false);
                }
            }

        } catch (error) {
            console.log('Scan error:', error.message);
            // Silent failure for continuous scanning
        } finally {
            setIsScanning(false);
        }
    };

    // Manual collect - awards points for detected items
    const handleCollect = () => {
        if (!isReadyToCollect || !detectionResults || detectionResults.totalPoints <= 0) return;

        const mainType = detectionResults.items[0]?.label || 'Residuo';
        // Pass the actual calculated points to scanItem
        const { unlockedNFT } = scanItem('trash', detectionResults.totalPoints);

        if (unlockedNFT) {
            setCelebrationMessage(`${t('celebration_thanks')}\n\n${t('celebration_nft_unlocked')}\n${unlockedNFT.title}\n\n${t('celebration_see_rewards')}`);
            setShowCelebration(true);
        }

        // Save detailed scan info for the HUD
        setLastScanInfo({
            timestamp: new Date().toLocaleTimeString(),
            items: detectionResults.items.map(item => ({
                label: item.label,
                count: item.count,
                points: item.points,
                sizePercent: item.sizePercent || 0,
                width: item.width || 0,
                height: item.height || 0,
            })),
            totalPoints: detectionResults.totalPoints,
            totalItems: detectionResults.count,
        });

        setLastScanned({
            type: mainType,
            points: detectionResults.totalPoints,
            details: detectionResults.items,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Reset ready state
        setIsReadyToCollect(false);

        // Clear detection boxes but keep lastScanInfo visible
        setTimeout(() => {
            setLastScanned(null);
            setDetectionResults(null);
            setPredictions([]);
        }, 2500);
    };

    // Toggle auto-scanning
    const toggleAutoScan = () => {
        setIsAutoScanning(!isAutoScanning);
        if (!isAutoScanning) {
            setPredictions([]);
            setDetectionResults(null);
        }
    };



    const scannerColor = isDark ? BRAND.biolum : '#0d4a6f';

    // Show permission request screen if permission not granted
    if (!permission) {
        // Still loading permission status
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <LinearGradient
                    colors={isDark ? [BRAND.oceanDeep, '#002844'] : ['#1a6b8f', '#2d8ab0']}
                    style={StyleSheet.absoluteFill}
                />
                <Ionicons name="camera" size={rs(40)} color={isDark ? BRAND.biolum : '#fff'} />
                <Text style={[styles.loadingText, { color: '#fff' }]}>Cargando...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        // Permission not granted, show request UI
        return <PermissionScreen onRequestPermission={requestPermission} isDark={isDark} />;
    }

    // Permission granted - show camera scanner with original design
    const waterGradient = isDark
        ? [BRAND.oceanDeep, '#002844', BRAND.oceanMid]
        : ['#1a6b8f', '#2d8ab0', '#4aa3c7'];

    return (
        <View style={styles.container}>
            {/* Background - same as original */}
            <LinearGradient colors={waterGradient} style={StyleSheet.absoluteFill} />

            {/* Bubbles - same as original */}
            <FloatingBubbles count={12} minSize={4} maxSize={16} zIndex={1} />

            <CelebrationModal
                visible={showCelebration}
                onClose={() => setShowCelebration(false)}
                message={celebrationMessage}
            />

            {/* Status indicator - MOVED OUTSIDE OVERLAY */}
            <Animated.View
                entering={FadeIn.delay(400)}
                style={styles.instructionBox}
            >
                {isReadyToCollect ? (
                    <Ionicons
                        name="checkmark-circle"
                        size={rs(20)}
                        color='#60a5fa'
                    />
                ) : (
                    <ActivityIndicator
                        size="small"
                        color={isDark ? 'rgba(255,255,255,0.8)' : '#fff'}
                    />
                )}
                <Text style={[
                    styles.scanText,
                    {
                        color: isReadyToCollect ? '#60a5fa' : (isDark ? 'rgba(255,255,255,0.8)' : '#fff'),
                        textShadowColor: 'rgba(0,0,0,0.8)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3
                    }
                ]}>
                    {isReadyToCollect
                        ? t('scan_waste_found')
                        : t('scan_searching')}
                </Text>
            </Animated.View>

            {/* Scanner overlay */}
            <View style={styles.scannerOverlay}>
                {/* Scanner Frame with Camera inside */}
                <Animated.View style={[
                    styles.scannerFrame,
                    {
                        width: scannerSize,
                        height: scannerSize,
                        borderColor: isDark ? 'rgba(168,197,212,0.3)' : 'rgba(13,74,111,0.2)',
                        overflow: 'hidden', // Clip camera to frame
                        marginTop: rs(20), // Spacing from text
                    },
                    pulseStyle
                ]}>
                    {/* Camera View - Only visible inside scanner frame */}
                    <CameraView
                        ref={cameraRef}
                        style={styles.cameraInFrame}
                        facing="back"
                    />

                    {/* 4 Corner Brackets - on top of camera */}
                    <View style={styles.cornerOverlay}>
                        <CornerBracket position="topLeft" color={scannerColor} size={rs(32)} />
                        <CornerBracket position="topRight" color={scannerColor} size={rs(32)} />
                        <CornerBracket position="bottomLeft" color={scannerColor} size={rs(32)} />
                        <CornerBracket position="bottomRight" color={scannerColor} size={rs(32)} />
                    </View>

                    {/* Detection Boxes - drawn over detected objects */}
                    {predictions.map((pred, index) => (
                        <DetectionBox
                            key={pred.detection_id || index}
                            prediction={pred}
                            frameSize={scannerSize}
                            imageSize={imageSize}
                        />
                    ))}

                    {/* Scan line - on top of camera */}
                    <Animated.View style={[styles.scanLine, scanLineStyle]}>
                        <LinearGradient
                            colors={[
                                'transparent',
                                isDark ? 'rgba(168,197,212,0.8)' : 'rgba(13,74,111,0.7)',
                                'transparent'
                            ]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.scanLineGradient}
                        />
                    </Animated.View>
                </Animated.View>
            </View>

            {/* Error Message */}
            {scanError && (
                <Animated.View
                    entering={FadeIn.springify()}
                    style={[styles.errorBox, { backgroundColor: 'rgba(239,68,68,0.9)' }]}
                >
                    <Ionicons name="alert-circle" size={rs(18)} color="#fff" />
                    <Text style={styles.errorText}>{scanError}</Text>
                </Animated.View>
            )}



            {/* Success popup */}
            <SuccessPopup
                visible={lastScanned !== null}
                points={lastScanned?.points}
                type={lastScanned?.type}
            />

            {/* Detection Panel - Friendly info display */}
            {detectionResults && !lastScanInfo && (
                <DetectionPanel
                    counts={detectionResults.counts}
                    totalPoints={detectionResults.totalPoints}
                    isDark={isDark}
                />
            )}

            {/* Last Scan Info Panel - Shows after scanning */}
            <LastScanInfoPanel
                scanInfo={lastScanInfo}
                isDark={isDark}
                onDismiss={() => setLastScanInfo(null)}
            />

            {/* Controls area - with extra margin to avoid navbar */}
            <SafeAreaView edges={['bottom']} style={styles.controlsArea}>
                <LinearGradient
                    colors={isDark
                        ? ['transparent', 'rgba(0,18,32,0.95)']
                        : ['transparent', 'rgba(13,74,111,0.95)']
                    }
                    style={[styles.controlsGradient, { paddingBottom: rs(110) }]}
                >
                    {/* Status indicator */}
                    <Animated.View entering={FadeIn.delay(100)} style={styles.statusRow}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: isReadyToCollect ? '#3b82f6' : (isAutoScanning ? '#60a5fa' : '#6b7280') }
                        ]} />
                        <Text style={styles.statusText}>
                            {isReadyToCollect
                                ? t('scan_waste_found')
                                : (isScanning ? t('scan_analyzing') : (isAutoScanning ? t('scan_searching') : t('scan_paused')))}
                        </Text>
                    </Animated.View>

                    {/* Main Collect Button - Only enabled when ready to collect */}
                    <Animated.View entering={FadeInUp.delay(100).springify()}>
                        <Pressable
                            onPress={handleCollect}
                            disabled={!isReadyToCollect}
                            style={({ pressed }) => [
                                styles.aiScanButton,
                                {
                                    backgroundColor: isReadyToCollect
                                        ? (isDark ? '#3b82f6' : '#2563eb')
                                        : 'rgba(100,100,100,0.3)',
                                    opacity: pressed ? 0.8 : 1,
                                    transform: [{ scale: pressed ? 0.95 : 1 }],
                                }
                            ]}
                        >
                            <Ionicons
                                name="scan"
                                size={rs(32)}
                                color="#fff"
                            />
                            <Text style={[styles.aiScanButtonText, { color: '#fff' }]}>
                                {isReadyToCollect
                                    ? `${t('scan_button')} +${detectionResults?.totalPoints || 0} TPL`
                                    : t('scan_paused')}
                            </Text>
                        </Pressable>
                    </Animated.View>

                    {/* Toggle auto-scan */}
                    <View style={styles.controlButtonRow}>
                        <Pressable
                            onPress={toggleAutoScan}
                            style={({ pressed }) => [
                                styles.toggleButton,
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                        >
                            <Ionicons
                                name={isAutoScanning ? "pause" : "play"}
                                size={rs(18)}
                                color="#fff"
                            />
                            <Text style={styles.toggleButtonText}>
                                {isAutoScanning ? t('scan_auto_pause') : t('scan_auto_resume')}
                            </Text>
                        </Pressable>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-start',
        // Mobile: Push scanner down ensuring it's below the info panel
        paddingTop: rh(230), // Raised 5px as requested
        alignItems: 'center',
        zIndex: 2,
    },
    scannerFrame: {
        borderWidth: 1.5,
        borderRadius: RADIUS.md,
        position: 'relative',
    },
    cornerBracket: {
        position: 'absolute',
        width: rs(32),
        height: rs(32),
    },
    scanLine: {
        position: 'absolute',
        left: rs(8),
        right: rs(8),
        height: rs(3),
    },
    scanLineGradient: {
        flex: 1,
        borderRadius: rs(2),
    },
    instructionBox: {
        position: 'absolute',
        top: rh(30),
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(8),
        alignSelf: 'center',
        justifyContent: 'center',
    },
    scanText: {
        fontSize: rf(16),
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    controlsArea: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    controlsGradient: {
        paddingTop: SPACING.xxl,
        paddingBottom: rh(90),
        paddingHorizontal: SPACING.lg,
    },
    debugTitle: {
        fontSize: rf(10),
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: SPACING.md,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.lg,
    },
    scanButton: {
        alignItems: 'center',
    },
    scanButtonInner: {
        width: rs(64),
        height: rs(64),
        borderRadius: rs(32),
        borderWidth: 2.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButtonLabel: {
        marginTop: SPACING.xs,
        fontSize: rf(11),
        fontWeight: '600',
    },
    successPopup: {
        position: 'absolute',
        top: rh(100),
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        paddingRight: SPACING.xl,
        borderRadius: RADIUS.xl,
        zIndex: 100,
    },
    successIcon: {
        width: rs(46),
        height: rs(46),
        borderRadius: rs(23),
        justifyContent: 'center',
        alignItems: 'center',
    },
    successContent: {
        marginLeft: SPACING.md,
    },
    successPoints: {
        fontSize: rf(18),
        fontWeight: '800',
    },
    successType: {
        fontSize: rf(10),
        marginTop: rs(2),
        letterSpacing: 1,
    },
    // Loading screen styles
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: rf(14),
        fontWeight: '500',
    },
    // Permission screen styles
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        zIndex: 10,
    },
    permissionCard: {
        width: '100%',
        maxWidth: rs(320),
        padding: SPACING.xl,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
    },
    permissionIconContainer: {
        width: rs(80),
        height: rs(80),
        borderRadius: rs(40),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    permissionTitle: {
        fontSize: rf(20),
        fontWeight: '700',
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    permissionDescription: {
        fontSize: rf(14),
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: rf(20),
    },
    permissionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(8),
        paddingVertical: rs(14),
        paddingHorizontal: rs(24),
        borderRadius: RADIUS.lg,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: rf(15),
        fontWeight: '600',
    },
    // Camera overlay styles
    cameraOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
    },
    overlaySection: {
        width: '100%',
    },
    middleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sideOverlay: {
        flex: 1,
    },
    instructionContainer: {
        position: 'absolute',
        top: '65%',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    // Camera inside scanner frame
    cameraInFrame: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: RADIUS.md,
    },
    cornerOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
    },
    // AI Scan button styles
    aiScanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rs(12),
        alignSelf: 'center',
        paddingVertical: rs(16),
        paddingHorizontal: rs(40),
        borderRadius: rs(30),
        marginBottom: SPACING.lg,
        minWidth: rs(180),
        minHeight: rs(60),
    },
    aiScanButtonText: {
        fontSize: rf(16),
        fontWeight: '700',
        letterSpacing: 2,
    },
    // Error and scanning indicators
    errorBox: {
        position: 'absolute',
        top: rh(15), // Moved to very top
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(8),
        paddingVertical: rs(12),
        paddingHorizontal: rs(20),
        borderRadius: RADIUS.lg,
        zIndex: 100,
    },
    errorText: {
        color: '#fff',
        fontSize: rf(13),
        fontWeight: '600',
    },
    scanningBox: {
        position: 'absolute',
        top: rh(15), // Moved to very top
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(10),
        paddingVertical: rs(12),
        paddingHorizontal: rs(20),
        borderRadius: RADIUS.lg,
        zIndex: 100,
    },
    scanningText: {
        fontSize: rf(13),
        fontWeight: '600',
    },
    // Detection Box styles
    detectionBox: {
        position: 'absolute',
        borderWidth: 2,
        borderRadius: 4,
        zIndex: 10,
    },
    detectionLabel: {
        position: 'absolute',
        top: -22,
        left: -2,
        paddingHorizontal: rs(6),
        paddingVertical: rs(2),
        borderRadius: 4,
    },
    detectionLabelText: {
        color: '#fff',
        fontSize: rf(10),
        fontWeight: '700',
    },
    // Detection Panel styles
    detectionPanel: {
        position: 'absolute',
        top: rh(120),
        alignSelf: 'center',
        paddingVertical: rs(12),
        paddingHorizontal: rs(16),
        borderRadius: RADIUS.lg,
        zIndex: 90,
        minWidth: rs(180),
    },
    detectionPanelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(6),
        marginBottom: rs(8),
    },
    detectionPanelTitle: {
        fontSize: rf(15),
        fontWeight: '700',
    },
    detectionCounts: {
        gap: rs(4),
        marginBottom: rs(10),
    },
    detectionCountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(6),
    },
    detectionDot: {
        width: rs(8),
        height: rs(8),
        borderRadius: rs(4),
    },
    detectionCountText: {
        fontSize: rf(13),
    },
    pointsBadge: {
        alignSelf: 'center',
        paddingVertical: rs(6),
        paddingHorizontal: rs(16),
        borderRadius: rs(20),
    },
    pointsBadgeText: {
        fontSize: rf(14),
        fontWeight: '700',
    },
    // Discrete test button
    discreteTestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(4),
        alignSelf: 'center',
        marginTop: rs(8),
    },
    discreteTestText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: rf(11),
    },
    // Status indicator
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rs(6),
        marginBottom: rs(12),
    },
    statusDot: {
        width: rs(8),
        height: rs(8),
        borderRadius: rs(4),
    },
    statusText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: rf(12),
    },
    // Control button row
    controlButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rs(20),
        marginTop: rs(12),
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(6),
        paddingVertical: rs(8),
        paddingHorizontal: rs(16),
        borderRadius: rs(20),
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    toggleButtonText: {
        color: '#fff',
        fontSize: rf(12),
        fontWeight: '600',
    },
    // Last Scan Info Panel styles
    lastScanPanel: {
        position: 'absolute',
        top: rs(100),
        left: rs(16),
        right: rs(16),
        borderRadius: RADIUS.md,
        padding: rs(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    lastScanHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: rs(10),
    },
    lastScanHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(6),
    },
    lastScanTitle: {
        fontSize: rf(14),
        fontWeight: '700',
    },
    lastScanTime: {
        fontSize: rf(11),
    },
    lastScanItems: {
        gap: rs(6),
    },
    lastScanItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: rs(4),
    },
    lastScanItemLeft: {
        flex: 1,
    },
    lastScanItemLabel: {
        fontSize: rf(13),
        fontWeight: '500',
    },
    lastScanItemSize: {
        fontSize: rf(10),
        marginTop: rs(2),
    },
    lastScanItemPoints: {
        fontSize: rf(14),
        fontWeight: '700',
    },
    lastScanTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: rs(10),
        paddingTop: rs(10),
        borderTopWidth: 1,
    },
    lastScanTotalLabel: {
        fontSize: rf(12),
    },
    lastScanTotalPoints: {
        fontSize: rf(16),
        fontWeight: '800',
    },
    lastScanDismiss: {
        position: 'absolute',
        top: rs(8),
        right: rs(8),
        padding: rs(4),
    },
});
