import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import translations, { LANGUAGES, LANGUAGE_LABELS } from '../constants/translations';

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE CONTEXT - Auto-detects device language, manual override in Profile
// Supports: ES, EN, ZH, HI, AR, FR, PT
// ═══════════════════════════════════════════════════════════════════════════

const LanguageContext = createContext(null);
const STORAGE_KEY = '@tpl_language_preference';
const SUPPORTED = Object.values(LANGUAGES);

/**
 * Detect device language and map to closest supported language
 */
function detectDeviceLanguage() {
    try {
        const locales = Localization.getLocales?.();
        if (locales && locales.length > 0) {
            const deviceLang = locales[0].languageCode?.toLowerCase();
            if (deviceLang && SUPPORTED.includes(deviceLang)) {
                return deviceLang;
            }
            // Try matching prefix (e.g., 'zh-Hans' -> 'zh')
            const prefix = deviceLang?.split('-')[0];
            if (prefix && SUPPORTED.includes(prefix)) {
                return prefix;
            }
        }
    } catch (e) {
        console.warn('Language detection fallback:', e);
    }
    return LANGUAGES.ES; // Default to Spanish
}

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(null);
    const [isAutoMode, setIsAutoMode] = useState(true);
    const [isReady, setIsReady] = useState(false);

    // Load saved preference on mount
    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.mode === 'auto') {
                        setIsAutoMode(true);
                        setLanguageState(detectDeviceLanguage());
                    } else if (SUPPORTED.includes(parsed.language)) {
                        setIsAutoMode(false);
                        setLanguageState(parsed.language);
                    } else {
                        setLanguageState(detectDeviceLanguage());
                    }
                } else {
                    // First time: auto-detect
                    setLanguageState(detectDeviceLanguage());
                }
            } catch (e) {
                setLanguageState(detectDeviceLanguage());
            }
            setIsReady(true);
        })();
    }, []);

    // Set language manually
    const setLanguage = useCallback(async (lang) => {
        if (lang === 'auto') {
            setIsAutoMode(true);
            const detected = detectDeviceLanguage();
            setLanguageState(detected);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: 'auto' }));
        } else if (SUPPORTED.includes(lang)) {
            setIsAutoMode(false);
            setLanguageState(lang);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: 'manual', language: lang }));
        }
    }, []);

    const t = useCallback((key, params) => {
        const lang = language || LANGUAGES.ES;
        let text = translations[lang]?.[key] || translations[LANGUAGES.ES]?.[key] || key;

        if (params && typeof text === 'string') {
            Object.keys(params).forEach(param => {
                text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
            });
        }
        return text;
    }, [language]);

    const value = useMemo(() => ({
        t,
        language: language || LANGUAGES.ES,
        setLanguage,
        isAutoMode,
        LANGUAGES,
        LANGUAGE_LABELS,
        isReady,
    }), [t, language, setLanguage, isAutoMode, isReady]);

    return (
        <LanguageContext.Provider value={value}>
            {isReady ? children : null}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
