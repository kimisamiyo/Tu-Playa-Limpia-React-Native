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
            if (storedNfts) setNfts(JSON.parse(storedNfts));
            if (storedUser) setUser(prev => ({ ...prev, ...JSON.parse(storedUser) }));
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
            ownerAvatar: user.avatar, // Creator's profile picture
            isNew: true, // Mark as new by default
            claimed: false, // Track if claimed to wallet
            acquisition: nftData.acquisition || 'nft_acq_default', // Translation key for acquisition source
            ...generatedData, // Apply generated attributes and description first
            ...nftData, // Override if header provides specific data
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
            claimNFT: (id) => {
                setNfts(prev => prev.map(n => n.id === id ? { ...n, claimed: true } : n));
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
