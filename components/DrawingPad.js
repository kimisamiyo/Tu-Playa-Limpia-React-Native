import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    FadeIn,
    FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { rs, rf, SPACING } from '../constants/responsive';
import { SPRING } from '../constants/animations';
import { BRAND } from '../constants/theme';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export function extractBehavioralFingerprint(strokes) {
    if (!strokes || strokes.length === 0) return '';
    const allPoints = strokes.flatMap(s => s);
    if (allPoints.length < 3) return '';
    // ── 1. Exact stroke count
    const strokeCount = strokes.length;
    // ── 2. Coarse aspect ratio (3 bins)
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of allPoints) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    const bboxW = Math.max(maxX - minX, 1);
    const bboxH = Math.max(maxY - minY, 1);
    const aspectRatio = bboxW / bboxH;
    const arBin = aspectRatio < 0.6 ? 'T' : aspectRatio < 1.7 ? 'S' : 'W';
    let totalDist = 0;
    for (const stroke of strokes) {
        for (let i = 1; i < stroke.length; i++) {
            const dx = stroke[i].x - stroke[i - 1].x;
            const dy = stroke[i].y - stroke[i - 1].y;
            totalDist += Math.sqrt(dx * dx + dy * dy);
        }
    }
    const diag = Math.sqrt(bboxW * bboxW + bboxH * bboxH);
    const normDist = totalDist / Math.max(diag, 1);
    const cxBin = normDist < 4 ? 'S' : normDist < 12 ? 'M' : 'C';
    const orientations = [];
    for (const stroke of strokes) {
        if (stroke.length < 2) { orientations.push('P'); continue; }
        let pathLen = 0;
        for (let i = 1; i < stroke.length; i++) {
            const dx = stroke[i].x - stroke[i - 1].x;
            const dy = stroke[i].y - stroke[i - 1].y;
            pathLen += Math.sqrt(dx * dx + dy * dy);
        }
        const sdx = stroke[stroke.length - 1].x - stroke[0].x;
        const sdy = stroke[stroke.length - 1].y - stroke[0].y;
        const endDist = Math.sqrt(sdx * sdx + sdy * sdy);
        const closedness = endDist / Math.max(pathLen, 1);
        if (closedness < 0.35) {
            orientations.push('C');
        } else {
            const absDx = Math.abs(sdx);
            const absDy = Math.abs(sdy);
            const ratio = Math.min(absDx, absDy) / Math.max(absDx, absDy, 1);
            if (ratio < 0.5) {
                orientations.push(absDx > absDy ? 'H' : 'V');
            } else {
                orientations.push('D');
            }
        }
    }
    const strokeInfos = orientations.map((orient, idx) => {
        const stroke = strokes[idx];
        const cx = stroke.reduce((s, p) => s + p.x, 0) / stroke.length;
        const cy = stroke.reduce((s, p) => s + p.y, 0) / stroke.length;
        const normY = (cy - minY) / Math.max(bboxH, 1);
        const normX = (cx - minX) / Math.max(bboxW, 1);
        return { orient, normY, normX };
    });
    strokeInfos.sort((a, b) => {
        if (Math.abs(a.normY - b.normY) > 0.15) return a.normY - b.normY;
        return a.normX - b.normX; 
    });
    const orientSig = strokeInfos.map(s => s.orient).join('');
    return `${strokeCount}-${arBin}-${cxBin}-${orientSig}`;
}
/**
 * Convert strokes array to SVG path data for rendering
 */
