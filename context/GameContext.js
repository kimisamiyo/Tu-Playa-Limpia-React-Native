import React, { createContext, useState, useContext, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

// Level thresholds
const LEVEL_THRESHOLDS = {
    1: 0,   // Start
    2: 8,   // 8 NFTs = Level 2 (unlocks Promotions)
    3: 20,  // Future expansion
    4: 50,
};

export const GameProvider = ({ children }) => {
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
    });

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
        setPoints(prev => prev + value);
        setScannedItems(prev => ({
            ...prev,
            [type]: (prev[type] || 0) + 1,
            total: prev.total + 1
        }));
        return value;
    };

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
        const newNFT = {
            id: Date.now().toString(),
            hash: nftHash, // Unique blockchain-like hash
            date: new Date().toLocaleDateString(),
            lockedUntil: new Date(Date.now() + 86400000 * 30).toLocaleDateString(),
            owner: user.name,
            ownerInitials: user.initials,
            ownerAvatar: user.avatar, // Creator's profile picture
            ...nftData
        };
        setNfts(prev => [newNFT, ...prev]);
    };

    return (
        <GameContext.Provider value={{
            points,
            scannedItems,
            nfts,
            level,
            user,
            setUser,
            updateUserProfile,
            scanItem,
            unlockNFT,
            LEVEL_THRESHOLDS
        }}>
            {children}
        </GameContext.Provider>
    );
};
