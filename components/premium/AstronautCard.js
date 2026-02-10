import React, { useEffect, useRef, useState } from 'react';
import { Animated, Linking, Easing, View, StyleSheet, Image, Text, Pressable, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../context/LanguageContext';

const SocialCard = () => {
    // Animation for the astronaut (Move)
    const moveAnim = useRef(new Animated.Value(0)).current;
    const { t } = useLanguage();

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(moveAnim, {
                    toValue: 1,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(moveAnim, {
                    toValue: 2,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(moveAnim, {
                    toValue: 3,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(moveAnim, {
                    toValue: 0,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [moveAnim]);

    // Interpolation of movements
    const translateY = moveAnim.interpolate({
        inputRange: [0, 1, 2, 3],
        outputRange: [0, -15, 15, -18],
    });

    const translateX = moveAnim.interpolate({
        inputRange: [0, 1, 2, 3],
        outputRange: [0, -15, -15, 15],
    });

    const rotate = moveAnim.interpolate({
        inputRange: [0, 1, 3],
        outputRange: ['0deg', '-10deg', '10deg'],
    });

    return (
        <View style={styles.container}>
            {/* Outer Border with Gradient/Color */}
            <View style={styles.outerBorder}>
                <View style={styles.cardContainer}>
                    {/* Backgrounds */}
                    <View style={styles.glowBackground} />
                    <StarField />

                    <View style={styles.cardContent}>
                        {/* Purple Glow behind text/image area */}
                        <View style={styles.purpleGlow} />

                        <Animated.Image
                            source={{ uri: 'https://uiverse.io/astronaut.png' }}
                            resizeMode="contain"
                            style={[
                                styles.astronautImage,
                                {
                                    transform: [
                                        { translateY },
                                        { translateX },
                                        { rotate }
                                    ]
                                }
                            ]}
                        />

                        <Text style={styles.heading}>{t('astro_coming_soon')}</Text>
                        <Text style={styles.subText}>{t('astro_follow_us')}</Text>

                        <View style={styles.iconsRow}>
                            <SocialButton
                                url="https://twitter.com/LimpiaPlayadev"
                                color="#000000" // X Icon Color
                                iconPath="M19.8003 3L13.5823 10.105L19.9583 19.106C20.3923 19.719 20.6083 20.025 20.5983 20.28C20.594 20.3896 20.5657 20.4969 20.5154 20.5943C20.4651 20.6917 20.3941 20.777 20.3073 20.844C20.1043 21 19.7293 21 18.9793 21H17.2903C16.8353 21 16.6083 21 16.4003 20.939C16.2168 20.8847 16.0454 20.7957 15.8953 20.677C15.7253 20.544 15.5943 20.358 15.3313 19.987L10.6813 13.421L4.64033 4.894C4.20733 4.281 3.99033 3.975 4.00033 3.72C4.00478 3.61035 4.03323 3.50302 4.08368 3.40557C4.13414 3.30812 4.20536 3.22292 4.29233 3.156C4.49433 3 4.87033 3 5.62033 3H7.30833C7.76333 3 7.99033 3 8.19733 3.061C8.38119 3.1152 8.55295 3.20414 8.70333 3.323C8.87333 3.457 9.00433 3.642 9.26733 4.013L13.5833 10.105M4.05033 21L10.6823 13.421"
                                viewBox="0 0 24 24"
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

// --- ANIMATED BUTTON COMPONENT ---
const SocialButton = ({ url, color, iconPath, viewBox }) => {
    const [pressed, setPressed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(scaleAnim, {
            toValue: pressed ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
        }).start();
    }, [pressed]);

    const backgroundScale = scaleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 4] // Expands to fill button
    });

    const iconScale = scaleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.25]
    });

    const openLink = () => {
        Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
    };

    return (
        <Pressable
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={openLink}
            style={styles.pressable}
        >
            <View style={styles.iconWrapper}>
                {/* White background that grows on press */}
                <Animated.View
                    style={[
                        styles.animatedIconBackground,
                        {
                            transform: [{ scale: backgroundScale }],
                            opacity: pressed ? 1 : 0
                        }
                    ]}
                />
                {/* Icon that changes color and size */}
                <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                    <Svg width={24} height={24} viewBox={viewBox} fill="none">
                        <Path
                            d={iconPath}
                            stroke={pressed ? color : "#808080"}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </Animated.View>
            </View>
        </Pressable>
    );
};

// --- STAR FIELD COMPONENT ---
// Recreating the CSS star field with absolute positioned Views
const Star = ({ top, left, opacity }) => (
    <View style={[styles.star, { top, left, opacity }]} />
);

const StarSmall = ({ top, left }) => (
    <View style={[styles.starSmall, { top, left }]} />
);

const StarField = () => (
    <View style={StyleSheet.absoluteFill}>
        <Star top={20} left={140} opacity={0.8} />
        <Star top={120} left={70} opacity={0.6} />
        <Star top={80} left={280} opacity={0.9} />
        <Star top={230} left={280} opacity={0.5} />
        <Star top={350} left={250} opacity={0.7} />
        <Star top={180} left={420} opacity={0.8} />
        <Star top={50} left={520} opacity={0.4} />
        <Star top={330} left={490} opacity={0.6} />
        <Star top={300} left={420} opacity={0.5} />

        <StarSmall top={100} left={200} />
        <StarSmall top={250} left={100} />
        <StarSmall top={40} left={40} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent', // Let parent handle bg
    },
    outerBorder: {
        padding: 3,
        borderRadius: 20,
        backgroundColor: '#2a2a2a', // Outer border color
    },
    cardContainer: {
        width: 300,
        height: 400,
        borderRadius: 20,
        backgroundColor: '#171717',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#171717',
    },
    cardContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 16,
        zIndex: 1,
    },
    astronautImage: {
        width: 192,
        height: 192,
        marginBottom: 20,
        zIndex: 5,
    },
    heading: {
        color: 'white',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        fontWeight: 'bold',
        fontSize: 18,
        letterSpacing: 0.5,
        zIndex: 2,
        marginBottom: 5,
        textAlign: 'center'
    },
    subText: {
        color: '#a8c5d4', // biolum equivalent
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        zIndex: 2,
        fontWeight: '600',
    },
    purpleGlow: {
        position: 'absolute',
        top: '35%',
        left: '30%',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f9f9fb',
        opacity: 0.1,
        zIndex: -1,
        shadowColor: '#872ad3',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
        elevation: 10,
    },
    iconsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    pressable: {
        // padding handled by wrapper
    },
    iconWrapper: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden', // Changed to hidden so the white bg doesn't spill out visibly square-ish
        borderRadius: 20, // Make wrapper round
    },
    animatedIconBackground: {
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: 'white',
        borderRadius: 20,
        top: 14, // Center manually (40-12)/2 = 14
        left: 14,
        zIndex: -1,
        elevation: 5,
    },
    star: {
        position: 'absolute',
        width: 2,
        height: 2,
        backgroundColor: 'white',
        borderRadius: 1,
    },
    starSmall: {
        position: 'absolute',
        width: 1,
        height: 1,
        backgroundColor: 'white',
        opacity: 0.5,
    },
});

export default SocialCard;
