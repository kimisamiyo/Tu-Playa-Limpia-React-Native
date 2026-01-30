import Scoreboard from '../components/Scoreboard';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import NFTMiniCard from '../components/NFTMiniCard';
import NFTDetailModal from '../components/NFTDetailModal';
import LivingWater from '../components/LivingWater';
import CelebrationModal from '../components/CelebrationModal';
import NFTCarouselCelebration from '../components/NFTCarouselCelebration';

const { width } = Dimensions.get('window');

export default function RewardsScreen() {
    const { nfts, points, unlockNFT, user } = useGame();
    const [celebrationVisible, setCelebrationVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [carouselVisible, setCarouselVisible] = useState(false);
    const [hasShownCarousel, setHasShownCarousel] = useState(false);

    // Trigger carousel celebration when reaching 8 NFTs for the first time
    useEffect(() => {
        if (nfts.length >= 8 && !hasShownCarousel) {
            setCarouselVisible(true);
            setHasShownCarousel(true);
        }
    }, [nfts.length]);

    const handleRedeem = () => {
        if (points >= 100) {
            const natures = ['Ocean', 'Forest', 'Mountain', 'River'];
            const randomNature = natures[Math.floor(Math.random() * natures.length)];

            unlockNFT({
                title: `Nature Spirit: ${randomNature}`,
                type: 'Guardian',
                price: '100',
                image: randomNature
            });
            setCelebrationVisible(true);
        } else {
            alert("Necesitas 100 puntos para canjear una recompensa.");
        }
    };

    const handleNFTPress = (nft, index) => {
        setSelectedNFT(nft);
        setSelectedIndex(index);
        setDetailModalVisible(true);
    };

    const renderNFTItem = ({ item, index }) => (
        <NFTMiniCard
            nft={item}
            index={index}
            onPress={() => handleNFTPress(item, index)}
        />
    );

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
                <Text style={styles.headerTitle}>Mi Colección</Text>
                <Scoreboard points={points} nftCount={nfts.length} />

                {/* Redemption Button */}
                <TouchableOpacity style={styles.redeemButton} onPress={handleRedeem}>
                    <LinearGradient
                        colors={[COLORS.secondary, COLORS.primary]}
                        style={styles.redeemGradient}
                    >
                        <Text style={styles.redeemText}>CANJEAR RECOMPENSA (100 PTS)</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* NFT Gallery Grid */}
            {nfts.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Aún no tienes recompensas.</Text>
                    <Text style={styles.emptySub}>¡Escanea basura para salvar al océano!</Text>
                </View>
            ) : (
                <FlatList
                    data={nfts}
                    renderItem={renderNFTItem}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Celebration Modal */}
            <CelebrationModal
                visible={celebrationVisible}
                onClose={() => setCelebrationVisible(false)}
            />

            {/* NFT Detail Modal */}
            <NFTDetailModal
                visible={detailModalVisible}
                nft={selectedNFT}
                index={selectedIndex}
                onClose={() => setDetailModalVisible(false)}
            />

            {/* Carousel Celebration (8+ NFTs) */}
            <NFTCarouselCelebration
                visible={carouselVisible}
                onClose={() => setCarouselVisible(false)}
                nfts={nfts}
                userName={user?.name}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.highlight,
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    redeemButton: {
        marginTop: 15,
        borderRadius: 25,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    redeemGradient: {
        paddingVertical: 12,
        paddingHorizontal: 30,
    },
    redeemText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    gridContainer: {
        padding: 10,
        paddingBottom: 120, // Space for Bottom Tab
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyEmoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptySub: {
        color: COLORS.accent,
        fontSize: 14,
    }
});
