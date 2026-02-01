import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { LIGHT_THEME, DARK_THEME, createShadows, BRAND, GRADIENTS, TYPOGRAPHY } from '../constants/theme';
import { SPACING, RADIUS, HEIGHT, ICON_SIZE } from '../constants/responsive';

// ═══════════════════════════════════════════════════════════════════════════
// THEME CONTEXT - Provides dark/light mode with system detection
// ═══════════════════════════════════════════════════════════════════════════

const ThemeContext = createContext(null);

/**
 * Theme modes:
 * - 'system': Follow device settings (default)
 * - 'light': Always light mode
 * - 'dark': Always dark mode
 */
const THEME_MODES = {
    SYSTEM: 'system',
    LIGHT: 'light',
    DARK: 'dark',
};

export function ThemeProvider({ children }) {
    // System color scheme detection
    const systemColorScheme = useColorScheme();

    // User preference (persisted - could add AsyncStorage later)
    const [themeMode, setThemeMode] = useState(THEME_MODES.SYSTEM);

    // Determine if dark mode is active
    const isDark = useMemo(() => {
        if (themeMode === THEME_MODES.SYSTEM) {
            return systemColorScheme === 'dark';
        }
        return themeMode === THEME_MODES.DARK;
    }, [themeMode, systemColorScheme]);

    // Current theme colors
    const colors = useMemo(() => {
        return isDark ? DARK_THEME : LIGHT_THEME;
    }, [isDark]);

    // Theme-aware shadows
    const shadows = useMemo(() => {
        return createShadows(isDark);
    }, [isDark]);

    // Complete theme object
    const theme = useMemo(() => ({
        // Mode
        isDark,
        mode: isDark ? 'dark' : 'light',

        // Colors
        colors,
        brand: BRAND,
        gradients: GRADIENTS,

        // Typography
        typography: TYPOGRAPHY,

        // Spacing & Layout
        spacing: SPACING,
        radius: RADIUS,
        height: HEIGHT,
        iconSize: ICON_SIZE,

        // Shadows
        shadows,

        // Theme switcher
        themeMode,
        setThemeMode,
        toggleTheme: () => {
            setThemeMode(current => {
                if (current === THEME_MODES.DARK) return THEME_MODES.LIGHT;
                if (current === THEME_MODES.LIGHT) return THEME_MODES.SYSTEM;
                return THEME_MODES.DARK;
            });
        },
        setDarkMode: () => setThemeMode(THEME_MODES.DARK),
        setLightMode: () => setThemeMode(THEME_MODES.LIGHT),
        setSystemMode: () => setThemeMode(THEME_MODES.SYSTEM),

        // Theme mode constants
        THEME_MODES,
    }), [isDark, colors, shadows, themeMode]);

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook to access theme in components
 * @returns {object} Theme object with colors, typography, shadows, etc.
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

/**
 * Hook for quick access to just colors
 */
export function useColors() {
    const { colors } = useTheme();
    return colors;
}

/**
 * Hook for quick access to dark mode status
 */
export function useIsDark() {
    const { isDark } = useTheme();
    return isDark;
}

export default ThemeContext;
