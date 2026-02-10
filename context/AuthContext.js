import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPin, verifyPin, hashExportPassword, obfuscateData, deobfuscateData, encryptData, decryptData } from '../utils/crypto';

// ═══════════════════════════════════════════════════════════════════════════
// AUTH CONTEXT - Redesigned multi-step auth system
//
// Registration:  username → password (x2) → PIN (x2) → done
// Login:         welcome [username] → PIN → done
// Export:        verify session password → create file password → JSON (no PIN)
// Import:        file password → new session password → new PIN → done
// ═══════════════════════════════════════════════════════════════════════════

const AuthContext = createContext(null);

const KEYS = {
    ACCOUNT: '@tpl_account_data',
    SESSION: '@tpl_session_active',
    PIN_HASH: '@tpl_pin_hash',
    PASSWORD_HASH: '@tpl_password_hash',
    PROFILE: '@tpl_user_profile',
    USERNAME: '@tpl_username',
};

export function AuthProvider({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accountId, setAccountId] = useState(null);
    const [username, setUsername] = useState('');

    // Check existing account & session on mount
    useEffect(() => {
        (async () => {
            try {
                const [pinHash, sessionActive, accountData, savedUsername] = await Promise.all([
                    AsyncStorage.getItem(KEYS.PIN_HASH),
                    AsyncStorage.getItem(KEYS.SESSION),
                    AsyncStorage.getItem(KEYS.ACCOUNT),
                    AsyncStorage.getItem(KEYS.USERNAME),
                ]);

                if (pinHash && accountData) {
                    // Account exists
                    setIsFirstTime(false);
                    const parsed = JSON.parse(accountData);
                    setAccountId(parsed.accountId);
                    setUsername(savedUsername || '');

                    // Check for active session ("cookie")
                    // MODIFIED: Even if session exists, we REQUIRE PIN on refresh for security
                    if (sessionActive === 'true') {
                        // We do NOT set isAuthenticated(true) automatically.
                        // User must enter PIN to unlock the session.
                        console.log('Session active, waiting for PIN unlock...');
                    }
                    // If we wanted auto-login, we would uncomment:
                    // setIsAuthenticated(true);
                } else {
                    // No account → first time
                    setIsFirstTime(true);
                }
            } catch (e) {
                console.warn('Auth init error:', e);
                setIsFirstTime(true);
            }
            setIsLoading(false);
        })();
    }, []);

    /**
     * Register new account with username + password + PIN
     */
    const register = useCallback(async (name, password, pin) => {
        try {
            // Generate Web3-style account ID
            const timestamp = Date.now().toString(16);
            const random = Math.random().toString(16).slice(2, 14);
            const newAccountId = `0x${timestamp}${random}`.slice(0, 42).padEnd(42, '0');

            // Hash both PIN and password
            const pinHashed = await hashPin(pin);
            const passwordHashed = await hashExportPassword(password);

            const accountData = {
                accountId: newAccountId,
                createdAt: new Date().toISOString(),
                version: 2,
            };

            // Store everything
            await Promise.all([
                AsyncStorage.setItem(KEYS.PIN_HASH, pinHashed),
                AsyncStorage.setItem(KEYS.PASSWORD_HASH, passwordHashed),
                AsyncStorage.setItem(KEYS.USERNAME, name),
                AsyncStorage.setItem(KEYS.ACCOUNT, JSON.stringify(accountData)),
                AsyncStorage.setItem(KEYS.SESSION, 'true'),
            ]);

            setAccountId(newAccountId);
            setUsername(name);
            setIsFirstTime(false);
            setIsAuthenticated(true);

            return { success: true, accountId: newAccountId };
        } catch (e) {
            console.error('Registration error:', e);
            return { success: false, error: e.message };
        }
    }, []);

    /**
     * Login with PIN → verify against stored hash
     */
    const login = useCallback(async (pin) => {
        try {
            const storedHash = await AsyncStorage.getItem(KEYS.PIN_HASH);
            if (!storedHash) return { success: false, error: 'No account found' };

            const isValid = await verifyPin(pin, storedHash);
            if (isValid) {
                await AsyncStorage.setItem(KEYS.SESSION, 'true');
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, error: 'Invalid PIN' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }, []);

    /**
     * Logout - clears session but keeps account
     */
    const logout = useCallback(async () => {
        await AsyncStorage.setItem(KEYS.SESSION, 'false');
        setIsAuthenticated(false);
    }, []);

    /**
     * Verify session password (used before export)
     */
    const verifySessionPassword = useCallback(async (password) => {
        try {
            const storedHash = await AsyncStorage.getItem(KEYS.PASSWORD_HASH);
            if (!storedHash) return false;
            const inputHash = await hashExportPassword(password);
            return inputHash === storedHash;
        } catch (e) {
            return false;
        }
    }, []);

    /**
     * Export account as encrypted JSON for migration
     * - Verifies session password first
     * - Encrypts with FILE password
     * - V3: Encrypts EVERYTHING (headers included) into one blob
     */
    const exportAccount = useCallback(async (sessionPassword, filePassword, liveAccountData = null, liveProfileData = null) => {
        try {
            // Verify session password
            const isValid = await verifySessionPassword(sessionPassword);
            if (!isValid) {
                return { success: false, error: 'Contraseña de sesión inválida.' };
            }

            let accountData, profileData, savedUsername, passwordHash;

            if (liveAccountData && liveProfileData) {
                // Use live data from GameContext
                accountData = JSON.stringify(liveAccountData);
                profileData = JSON.stringify(liveProfileData);
                savedUsername = liveProfileData.name;
                passwordHash = await AsyncStorage.getItem(KEYS.PASSWORD_HASH);
            } else {
                // Fallback to storage
                [passwordHash, accountData, profileData, savedUsername] = await Promise.all([
                    AsyncStorage.getItem(KEYS.PASSWORD_HASH),
                    AsyncStorage.getItem(KEYS.ACCOUNT),
                    AsyncStorage.getItem(KEYS.PROFILE),
                    AsyncStorage.getItem(KEYS.USERNAME),
                ]);
            }

            // Monolithic Payload (Everything inside)
            const internalPayload = {
                app: 'TuPlayaLimpia',
                version: 3,
                exportedAt: new Date().toISOString(),
                username: savedUsername,
                account: accountData,
                profile: profileData,
                checksum: (await hashExportPassword(filePassword)).slice(0, 16) // Double verification
            };

            const jsonStr = JSON.stringify(internalPayload);
            const filePasswordHash = await hashExportPassword(filePassword);
            const encrypted = await encryptData(jsonStr, filePasswordHash);

            return {
                success: true,
                data: JSON.stringify({
                    data: encrypted, // The "Immense Text" user requested
                }),
            };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }, [verifySessionPassword]);

    /**
     * Import account from encrypted JSON
     * - Decrypts with file password
     * - Sets new session password + new PIN
     */
    const importAccount = useCallback(async (fileContent, filePassword, newPassword, newPin) => {
        try {
            const parsed = JSON.parse(fileContent);

            // Support V3 (Monolithic: { data: "..." }) and V2 (Legacy: { encrypted: "...", checksum: "..." })
            let encryptedData = parsed.data || parsed.encrypted;
            if (!encryptedData) {
                return { success: false, error: 'Formato de archivo desconocido.' };
            }

            const filePasswordHash = await hashExportPassword(filePassword);

            // Decrypt attempt
            const decrypted = await decryptData(encryptedData, filePasswordHash);

            // If decryption returns null, the password/hash was wrong (AES-GCM auth fail)
            if (!decrypted) {
                return { success: false, error: 'Contraseña incorrecta o archivo dañado.' };
            }

            const importedPayload = JSON.parse(decrypted);

            // Validate Internal Header
            if (importedPayload.app !== 'TuPlayaLimpia') {
                return { success: false, error: 'Este archivo no pertenece a Tu Playa Limpia.' };
            }

            // Validated! Restore.
            const importedData = importedPayload; // payload matches structure

            // Hash new credentials
            const newPasswordHash = await hashExportPassword(newPassword);
            const newPinHash = await hashPin(newPin);

            // CRITICAL FIX: Save to GameContext Keys so the game actually loads the data
            const GAME_KEYS = {
                POINTS: '@tpl_game_points',
                ITEMS: '@tpl_game_items',
                NFTS: '@tpl_game_nfts',
                USER: '@tpl_game_user_meta',
            };

            const accountDataStr = importedData.account || '{}';
            const profileDataStr = importedData.profile || '{}';

            const accountObj = JSON.parse(accountDataStr);
            const profileObj = JSON.parse(profileDataStr);

            // Restore data with NEW credentials
            await Promise.all([
                // Auth Keys
                AsyncStorage.setItem(KEYS.PIN_HASH, newPinHash),
                AsyncStorage.setItem(KEYS.PASSWORD_HASH, newPasswordHash),
                AsyncStorage.setItem(KEYS.USERNAME, importedData.username || ''),
                AsyncStorage.setItem(KEYS.ACCOUNT, accountDataStr),
                AsyncStorage.setItem(KEYS.PROFILE, profileDataStr),
                AsyncStorage.setItem(KEYS.SESSION, 'true'),

                // Game Keys
                AsyncStorage.setItem(GAME_KEYS.POINTS, (accountObj.points || 0).toString()),
                AsyncStorage.setItem(GAME_KEYS.ITEMS, JSON.stringify(accountObj.scannedItems || { bottles: 0, cans: 0, total: 0 })),
                AsyncStorage.setItem(GAME_KEYS.NFTS, JSON.stringify(accountObj.nfts || [])),
                // Merge profile data if needed, ensuring avatar/name are present
                AsyncStorage.setItem(GAME_KEYS.USER, profileDataStr),
            ]);

            const accountInfo = JSON.parse(importedData.account || '{}');
            setAccountId(accountInfo.accountId || 'imported');
            setUsername(importedData.username || '');
            setIsFirstTime(false);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('Import error:', error);
            return { success: false, error: 'Error al importar: ' + error.message };
        }
    }, []);

    /**
     * Save user profile data to AsyncStorage
     */
    const saveProfile = useCallback(async (profileData) => {
        try {
            await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profileData));
        } catch (e) {
            console.warn('Profile save error:', e);
        }
    }, []);

    /**
     * Load user profile data from AsyncStorage
     */
    const loadProfile = useCallback(async () => {
        try {
            const data = await AsyncStorage.getItem(KEYS.PROFILE);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }, []);

    const value = useMemo(() => ({
        isLoading,
        isFirstTime,
        isAuthenticated,
        accountId,
        username,
        register,
        login,
        logout,
        verifySessionPassword,
        exportAccount,
        importAccount,
        saveProfile,
        loadProfile,
    }), [isLoading, isFirstTime, isAuthenticated, accountId, username, register, login, logout, verifySessionPassword, exportAccount, importAccount, saveProfile, loadProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
