import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateNFTAttributes } from '../utils/nftGenerator';
import { fetchUserNFTs } from '../utils/blockchain/missionNFT';
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
        name: 'TPL Explorer',
        avatar: null,
        initials: 'TE',
        hasChangedUsername: false,
        tplTitle: 'Cleanup Rookie',
    });
    const unlockingSet = useRef(new Set());
    const loadGameState = async () => {
        try {
            const [storedPoints, storedItems, storedNfts, storedUser, storedRegDate, storedUsername] = await Promise.all([
                AsyncStorage.getItem(GAME_KEYS.POINTS),
                AsyncStorage.getItem(GAME_KEYS.ITEMS),
                AsyncStorage.getItem(GAME_KEYS.NFTS),
                AsyncStorage.getItem(GAME_KEYS.USER),
                AsyncStorage.getItem('@tpl_registration_date'),
                AsyncStorage.getItem('@tpl_username'),
            ]);
            if (storedPoints) setPoints(parseInt(storedPoints));
            if (storedItems) setScannedItems(JSON.parse(storedItems));

            const joinDate = storedRegDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            // Sync Username logic
            let finalName = 'Ocean Guardian';
            if (storedUsername) {
                finalName = storedUsername;
            } else if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.name && parsed.name !== 'Ocean Guardian') {
                    finalName = parsed.name;
                }
            }

            const initials = finalName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            if (storedUser) {
                setUser(prev => ({
                    ...prev,
                    ...JSON.parse(storedUser),
                    name: finalName,
                    initials: initials || 'OG',
                    joinDate
                }));
            } else {
                setUser(prev => ({
                    ...prev,
                    name: finalName,
                    initials: initials || 'OG',
                    joinDate
                }));
            }

            const userData = storedUser ? JSON.parse(storedUser) : null;
            const walletAddress = userData?.walletAddress;

            // Patch existing NFTs to reflect the real username instead of "Ocean Guardian"
            let initialNfts = storedNfts ? JSON.parse(storedNfts) : [];
            let nftsPatched = false;
            const updatedNfts = initialNfts.map(nft => {
                if (nft.owner === 'Ocean Guardian' || !nft.owner) {
                    nftsPatched = true;
                    return { ...nft, owner: finalName };
                }
                return nft;
            });

            if (storedNfts) {
                setNfts(updatedNfts);
                if (nftsPatched) {
                    AsyncStorage.setItem(GAME_KEYS.NFTS, JSON.stringify(updatedNfts)).catch(() => { });
                    console.log(`✅ ${updatedNfts.length} NFTs parchados con el nombre: ${finalName}`);
                }
            }

            let finalNfts = null;
            if (walletAddress) {
                try {
                    console.log('📡 Buscando NFTs On-Chain en contrato TPL...');
                    const onChainNfts = await fetchUserNFTs(walletAddress);
                    if (onChainNfts && onChainNfts.length > 0) {
                        console.log(`✅ ${onChainNfts.length} NFTs recuperados desde la Blockchain`);
                        finalNfts = onChainNfts;
                    }
                } catch (blockchainErr) {
                    console.warn('⚠️ Error consultando Blockchain:', blockchainErr.message);
                }
            }

            if (finalNfts) {
                setNfts(finalNfts);
            } else if (storedNfts) {
                setNfts(JSON.parse(storedNfts));
            } else {
                // 3. Fallback 2: AsyncStorage vacío → intentar recuperar desde MongoDB
                console.log('📦 AsyncStorage y Blockchain vacíos, buscando NFTs en MongoDB...');
                try {
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
                                    owner: finalName,
                                    ownerInitials: initials || 'OG',
                                    isNew: false,
                                    title: n.metadata?.name || `${finalName} NFT`,
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
                        console.log('ℹ️ Sin wallet conectada, no se puede recuperar nfts remotos.');
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

        // Listener reactivo a las importaciones/registros de cuenta desde Auth
        const accountListener = DeviceEventEmitter.addListener('TPL_ACCOUNT_IMPORTED', () => {
            console.log('🔄 Sincronizando GameContext tras nueva sesión...');
            loadGameState();
        });

        return () => {
            accountListener.remove();
        };
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
        // 1. Check if the user already owns this specific region NFT
        const alreadyOwns = nfts.some(n => n.title === regionName && n.acquisition === 'nft_acq_region');

        // 2. Race-condition check (debounce rapid clicks)
        if (alreadyOwns || unlockingSet.current.has(regionName)) {
            console.warn(`[GameContext] Duplicación evitada: NFT de la zona ${regionName} ya está en proceso o en posesión.`);
            return null;
        }

        // 3. Lock the process for this specific region
        unlockingSet.current.add(regionName);

        // 4. Release the lock after a small delay (180ms) to allow UI recovery
        setTimeout(() => unlockingSet.current.delete(regionName), 180);

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
