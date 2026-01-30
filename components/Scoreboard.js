import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle, Path, Rect } from 'react-native-svg';
import { COLORS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

// 1. Reverted to "Organic" Droplet (The one user liked)
const WaterDroplet = ({ width, height, color }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 100 100" style={{ opacity: 0.8 }}>
            <Defs>
                <RadialGradient
                    id="grad"
                    cx="30%"
                    cy="30%"
                    rx="70%"
                    ry="70%"
                    fx="30%"
                    fy="30%"
                    gradientUnits="userSpaceOnUse"
                >
                    <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" stopOpacity="0.3" />
                    <Stop offset="40%" stopColor="#000" stopOpacity="0.8" />
                    <Stop offset="100%" stopColor="#000" stopOpacity="1" />
                </RadialGradient>
            </Defs>
            {/* Organic/Wobbly Path */}
            <Path
                d="M50 5 Q80 5 90 30 Q100 55 80 85 Q50 100 20 85 Q0 55 10 30 Q20 5 50 5 Z"
                fill="url(#grad)"
            />
            {/* Soft Reflection Highlight */}
            <Circle cx="30" cy="30" r="10" fill="rgba(255,255,255,0.4)" />
        </Svg>
    );
};

export default function Scoreboard({ points, nftCount }) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: 2500, easing: Easing.linear }),
            -1, false
        );
    }, []);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`
    }));

    return (
        <View style={styles.container}>

            {/* Background "Diffused" Strip using Radial Gradient for rounded fade */}
            <View style={styles.blurStrip}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <RadialGradient
                            id="backGrad"
                            cx="50%"
                            cy="50%"
                            rx="50%"
                            ry="50%"
                            fx="50%"
                            fy="50%"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0%" stopColor="rgba(0, 26, 46, 0.65)" stopOpacity="0.65" />
                            <Stop offset="45%" stopColor="rgba(0, 26, 46, 0.3)" stopOpacity="0.3" />
                            <Stop offset="100%" stopColor="rgba(0, 16, 26, 0)" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#backGrad)" />
                </Svg>
            </View>

            <View style={styles.teams}>

                {/* --- TEAM HOME (Puntos) --- */}
                <View style={styles.teamHomeWrapper}>
                    <View style={styles.teamHome}>
                        {/* Organic Droplets (Dark "Ewyes") */}
                        <View style={styles.dropletTL}>
                            <WaterDroplet width={40} height={40} color="#001122" />
                        </View>
                        <View style={styles.dropletBR}>
                            <WaterDroplet width={30} height={30} color="#001122" />
                        </View>

                        <View style={styles.contentHome}>
                            <Text style={styles.teamLabel}>PUNTOS</Text>
                            <Text style={styles.teamValue}>{points}</Text>
                        </View>
                    </View>
                </View>

                {/* --- CENTER (Scoreboard) --- */}
                <View style={styles.scoreboard}>
                    <LinearGradient
                        colors={['#1e1e1e', '#1a1419', '#0c0c0c']}
                        style={styles.scoreboardInner}
                    >
                        <View style={styles.timeContainer}>
                            <Text style={styles.clock}>NIVEL 1</Text>
                            <View style={styles.dotsTrack}>
                                <Animated.View style={[styles.dotsBar, progressStyle]} />
                            </View>
                        </View>

                        <View style={styles.scoreDisplay}>
                            <Text style={styles.scoreHome}>{points}</Text>
                            <Text style={styles.scoreSep}>-</Text>
                            <Text style={styles.scoreAway}>{nftCount}</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* --- TEAM AWAY (NFTs) --- */}
                <View style={styles.teamAwayWrapper}>
                    <View style={styles.teamAway}>
                        {/* Organic Droplets (Dark "Eyes") */}
                        <View style={styles.dropletTR}>
                            <WaterDroplet width={40} height={40} color="#001122" />
                        </View>
                        <View style={styles.dropletBL}>
                            <WaterDroplet width={30} height={30} color="#001122" />
                        </View>

                        <View style={styles.contentAway}>
                            <Text style={styles.teamLabel}>NFTS</Text>
                            <Text style={styles.teamValue}>{nftCount}</Text>
                        </View>
                    </View>
                </View>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        width: width * 0.95,
        position: 'relative',
    },
    // The horizontal diffuse background (Radial)
    blurStrip: {
        position: 'absolute',
        top: -40, bottom: -40, left: -40, right: -40, // Increased space for smoother fade
        zIndex: 0,
        // Scaling horizontally creates the "Pill" shape from the Radial Circle
        transform: [{ scaleX: 1.3 }, { scaleY: 1.2 }],
        opacity: 0.8,
    },
    teams: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    // WRAPPERS 
    teamHomeWrapper: {
        zIndex: 1,
        marginRight: -18,
    },
    teamAwayWrapper: {
        zIndex: 1,
        marginLeft: -18,
    },

    // SHAPES
    teamHome: {
        backgroundColor: '#00384a',
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 10,
        transform: [{ skewX: '25deg' }],
        borderLeftWidth: 1,
        borderLeftColor: COLORS.secondary,
        overflow: 'hidden',
        minWidth: 110,
        alignItems: 'center',
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },
    teamAway: {
        backgroundColor: '#00384a',
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 30,
        transform: [{ skewX: '-25deg' }],
        borderRightWidth: 1,
        borderRightColor: COLORS.secondary,
        overflow: 'hidden',
        minWidth: 110,
        alignItems: 'center',
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },

    // CONTENT 
    contentHome: {
        transform: [{ skewX: '-25deg' }],
        alignItems: 'center',
        zIndex: 5,
    },
    contentAway: {
        transform: [{ skewX: '25deg' }],
        alignItems: 'center',
        zIndex: 5,
    },

    // TEXT
    teamLabel: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 2,
    },
    teamValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // DROPLET POSITIONS (Based on ::after/::before locations logic)
    dropletTL: {
        position: 'absolute',
        top: -10, left: -6,
        opacity: 0.9,
    },
    dropletBR: {
        position: 'absolute',
        bottom: -6, right: -6,
        opacity: 0.7,
    },
    dropletTR: {
        position: 'absolute',
        top: -10, right: -6,
        opacity: 0.9,
    },
    dropletBL: {
        position: 'absolute',
        bottom: -6, left: -6,
        opacity: 0.7,
    },

    // CENTER BOARD
    scoreboard: {
        zIndex: 10,
        borderRadius: 12,
        transform: [{ translateY: -3 }],
        ...SHADOWS.medium,
        shadowColor: '#000',
        width: 100,
    },
    scoreboardInner: {
        borderRadius: 12,
        padding: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        paddingVertical: 6,
    },
    timeContainer: {
        alignItems: 'center',
        marginBottom: 4,
        width: '100%',
    },
    clock: {
        color: '#a1a1a1',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 3,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    dotsTrack: {
        width: 40,
        height: 3,
        backgroundColor: '#333',
        borderRadius: 2,
        overflow: 'hidden',
    },
    dotsBar: {
        height: '100%',
        backgroundColor: COLORS.secondary,
        width: '30%',
    },
    scoreDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreHome: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.secondary,
    },
    scoreSep: {
        fontSize: 16,
        color: '#555',
        marginHorizontal: 6,
        fontWeight: 'bold',
    },
    scoreAway: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.secondary,
    }
});