function strokesToPath(stroke) {
    if (!stroke || stroke.length < 2) return '';
    let d = `M ${stroke[0].x} ${stroke[0].y}`;
    for (let i = 1; i < stroke.length; i++) {
        // Use quadratic bezier for smoothness
        if (i < stroke.length - 1) {
            const midX = (stroke[i].x + stroke[i + 1].x) / 2;
            const midY = (stroke[i].y + stroke[i + 1].y) / 2;
            d += ` Q ${stroke[i].x} ${stroke[i].y} ${midX} ${midY}`;
        } else {
            d += ` L ${stroke[i].x} ${stroke[i].y}`;
        }
    }
    return d;
}
// ═══════════════════════════════════════════════════════════════════════════
// CONFIRM BUTTON - Animated button to submit drawing
// ═══════════════════════════════════════════════════════════════════════════
const ConfirmButton = ({ onPress, label, disabled, isDark }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    return (
        <AnimatedPressable
            onPressIn={() => { scale.value = withSpring(0.95, SPRING.snappy); }}
            onPressOut={() => { scale.value = withSpring(1, SPRING.snappy); }}
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.confirmButton,
                {
                    backgroundColor: isDark ? BRAND.oceanLight : BRAND.oceanDark,
                    opacity: disabled ? 0.4 : 1,
                },
                animStyle,
            ]}
        >
            <Text style={styles.confirmButtonText}>{label}</Text>
            <Ionicons name="checkmark-circle" size={rs(20)} color="#fff" />
        </AnimatedPressable>
    );
};
// ═══════════════════════════════════════════════════════════════════════════
// CLEAR BUTTON
// ═══════════════════════════════════════════════════════════════════════════
const ClearButton = ({ onPress, label, isDark, colors }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    return (
        <AnimatedPressable
            onPressIn={() => { scale.value = withSpring(0.95, SPRING.snappy); }}
            onPressOut={() => { scale.value = withSpring(1, SPRING.snappy); }}
            onPress={onPress}
            style={[
                styles.clearButton,
                {
                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                },
                animStyle,
            ]}
        >
            <Ionicons name="refresh-outline" size={rs(16)} color={colors.textSecondary} />
            <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>{label}</Text>
        </AnimatedPressable>
    );
};
// ═══════════════════════════════════════════════════════════════════════════
// MAIN DRAWING PAD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function DrawingPad({
    onSubmit,
    confirmLabel = 'Confirmar',
    clearLabel = 'Limpiar',
    hintText = 'Dibuja un patrón que puedas recordar',
    strokeCountLabel = 'trazos',
    minStrokes = 1,
}) {
    const { colors, isDark } = useTheme();
    const { width: winW, height: winH } = useWindowDimensions();
    const { canvasWidth, canvasHeight, maxCardWidth } = useMemo(() => {
        const isDesktop = winW >= 1024;
        const isTablet = winW >= 600 && winW < 1024;
        const horizontalPad = rs(64);
        let w, h, maxCard;
        if (isDesktop) {
            w = Math.min(winW * 0.3, 420);
            h = Math.min(winH * 0.35, w * 0.85);
            maxCard = w + rs(32);
        } else if (isTablet) {
            w = Math.min(winW - horizontalPad, 400);
            h = Math.min(winH * 0.3, w * 0.85);
            maxCard = w + rs(32);
        } else {
            w = Math.min(winW - horizontalPad, rs(320));
            h = Math.min(winH * 0.30, w * 0.85);
            maxCard = w + rs(32);
        }
        return { canvasWidth: w, canvasHeight: h, maxCardWidth: maxCard };
    }, [winW, winH]);
    const [strokes, setStrokes] = useState([]);
    const [currentStroke, setCurrentStroke] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const layoutRef = useRef({ x: 0, y: 0, width: 300, height: 255 });
    const counterScale = useSharedValue(1);
    const counterStyle = useAnimatedStyle(() => ({
        transform: [{ scale: counterScale.value }],
    }));
    const getRelativePosition = useCallback((pageX, pageY) => {
        const layout = layoutRef.current;
        return {
            x: Math.max(0, Math.min(pageX - layout.x, layout.width)),
            y: Math.max(0, Math.min(pageY - layout.y, layout.height)),
        };
    }, []);
    const handleTouchStart = useCallback((e) => {
        const touch = e.nativeEvent;
        const pos = getRelativePosition(touch.pageX, touch.pageY);
        setCurrentStroke([pos]);
        setIsDrawing(true);
    }, [getRelativePosition]);
    const handleTouchMove = useCallback((e) => {
        if (!isDrawing) return;
        const touch = e.nativeEvent;
        const pos = getRelativePosition(touch.pageX, touch.pageY);
        setCurrentStroke(prev => [...prev, pos]);
    }, [isDrawing, getRelativePosition]);
    const handleTouchEnd = useCallback(() => {
        if (currentStroke.length >= 2) {
            setStrokes(prev => [...prev, currentStroke]);
            counterScale.value = withSequence(
                withSpring(1.3, { damping: 8, stiffness: 400 }),
                withSpring(1, SPRING.snappy)
            );
            if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        }
        setCurrentStroke([]);
        setIsDrawing(false);
    }, [currentStroke, counterScale]);
    const handleClear = useCallback(() => {
        setStrokes([]);
        setCurrentStroke([]);
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    }, []);
    const handleSubmit = useCallback(() => {
        if (strokes.length < minStrokes) return;
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        onSubmit?.(strokes);
    }, [strokes, minStrokes, onSubmit]);
    const handleLayout = useCallback((e) => {
        if (containerRef.current) {
            containerRef.current.measureInWindow?.((x, y, width, height) => {
                if (typeof x === 'number') {
                    layoutRef.current = { x, y, width, height };
                }
            });
        }
    }, []);
    const handleContainerLayout = useCallback((e) => {
        const { width, height } = e.nativeEvent.layout;
        setTimeout(() => {
            if (containerRef.current?.measureInWindow) {
                containerRef.current.measureInWindow((x, y, w, h) => {
                    if (typeof x === 'number') {
                        layoutRef.current = { x, y, width: w || width, height: h || height };
                    }
                });
            }
        }, 100);
    }, []);
    useEffect(() => {
        if (Platform.OS !== 'web') return;
        const node = containerRef.current;
        const el = node && (node._nativeTag ? document.getElementById(String(node._nativeTag)) : node);
        if (!el?.addEventListener) return;
        const prevent = (e) => { e.preventDefault(); };
        el.addEventListener('touchstart', prevent, { passive: false });
        el.addEventListener('touchmove', prevent, { passive: false });
        return () => {
            el.removeEventListener('touchstart', prevent);
            el.removeEventListener('touchmove', prevent);
        };
    }, []);
    const totalStrokes = strokes.length;
    const canSubmit = totalStrokes >= minStrokes;
    const getStrokeColor = (index) => {
        if (isDark) {
            const hues = ['#64d2ff', '#5ac8fa', '#48bfe3', '#56cfe1', '#72efdd'];
            return hues[index % hues.length];
        }
        const hues = ['#0d4a6f', '#0a5c75', '#0d6e8a', '#1a8f9f', '#00334e'];
        return hues[index % hues.length];
    };
    const currentStrokeColor = isDark ? '#a8c5d4' : '#0d5c75';
    return (
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.container}>
            {}
            <View style={[
                styles.canvasCard,
                {
                    maxWidth: maxCardWidth,
                    backgroundColor: isDark
                        ? 'rgba(10, 31, 46, 0.75)'
                        : 'rgba(255, 255, 255, 0.95)',
                    borderColor: isDark
                        ? 'rgba(100, 210, 255, 0.2)'
                        : 'rgba(0, 51, 78, 0.12)',
                },
            ]}>
                {}
                <View style={styles.canvasHeader}>
                    <View style={styles.canvasHeaderLeft}>
                        <View style={[styles.statusDot, {
                            backgroundColor: isDrawing
                                ? BRAND.seaweed
                                : (canSubmit ? BRAND.oceanLight : isDark ? '#4a6575' : '#9ca3af'),
                        }]} />
                        <Text style={[styles.canvasLabel, { color: colors.textMuted }]}>
                            {isDrawing ? '● ' : ''}CANVAS
                        </Text>
                    </View>
                    <Animated.View style={[styles.strokeCounter, counterStyle]}>
                        <Text style={[styles.strokeCountText, {
                            color: canSubmit
                                ? (isDark ? BRAND.oceanLight : BRAND.oceanDark)
                                : colors.textMuted,
                        }]}>
                            {totalStrokes} {strokeCountLabel}
                        </Text>
                    </Animated.View>
                </View>
                {/* SVG Drawing Surface */}
                <View
                    ref={containerRef}
                    onLayout={handleContainerLayout}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onStartShouldSetResponderCapture={() => true}
                    onMoveShouldSetResponderCapture={() => true}
                    onResponderGrant={handleTouchStart}
                    onResponderMove={handleTouchMove}
                    onResponderRelease={handleTouchEnd}
                    onResponderTerminate={handleTouchEnd}
                    style={[
                        styles.svgContainer,
                        {
                            height: canvasHeight,
                            backgroundColor: isDark
                                ? 'rgba(0, 18, 32, 0.6)'
                                : 'rgba(245, 243, 239, 0.8)',
                            borderColor: isDark
                                ? 'rgba(100, 210, 255, 0.1)'
                                : 'rgba(0, 51, 78, 0.06)',
                        },
                        // Prevent browser pull-to-refresh and scroll on touch devices
                        Platform.OS === 'web' && { touchAction: 'none', userSelect: 'none' },
                    ]}
                >
                    <Svg width="100%" height="100%">
                        {}
                        <Defs>
                            <SvgGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={isDark ? '#64d2ff' : '#0d5c75'} stopOpacity="1" />
                                <Stop offset="1" stopColor={isDark ? '#48bfe3' : '#1a8f9f'} stopOpacity="1" />
                            </SvgGradient>
                        </Defs>
                        {}
                        {Array.from({ length: 5 }).map((_, row) =>
                            Array.from({ length: 5 }).map((_, col) => (
                                <Circle
                                    key={`dot-${row}-${col}`}
                                    cx={((col + 1) / 6) * canvasWidth}
                                    cy={((row + 1) / 6) * canvasHeight}
                                    r={1.5}
                                    fill={isDark ? 'rgba(100,210,255,0.12)' : 'rgba(0,51,78,0.08)'}
                                />
                            ))
                        )}
                        {}
                        {strokes.map((stroke, i) => (
                            <Path
                                key={`stroke-${i}`}
                                d={strokesToPath(stroke)}
                                fill="none"
                                stroke={getStrokeColor(i)}
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={0.9}
                            />
                        ))}
                        {}
                        {currentStroke.length >= 2 && (
                            <Path
                                d={strokesToPath(currentStroke)}
                                fill="none"
                                stroke={currentStrokeColor}
                                strokeWidth={3.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={0.7}
                                strokeDasharray="none"
                            />
                        )}
                        {}
                        {currentStroke.length >= 1 && (
                            <Circle
                                cx={currentStroke[0].x}
                                cy={currentStroke[0].y}
                                r={4}
                                fill={currentStrokeColor}
                                opacity={0.5}
                            />
                        )}
                    </Svg>
                    {}
                    {strokes.length === 0 && !isDrawing && (
                        <View style={styles.emptyHintContainer}>
                            <Ionicons
                                name="finger-print-outline"
                                size={rs(40)}
                                color={isDark ? 'rgba(100,210,255,0.15)' : 'rgba(0,51,78,0.08)'}
                            />
                            <Text style={[styles.emptyHint, {
                                color: isDark ? 'rgba(168,197,212,0.35)' : 'rgba(0,51,78,0.2)',
                            }]}>
                                {hintText}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            {}
            <View style={[styles.buttonRow, { maxWidth: maxCardWidth }]}>
                <ClearButton
                    onPress={handleClear}
                    label={clearLabel}
                    isDark={isDark}
                    colors={colors}
                />
                <ConfirmButton
                    onPress={handleSubmit}
                    label={confirmLabel}
                    disabled={!canSubmit}
                    isDark={isDark}
                />
            </View>
        </Animated.View>
    );
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
    },
    canvasCard: {
        width: '100%',
        borderRadius: rs(20),
        borderWidth: 1,
        padding: rs(12),
        overflow: 'hidden',
    },
    canvasHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: rs(8),
        paddingHorizontal: rs(4),
    },
    canvasHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(6),
    },
    statusDot: {
        width: rs(6),
        height: rs(6),
        borderRadius: rs(3),
    },
    canvasLabel: {
        fontSize: rf(10),
        fontWeight: '700',
        letterSpacing: rs(2),
    },
    strokeCounter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    strokeCountText: {
        fontSize: rf(12),
        fontWeight: '600',
    },
    svgContainer: {
        width: '100%',
        borderRadius: rs(14),
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    emptyHintContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    emptyHint: {
        fontSize: rf(12),
        fontWeight: '500',
        marginTop: rs(8),
        textAlign: 'center',
        letterSpacing: rs(0.5),
        maxWidth: '70%',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: rs(12),
        marginTop: rs(16),
        width: '100%',
        justifyContent: 'center',
    },
    confirmButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rs(8),
        height: rs(48),
        borderRadius: rs(14),
        shadowColor: BRAND.oceanDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: rf(15),
        fontWeight: '700',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rs(6),
        height: rs(48),
        paddingHorizontal: rs(20),
        borderRadius: rs(14),
        borderWidth: 1,
    },
    clearButtonText: {
        fontSize: rf(13),
        fontWeight: '600',
    },
});
