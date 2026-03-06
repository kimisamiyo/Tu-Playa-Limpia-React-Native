import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateNFTAttributes } from '../utils/nftGenerator';
import { ethers } from 'ethers';
import MissionNFTAbi from '../utils/blockchain/MissionNFT.json';
import { NETWORK_CONFIG } from '../utils/blockchain/networkConfig';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import { TPL_TOKEN_ADDRESS, TPL_TOKEN_ABI } from '../utils/blockchain/tplToken';
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
    const { address: currentWalletAddress, provider: walletProvider } = useWallet();
    const isInitialized = useRef(false);

    const INITIAL_GAME_STATE = {
        points: 0,
        scannedItems: { bottles: 0, cans: 0, total: 0 },
        nfts: [],
        level: 1,
        user: {
            name: 'Ocean Guardian',
            avatar: null,
            initials: 'OG',
            hasChangedUsername: false,
            tplTitle: 'Cleanup Rookie',
        }
    };

    // Función para limpiar la sesión en un logout/registro nuevo
    const resetGameState = async () => {
        setPoints(INITIAL_GAME_STATE.points);
        setScannedItems(INITIAL_GAME_STATE.scannedItems);
        setNfts(INITIAL_GAME_STATE.nfts);
        setLevel(INITIAL_GAME_STATE.level);
        setUser(INITIAL_GAME_STATE.user);
        await AsyncStorage.multiRemove(Object.values(GAME_KEYS));
    };

    const fetchTPLBalanceFromExplorer = async (address) => {
        try {
            const explorerBase = "https://explorer-pob.dev11.top/api";
            // Forzamos lowercase para consistencia en la API
            const addr = address.toLowerCase();
            const url = `${explorerBase}?module=account&action=tokenbalance&contractaddress=${TPL_TOKEN_ADDRESS}&address=${addr}`;

            console.log(`🔍 Consultando balance TPL REST para: ${addr}`);
            let resp;
            if (Platform.OS === 'web') {
                resp = await fetchWithFallback(url);
            } else {
                resp = await fetch(url);
            }

            if (resp.ok) {
                const data = await resp.json();
                if (data.status === "1" && data.result) {
                    const balanceRaw = data.result;
                    const points = Math.floor(parseFloat(ethers.utils.formatUnits(balanceRaw, 18)));
                    console.log(`💰 Balance REST detectado: ${points}`);
                    return points;
                }
            }
        } catch (e) {
            console.warn("⚠️ Fallo consulta REST de balance:", e.message);
        }
        return null;
    };

    const mintTPLViaREST = async (address, amount) => {
        const adminKey = process.env.EXPO_PUBLIC_ADMIN_PRIVATE_KEY;
        if (!adminKey) return null;

        try {
            const adminWallet = new ethers.Wallet(adminKey);
            const targetAddress = address.toLowerCase();
            const adminAddr = adminWallet.address.toLowerCase();
            const explorerBase = "https://explorer-pob.dev11.top/api";

            // 1. Obtener Nonce (GET)
            const nonceUrl = `${explorerBase}?module=proxy&action=eth_getTransactionCount&address=${adminAddr}&tag=latest`;
            const nonceResp = await fetchWithFallback(nonceUrl);
            const nonceData = await nonceResp.json();
            const nonce = parseInt(nonceData.result, 16);

            // 2. Obtener Gas Price (GET)
            const gpUrl = `${explorerBase}?module=proxy&action=eth_gasPrice`;
            const gpResp = await fetchWithFallback(gpUrl);
            const gpData = await gpResp.json();
            const gasPrice = gpData.result;

            // 3. Codificar Data
            const tplInterface = new ethers.utils.Interface(TPL_TOKEN_ABI);
            const data = tplInterface.encodeFunctionData("mint", [targetAddress, ethers.utils.parseUnits(amount.toString(), 18)]);

            const tx = {
                to: TPL_TOKEN_ADDRESS,
                data: data,
                nonce: nonce,
                gasPrice: gasPrice,
                gasLimit: 150000,
                chainId: NETWORK_CONFIG.chainId
            };

            // 4. Firmar
            const signedTx = await adminWallet.signTransaction(tx);

            // 5. Push (GET vía Proxy para evitar preflight CORS)
            const pushUrl = `${explorerBase}?module=proxy&action=eth_sendRawTransaction&hex=${signedTx}`;
            const pushResp = await fetchWithFallback(pushUrl);
            const pushData = await pushResp.json();

            if (pushData.result && pushData.result.startsWith("0x")) {
                return pushData.result;
            }
            throw new Error(pushData.error?.message || "Error en push RAW");
        } catch (e) {
            console.error("❌ Fallo crítico en mintTPLViaREST:", e.message);
            throw e;
        }
    };

    const fetchWithFallback = async (url, options = {}) => {
        const proxies = [
            (url) => url, // Primero directo
            (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
            (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        ];

        let lastStatus = 0;
        let lastError = null;
        for (const proxyFn of proxies) {
            try {
                const proxiedUrl = proxyFn(url);
                const fetchOptions = {
                    method: options.method || 'GET',
                    headers: {
                        'Accept': 'application/json',
                        ...(options.headers || {})
                    },
                    body: options.body || null
                };

                // Solo enviar Content-Type si es POST para evitar 400 en GET proxies
                if (options.method === 'POST') {
                    fetchOptions.headers['Content-Type'] = 'application/json';
                }

                const resp = await fetch(proxiedUrl, fetchOptions);
                if (resp.ok) return resp;

                lastStatus = resp.status;
            } catch (e) {
                lastError = e;
            }
        }
        throw lastError || new Error(`Todos los túneles fallaron (${lastStatus})`);
    };

    const createResilientProvider = () => {
        const staticNetwork = { chainId: NETWORK_CONFIG.chainId, name: NETWORK_CONFIG.chainName };

        const resilientFetch = async (url, options) => {
            if (Platform.OS === 'web') {
                try {
                    // Forzamos el uso del túnel para evitar los preflights fallidos (CORS)
                    return await fetchWithFallback(url, options);
                } catch (e) {
                    console.error("❌ Fallo total del túnel de red:", e.message);
                }
            }
            return await fetch(url, options);
        };

        const connection = {
            url: NETWORK_CONFIG.rpcUrl,
            fetch: resilientFetch,
            timeout: 20000 // Timeout extendido para proxies lentos
        };

        // StaticJsonRpcProvider es vital para evitar el hit de detectNetwork que dispara CORS
        return new ethers.providers.StaticJsonRpcProvider(connection, staticNetwork);
    };

    const loadGameState = async (forceWalletAddress = null) => {
        try {
            // Priorizar address activa de la wallet si existe
            const walletAddress = forceWalletAddress || currentWalletAddress || user?.walletAddress;

            const [storedPoints, storedItems, storedNfts, storedUser] = await Promise.all([
                AsyncStorage.getItem(GAME_KEYS.POINTS),
                AsyncStorage.getItem(GAME_KEYS.ITEMS),
                AsyncStorage.getItem(GAME_KEYS.NFTS),
                AsyncStorage.getItem(GAME_KEYS.USER),
            ]);

            const parsedUser = storedUser ? JSON.parse(storedUser) : user;
            const currentUserName = parsedUser.name || 'Héroe del Océano';

            if (storedPoints && !walletAddress) setPoints(parseInt(storedPoints));
            if (storedItems) setScannedItems(JSON.parse(storedItems));
            if (storedUser) setUser(prev => ({ ...prev, ...parsedUser }));

            let localNfts = [];
            if (storedNfts) {
                localNfts = JSON.parse(storedNfts);
                setNfts(localNfts);
            }

            // Marcar como inicializado parcialmente si ya tenemos datos locales, 
            // para permitir que acciones del usuario (como reclamos) se guarden mientras se carga la chain.
            if (localNfts.length > 0 || storedPoints) {
                isInitialized.current = true;
            }

            // Integración On-Chain: recuperar NFTs reales
            // walletAddress ya fue definido arriba priorizando la wallet activa
            if (walletAddress) {
                console.log('🔗 Recuperando NFTs on-chain para:', walletAddress);
                try {
                    // 1. Obtener lista detallada de NFTs usando la API REST v2 de Blockscout
                    const contractEnvStr = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS || '0x8d4c2a3d11b94874f362453d1bd622630b044cd5';
                    const missionContractAddr = contractEnvStr.toLowerCase();

                    const explorerUrl = `https://explorer-pob.dev11.top/api/v2/addresses/${walletAddress}/nft?type=ERC-721`;

                    let data = null;

                    if (Platform.OS === 'web') {
                        // Intentar con múltiples proxies si uno falla
                        try {
                            console.log(`Trying proxy for Explorer: ${explorerUrl}`);
                            const resp = await fetchWithFallback(explorerUrl);
                            data = await resp.json();
                        } catch (e) {
                            console.warn("Explorer fetch failed even with proxies", e);
                        }
                    } else {
                        const resp = await fetch(explorerUrl);
                        if (resp.ok) data = await resp.json();
                    }

                    if (data && data.items) {
                        let items = [];

                        // REST v2 devuelve los NFTs en .items
                        if (data.items && Array.isArray(data.items)) {
                            items = data.items.filter(item =>
                                item.token?.address?.toLowerCase() === missionContractAddr
                            );
                        }

                        if (items.length > 0) {
                            console.log(`✅ Encontrados ${items.length} NFTs en el inventario REST v2.`);

                            // 2. Procesar los metadatos
                            // Configurar un provider resiliente con Proxies para evitar CORS en Web
                            let provider = createResilientProvider();

                            const abi = MissionNFTAbi.abi || MissionNFTAbi;
                            const contract = new ethers.Contract(missionContractAddr, abi, provider);

                            const onChainNftsPromises = items.map(async (item) => {
                                try {
                                    const tokenId = item.id;
                                    let metadata = item.metadata;

                                    // Fallback: si el explorer no tiene los metadatos, los leemos del RPC
                                    if (!metadata || !metadata.name) {
                                        try {
                                            const rawUri = await contract.tokenURI(tokenId);
                                            if (rawUri?.startsWith('data:application/json;base64,')) {
                                                const jsonStr = atob(rawUri.split(',')[1]);
                                                metadata = JSON.parse(jsonStr);
                                            }
                                        } catch (e) {
                                            console.warn(`Error leyendo tokenURI para ${tokenId}:`, e);
                                        }
                                    }

                                    if (!metadata) return null;

                                    // Limpieza de títulos: Quitar prefijos genéricos
                                    let displayTitle = metadata.name || 'NFT Sin Nombre';
                                    displayTitle = displayTitle.replace(/^Ocean Guardian:\s*/i, '').trim();

                                    if ((displayTitle === 'Ocean Guardian NFT' || displayTitle === 'NFT Sin Nombre') && metadata.attributes) {
                                        const missionAttr = metadata.attributes.find(a => a.trait_type === 'Misión');
                                        if (missionAttr) {
                                            displayTitle = missionAttr.value;
                                        }
                                    }

                                    return {
                                        id: tokenId.toString(),
                                        hash: item.tx_hash || item.transaction_hash || 'onchain_tx',
                                        txHash: item.tx_hash || item.transaction_hash || '0x...',
                                        claimed: true,
                                        date: new Date().toLocaleDateString(),
                                        lockedUntil: new Date(Date.now() + 86400000 * 30).toLocaleDateString(),
                                        owner: currentUserName,
                                        ownerInitials: parsedUser.initials || 'HO',
                                        isNew: false,
                                        title: displayTitle,
                                        description: metadata.description || '',
                                        attributes: metadata.attributes || [],
                                        rarity: 'Common',
                                        acquisition: 'Recuperado de zkSYS',
                                        sourceKey: metadata.name ? `region_${metadata.name}` : null,
                                        image: metadata.image || item.image_url,
                                    };
                                } catch (err) {
                                    console.warn(`Error procesando item ${item.id}:`, err);
                                }
                                return null;
                            });

                            // 3. Filtrar los NFTs genéricos que no tienen misión ni nombre válido
                            const results = await Promise.all(onChainNftsPromises);
                            console.log(`🔍 Resultado crudo de ${results.length} promesas de metadatos.`);

                            const validOnChainNfts = results
                                .filter(Boolean)
                                .filter(n => {
                                    const isGeneric =
                                        n.title === 'Ocean Guardian NFT' ||
                                        n.title === 'NFT Sin Nombre' ||
                                        n.title === 'null' ||
                                        n.title === 'undefined';
                                    if (isGeneric) {
                                        console.log(`🚫 NFT Filtrado por ser genérico: ID=${n.id}, Title=${n.title}`);
                                        return false;
                                    }
                                    console.log(`✅ NFT Válido aceptado: ID=${n.id}, Title=${n.title}`);
                                    return true;
                                });

                            console.log(`✅ Recuperados ${validOnChainNfts.length} NFTs válidos tras filtrado.`);

                            // 4. Sincronización de Puntos TPL REALES (Prioridad REST API):
                            try {
                                const pointsBalance = await fetchTPLBalanceFromExplorer(walletAddress);
                                if (pointsBalance !== null) {
                                    setPoints(pointsBalance);
                                } else {
                                    // Fallback RPC solo si el Explorer falla
                                    const tplContract = new ethers.Contract(TPL_TOKEN_ADDRESS, TPL_TOKEN_ABI, provider);
                                    const balanceRaw = await tplContract.balanceOf(walletAddress);
                                    const pointsRpc = Math.floor(parseFloat(ethers.utils.formatUnits(balanceRaw, 18)));
                                    setPoints(pointsRpc);
                                }
                            } catch (tplErr) {
                                console.warn('⚠️ No se pudo cargar el balance de TPL:', tplErr.message);
                            }

                            // 5. Merge: Mantener NFTs locales no reclamados y sobrescribir con los onchain reales
                            setNfts(prev => {
                                const pendingLocal = prev.filter(n => !n.claimed);
                                return [...validOnChainNfts, ...pendingLocal];
                            });
                        } else {
                            console.log('ℹ️ La wallet no posee NFTs o el explorer falló.');

                            // Intentamos traer sus puntos TPL usando la REST API
                            try {
                                const pointsBalance = await fetchTPLBalanceFromExplorer(walletAddress);
                                if (pointsBalance !== null) {
                                    setPoints(pointsBalance);
                                } else {
                                    const provider = createResilientProvider();
                                    const tplContract = new ethers.Contract(TPL_TOKEN_ADDRESS, TPL_TOKEN_ABI, provider);
                                    const balanceRaw = await tplContract.balanceOf(walletAddress);
                                    const pointsRpc = Math.floor(parseFloat(ethers.utils.formatUnits(balanceRaw, 18)));
                                    setPoints(pointsRpc);
                                }
                            } catch (e) {
                                console.warn('⚠️ Fallo segundo intento de puntos:', e.message);
                            }
                        }
                    }
                } catch (chainErr) {
                    console.warn('⚠️ Error recuperando desde la blockchain:', chainErr.message);
                }
            } else {
                console.log('ℹ️ Sin wallet vinculada al perfil, se salta recarga On-Chain');
            }

            isInitialized.current = true;
        } catch (e) {
            console.warn('Failed to load game state:', e);
            isInitialized.current = true; // Marcar como inicializado incluso en error
        }
    };

    const { isAuthenticated, accountId } = useAuth();

    // Sincronizar estado global al cerrar sesión o cambiar cuenta
    useEffect(() => {
        if (!isAuthenticated) {
            resetGameState();
        }
    }, [isAuthenticated]);

    // Forzar reload cuando inicia la app o se identifica la cuenta
    useEffect(() => {
        if (isAuthenticated && accountId) {
            loadGameState();
        }
    }, [isAuthenticated, accountId]);

    // Reaccionar a cambios en la wallet conectada (Web3 Nativo)
    useEffect(() => {
        if (isAuthenticated && currentWalletAddress && isInitialized.current) {
            console.log('🔄 Wallet conectada/cambiada detectada:', currentWalletAddress);
            loadGameState(currentWalletAddress);
        }
    }, [currentWalletAddress, isAuthenticated]);

    useEffect(() => {
        if (!isInitialized.current) return;
        AsyncStorage.setItem(GAME_KEYS.NFTS, JSON.stringify(nfts)).catch(() => { });
    }, [nfts]);
    useEffect(() => {
        if (!isInitialized.current) return;
        AsyncStorage.setItem(GAME_KEYS.USER, JSON.stringify(user)).catch(() => { });
    }, [user]);
    useEffect(() => {
        if (!isInitialized.current) return;
        AsyncStorage.setItem(GAME_KEYS.POINTS, points.toString()).catch(() => { });
    }, [points]);
    useEffect(() => {
        if (!isInitialized.current) return;
        AsyncStorage.setItem(GAME_KEYS.ITEMS, JSON.stringify(scannedItems)).catch(() => { });
    }, [scannedItems]);
    const generateNFTHash = () => {
        return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
    };
    const unlockNFT = (nftData) => {
        // ✅ DEDUPLICACIÓN: si se pasa un sourceKey, verificar que no exista ya un NFT con esa key.
        // sourceKey es cualquier cadena única que identifique el trigger (nombre de playa, id de misión, etc.).
        const { sourceKey, missionId, ...restData } = nftData;
        if (sourceKey) {
            // usamos la ref funcional de setNfts para leer el estado actual sin race conditions
            let isDuplicate = false;
            setNfts(prev => {
                isDuplicate = prev.some(n => n.sourceKey === sourceKey);
                return prev; // no mutamos nada aún
            });
            // Nota: como setNfts es síncrono en su lectura pero async en su escritura,
            // usamos un ref auxiliar para el check sin hook adicional.
            // Leemos nfts directamente (valor capturado en el closure del render actual).
        }
        const nftHash = generateNFTHash();
        const generatedData = (!restData.attributes && !restData.image) ? generateNFTAttributes(missionId) : {};
        const newNFT = {
            id: missionId ? missionId.toString() : Date.now().toString(),
            hash: nftHash,
            date: new Date().toLocaleDateString(),
            lockedUntil: new Date(Date.now() + 86400000 * 30).toLocaleDateString(),
            owner: user.name,
            ownerInitials: user.initials,
            ownerAvatar: user.avatar,
            isNew: true,
            claimed: false,
            sourceKey: sourceKey || null,
            acquisition: restData.acquisition || 'nft_acq_default',
            ...generatedData,
            ...restData,
        };
        let added = false;
        setNfts(prev => {
            // Segunda verificación dentro del updater (acceso al estado real y actual).
            if (sourceKey && prev.some(n => n.sourceKey === sourceKey)) {
                return prev; // ya existe — no añadimos duplicado
            }
            added = true;
            return [newNFT, ...prev];
        });
        // Si no fue agregado, retornar null para que el caller sepa que fue rechazado.
        // Como setNfts es async, usamos el flag `added` que se setea síncrono dentro del updater.
        return added ? newNFT : null;
    };
    const unlockRegionNFT = (beach) => {
        // sourceKey = nombre de la playa → evita que la misma playa otorgue NFT múltiples veces
        return unlockNFT({
            title: beach.name,
            image: beach.image,
            rarity: 'Common',
            acquisition: 'nft_acq_region',
            sourceKey: `region_${beach.name}`,
            missionId: beach.id
        });
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

        // 1. Actualización Local (Inmediata)
        setPoints(prev => prev + value);
        setScannedItems(prev => ({ ...prev, [type]: (prev[type] || 0) + 1, total: prev.total + 1 }));

        // 2. Persistencia On-Chain (REST-First para bypass CORS)
        if (currentWalletAddress) {
            (async () => {
                try {
                    console.log(`🔨 Sincronizando ${value} TPL vía REST para ${currentWalletAddress}...`);
                    const txHash = await mintTPLViaREST(currentWalletAddress, value);
                    if (txHash) {
                        console.log(`✅ Sincronización REST exitosa. TX: ${txHash}`);
                    }
                } catch (e) {
                    console.warn('⚠️ Fallo persistencia REST, intentando RPC fallback:', e.message);
                    // Fallback RPC solo si REST falla totalmente
                    const adminKey = process.env.EXPO_PUBLIC_ADMIN_PRIVATE_KEY;
                    if (adminKey) {
                        try {
                            const provider = createResilientProvider();
                            const adminWallet = new ethers.Wallet(adminKey, provider);
                            const tplToken = new ethers.Contract(TPL_TOKEN_ADDRESS, TPL_TOKEN_ABI, adminWallet);
                            const tx = await tplToken.mint(currentWalletAddress, ethers.utils.parseUnits(value.toString(), 18));
                            console.log(`✅ Fallback RPC exitoso. TX: ${tx.hash}`);
                        } catch (rpcErr) {
                            console.error('❌ Fallo total de persistencia:', rpcErr.message);
                        }
                    }
                }
            })();
        }

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
            resetGameState,
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
