import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GameContext = createContext();

import { useAuth } from './AuthContext';
import { generateNFTAttributes } from '../utils/nftGenerator';

export const useGame = () => useContext(GameContext);

// Level thresholds
const LEVEL_THRESHOLDS = {
    1: 0,   // Start
    2: 4,   // 4 NFTs = Level 2 (unlocks Promotions)
    3: 20,  // Future expansion
    4: 50,
};

const GAME_KEYS = {
    POINTS: '@tpl_game_points',
    ITEMS: '@tpl_game_items',
    NFTS: '@tpl_game_nfts',
    USER: '@tpl_game_user_meta',
};

export const GameProvider = ({ children }) => {
    const { username, isAuthenticated } = useAuth(); // Import isAuthenticated

    // Default States
    const [points, setPoints] = useState(0);
    const [scannedItems, setScannedItems] = useState({ bottles: 0, cans: 0, total: 0 });
    const [nfts, setNfts] = useState([]);
    const [level, setLevel] = useState(1);

    // User info for NFT ownership and profile
    const [user, setUser] = useState({
        name: 'Ocean Guardian',
        avatar: null, // URI for profile image
        initials: 'OG',
        hasChangedUsername: false, // One-time username change
        walletAddress: null, // Future Web3 integration
        joinDate: new Date().toLocaleDateString(),
        totalImpact: 0, // Total items scanned
        // Milestone tracking
        hasAwarded20Points: false,
        hasAwardedProfileVisit: false,
        hasAwardedNameChange: false,
        hasAwardedExport: false,
    });

    const [isLoaded, setIsLoaded] = useState(false);

    // ═══════════════════════════════════════════
    // PERSISTENCE: LOAD
    // ═══════════════════════════════════════════
    useEffect(() => {
        if (isAuthenticated) {
            loadGameState();
        } else {
            // Optional: Clear state on logout? 
            // For now, we prefer to keep it in memory or reset to defaults.
            // resetting to defaults ensures next user doesn't see old data momentarily
            resetGameState();
        }
    }, [isAuthenticated]);

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
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Ensure name sync with AuthContext if needed, but GameContext user might have more details
                setUser(prev => ({ ...prev, ...parsedUser }));
            }
        } catch (e) {
            console.warn('Failed to load game state:', e);
        } finally {
            setIsLoaded(true);
        }
    };

    const resetGameState = () => {
        setPoints(0);
        setScannedItems({ bottles: 0, cans: 0, total: 0 });
        setNfts([]);
        setLevel(1);
        setUser({
            name: 'Ocean Guardian',
            avatar: null,
            initials: 'OG',
            hasChangedUsername: false,
            walletAddress: null,
            joinDate: new Date().toLocaleDateString(),
            totalImpact: 0,
            hasAwarded20Points: false,
            hasAwardedProfileVisit: false,
            hasAwardedNameChange: false,
            hasAwardedExport: false,
        });
    };

    // ═══════════════════════════════════════════
    // PERSISTENCE: SAVE (Auto-save on change)
    // ═══════════════════════════════════════════
    // PERSISTENCE: SAVE (Auto-save on change)
    // ═══════════════════════════════════════════
    useEffect(() => {
        if (!isAuthenticated || !isLoaded) return;

        const saveState = async () => {
            try {
                await AsyncStorage.setItem(GAME_KEYS.POINTS, points.toString());
                await AsyncStorage.setItem(GAME_KEYS.ITEMS, JSON.stringify(scannedItems));
                await AsyncStorage.setItem(GAME_KEYS.NFTS, JSON.stringify(nfts));
                await AsyncStorage.setItem(GAME_KEYS.USER, JSON.stringify(user));
            } catch (e) {
                console.warn('Failed to save game state:', e);
            }
        };

        const timeoutId = setTimeout(saveState, 1000); // Debounce save by 1s
        return () => clearTimeout(timeoutId);
    }, [points, scannedItems, nfts, user, isAuthenticated, isLoaded]);


    // Sync username from AuthContext (Only if not already set or changed)
    useEffect(() => {
        if (username && user.name === 'Ocean Guardian' && !user.hasChangedUsername) {
            setUser(prev => ({
                ...prev,
                name: username,
                initials: username.substring(0, 2).toUpperCase()
            }));
        }
    }, [username]);


    // Update user profile (with restrictions)
    const updateUserProfile = (updates) => {
        setUser(prev => {
            // Check if trying to change username and already changed
            if (updates.name && prev.hasChangedUsername && updates.name !== prev.name) {
                console.warn('Username can only be changed once');
                return prev;
            }

            // If changing username for the first time
            const newHasChangedUsername = updates.name && updates.name !== prev.name
                ? true
                : prev.hasChangedUsername;

            // Generate new initials if name changed
            const newInitials = updates.name
                ? updates.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                : prev.initials;

            return {
                ...prev,
                ...updates,
                initials: newInitials,
                hasChangedUsername: newHasChangedUsername,
            };
        });

        // Trigger Name Change NFT
        if (updates.name && !user.hasAwardedNameChange) {
            const newNft = unlockNFT({
                title: 'Identity Shifter',
                image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800',
                rarity: 'Common',
                acquisition: 'nft_acq_name_change',
                description: 'Awarded for personalizing your profile name.',
            });
            setUser(prev => ({ ...prev, hasAwardedNameChange: true }));
            return { unlockedNFT: newNft };
        }
        return { unlockedNFT: null };
    };

    // Auto level-up based on NFT count
    useEffect(() => {
        let newLevel = 1;
        for (const [lvl, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
            if (nfts.length >= threshold) {
                newLevel = parseInt(lvl);
            }
        }
        if (newLevel > level) {
            setLevel(newLevel);
        }
    }, [nfts.length]);

    const SCORING = {
        bottle: 10,
        can: 5,
        trash: 2
    };

    const scanItem = (type) => {
        const value = SCORING[type] || 0;
        let unlockedNFT = null;
        setPoints(prev => prev + value);
        setScannedItems(prev => ({
            ...prev,
            [type]: (prev[type] || 0) + 1,
            total: prev.total + 1
        }));
        // First scan reward
        if (scannedItems.total === 0) {
            const newNft = unlockNFT({
                title: 'First Discovery',
                rarity: 'Legendary',
                acquisition: 'nft_acq_first_scan',
                description: 'Awarded for your first contribution to cleaning the planet.'
            });
            unlockedNFT = newNft;
        }

        // 20 Points Milestone
        if (points + value >= 20 && !user.hasAwarded20Points) {
            const newNft = unlockNFT({
                title: 'Eco Warrior',
                image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb7d5b73?auto=format&fit=crop&q=80&w=800',
                rarity: 'Uncommon',
                acquisition: 'nft_acq_points_20',
                description: 'Awarded for reaching 20 impact points.',
            });
            setUser(prev => ({ ...prev, hasAwarded20Points: true }));
            unlockedNFT = newNft;
        }

        // 2026-02-10: Save immediately after specific actions just in case
        // (Handled by useEffect, but ensuring state update triggers it)

        return { value, unlockedNFT };
    };

    // Unlock region-specific NFT (for Map)
    // MODIFIED: Now generates visual attributes while keeping the badge title/desc
    const unlockRegionNFT = (regionName, regionImage) => {
        // Check if already owns this region NFT
        const alreadyOwns = nfts.some(n => n.title === `${regionName} Badge`);
        if (alreadyOwns) return null;

        return unlockNFT({
            title: `${regionName} Badge`,
            image: regionImage,
            rarity: 'Rare',
            acquisition: `nft_acq_region:${regionName}`,
            description: `Official badge for visiting ${regionName}.`
        });
    };

    // GENERATE ATTRIBUTES FOR EXISTING NFTS (Legacy Support)
    useEffect(() => {
        if (nfts.length > 0) {
            const needsUpdate = nfts.some(n => !n.attributes && !n.image);
            if (needsUpdate) {
                setNfts(prev => prev.map(nft => {
                    if (!nft.attributes && !nft.image) {
                        const generated = generateNFTAttributes();
                        return { ...nft, ...generated };
                    }
                    return nft;
                }));
            }
        }
    }, [nfts.length]);

    // Generate unique hash-like ID (similar to blockchain tx hash)
    const generateNFTHash = () => {
        const timestamp = Date.now().toString(16); // Hex timestamp
        const random1 = Math.random().toString(16).slice(2, 10);
        const random2 = Math.random().toString(16).slice(2, 10);
        const random3 = Math.random().toString(16).slice(2, 10);
        const random4 = Math.random().toString(16).slice(2, 10);
        const random5 = Math.random().toString(16).slice(2, 10);

        // Create a 64-character hash (like Ethereum tx hash)
        const fullHash = `${timestamp}${random1}${random2}${random3}${random4}${random5}`.slice(0, 64).padEnd(64, '0');
        return `0x${fullHash}`;
    };

    const unlockNFT = (nftData) => {
        const nftHash = generateNFTHash();

        // Generate random attributes unless they are provided (e.g. for badges)
        let generatedData = {};
        // Logic: Only generate if NO attributes AND NO image are present.
        if (!nftData.attributes && !nftData.image) {
            generatedData = generateNFTAttributes();
        }

        const newNFT = {
            id: Date.now().toString(),
            hash: nftHash, // Unique blockchain-like hash
            date: new Date().toLocaleDateString(),
            lockedUntil: new Date(Date.now() + 86400000 * 30).toLocaleDateString(),
            owner: user.name,
            ownerInitials: user.initials,
            ownerAvatar: user.avatar, // Creator's profile picture
            isNew: true, // Mark as new by default
            acquisition: nftData.acquisition || 'nft_acq_default', // Translation key for acquisition source
            ...generatedData, // Apply generated attributes and description first
            ...nftData, // Override if header provides specific data
        };
        // Append acquisition to description if present
        if (newNFT.acquisition) {
            newNFT.description = `${newNFT.description}\n\n[${newNFT.acquisition}]`;
        }
        setNfts(prev => [newNFT, ...prev]);
        return newNFT;
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
            markNFTSeen: (id) => {
                setNfts(prev => prev.map(n => n.id === id ? { ...n, isNew: false } : n));
            }
        }}>
            {children}
        </GameContext.Provider>
    );
};
