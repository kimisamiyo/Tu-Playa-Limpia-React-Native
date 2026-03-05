import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateNFTAttributes } from '../utils/nftGenerator';
const GameContext = createContext();
export const useGame = () => useContext(GameContext);
const GAME_KEYS = {
    POINTS: '@tpl_game_points',
    ITEMS: '@tpl_game_items',
    NFTS: '@tpl_game_nfts',
    USER: '@tpl_game_user_meta',
};
export const GameProvider = ({ children }) => {
    const [points, setPoints] = useState(0);
    const [scannedItems, setScannedItems] = useState({ bottles: 0, cans: 0, total: 0 });
    const [nfts, setNfts] = useState([]);
    const [level, setLevel] = useState(1);
    const [user, setUser] = useState({
        name: 'Ocean Guardian',
        avatar: null,
        initials: 'OG',
        hasChangedUsername: false,
        tplTitle: 'Cleanup Rookie',
    });
    const loadGameState = async () => {
        try {
            const [storedPoints, storedItems, storedNfts, storedUser] = await Promise.all([
                AsyncStorage.getItem(GAME_KEYS.POINTS),
                AsyncStorage.getItem(GAME_KEYS.ITEMS),
                AsyncStorage.getItem(GAME_KEYS.NFTS),
                AsyncStorage.getItem(GAME_KEYS.USER),
            ]);
            if (storedPoints) setPoints(parseInt(storedPoints));
            if (storedItems) setScannedItems(JSON.parse(storedItems));
            if (storedUser) setUser(prev => ({ ...prev, ...JSON.parse(storedUser) }));

            if (storedNfts) {
                // AsyncStorage tiene datos — usarlos directamente
                setNfts(JSON.parse(storedNfts));
            } else {
                // AsyncStorage vacío → intentar recuperar desde MongoDB
                console.log('📦 AsyncStorage vacío, buscando NFTs en MongoDB...');
                try {
                    const userData = storedUser ? JSON.parse(storedUser) : null;
                    const walletAddress = userData?.walletAddress;
                    if (walletAddress) {
                        const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://tu-playa-limpia.vercel.app';
                        const resp = await fetch(`${appUrl}/api/nfts?wallet=${walletAddress}`);
                        if (resp.ok) {
                            const { nfts: backupNfts } = await resp.json();
                            if (backupNfts && backupNfts.length > 0) {
                                // Reconstruir objetos NFT mínimos desde el registro de MongoDB
                                const recovered = backupNfts.map(n => ({
                                    id: n.nftLocalId || n._id,
                                    hash: n.txHash,
                                    txHash: n.txHash,
                                    claimed: true,
                                    date: new Date(n.mintedAt).toLocaleDateString(),
                                    lockedUntil: new Date(new Date(n.mintedAt).getTime() + 86400000 * 30).toLocaleDateString(),
                                    owner: 'Ocean Guardian',
                                    ownerInitials: 'OG',
                                    isNew: false,
                                    title: n.metadata?.name || 'Ocean Guardian NFT',
                                    description: n.metadata?.description || '',
                                    attributes: n.metadata?.attributes || [],
                                    rarity: 'Common',
                                    acquisition: 'nft_acq_default',
                                }));
                                setNfts(recovered);
                                console.log(`✅ ${recovered.length} NFTs recuperados desde MongoDB`);
                            }
                        }
                    } else {
                        console.log('ℹ️ Sin wallet conectada, no se puede recuperar desde MongoDB');
                    }
                } catch (mongoErr) {
                    console.warn('⚠️ Error recuperando desde MongoDB:', mongoErr.message);
                }
            }
        } catch (e) {
            console.warn('Failed to load game state:', e);
        }
    };
    useEffect(() => {
        loadGameState();
    }, []);
    useEffect(() => {
        AsyncStorage.setItem(GAME_KEYS.NFTS, JSON.stringify(nfts)).catch(() => { });
    }, [nfts]);
    useEffect(() => {
        AsyncStorage.setItem(GAME_KEYS.USER, JSON.stringify(user)).catch(() => { });
    }, [user]);
    useEffect(() => {
        AsyncStorage.setItem(GAME_KEYS.POINTS, points.toString()).catch(() => { });
    }, [points]);
    useEffect(() => {
        AsyncStorage.setItem(GAME_KEYS.ITEMS, JSON.stringify(scannedItems)).catch(() => { });
    }, [scannedItems]);
    const generateNFTHash = () => {
        return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
    };
    const unlockNFT = (nftData) => {
        const nftHash = generateNFTHash();
        const generatedData = (!nftData.attributes && !nftData.image) ? generateNFTAttributes() : {};
        const newNFT = {
            id: Date.now().toString(),
            hash: nftHash,
            date: new Date().toLocaleDateString(),
            lockedUntil: new Date(Date.now() + 86400000 * 30).toLocaleDateString(),
            owner: user.name,
            ownerInitials: user.initials,
            ownerAvatar: user.avatar,
            isNew: true,
            claimed: false,
            acquisition: nftData.acquisition || 'nft_acq_default',
            ...generatedData,
            ...nftData,
        };
        setNfts(prev => [newNFT, ...prev]);
        return newNFT;
    };
    const unlockRegionNFT = (regionName, regionImage) => {
        return unlockNFT({ title: regionName, image: regionImage, rarity: 'Common', acquisition: 'nft_acq_region' });
    };
    const markNFTSeen = (id) => {
        setNfts(prev => prev.map(n => n.id === id ? { ...n, isNew: false } : n));
    };
    const markNFTClaimed = (id) => {
        setNfts(prev => prev.map(n => n.id === id ? { ...n, claimed: true } : n));
    };
    const scanItem = (type, customPoints = null) => {
        const SCORING = { bottle: 5, can: 3, trash: 1 };
        const value = customPoints !== null ? customPoints : (SCORING[type] || 0);
        setPoints(prev => prev + value);
        setScannedItems(prev => ({ ...prev, [type]: (prev[type] || 0) + 1, total: prev.total + 1 }));
        return { value };
    };
    const updateUserProfile = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    };
    return (
        <GameContext.Provider value={{
            scannedItems,
            nfts,
            points,
            level,
            user,
            updateUserProfile,
            scanItem,
            unlockNFT,
            unlockRegionNFT,
            reloadGameState: loadGameState,
            claimNFT: (id, txHash) => {
                setNfts(prev => prev.map(n => n.id === id ? { ...n, claimed: true, txHash } : n));
            },
            markNFTSeen: (id) => {
                setNfts(prev => prev.map(n => n.id === id ? { ...n, isNew: false } : n));
            }
        }}>
            {children}
        </GameContext.Provider>
    );
};
export default GameContext;
