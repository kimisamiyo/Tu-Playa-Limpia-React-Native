import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { LIGHT_THEME, DARK_THEME, createShadows, BRAND, GRADIENTS, TYPOGRAPHY } from '../constants/theme';
import { SPACING, RADIUS, HEIGHT, ICON_SIZE } from '../constants/responsive';
const ThemeContext = createContext(null);
const THEME_MODES = {
    SYSTEM: 'system',
    LIGHT: 'light',
    DARK: 'dark',
};
export function ThemeProvider({ children }) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState(THEME_MODES.SYSTEM);
    const isDark = useMemo(() => {
        if (themeMode === THEME_MODES.SYSTEM) {
            return systemColorScheme === 'dark';
        }
        return themeMode === THEME_MODES.DARK;
    }, [themeMode, systemColorScheme]);
    const colors = useMemo(() => {
        return isDark ? DARK_THEME : LIGHT_THEME;
    }, [isDark]);
    const shadows = useMemo(() => {
        return createShadows(isDark);
    }, [isDark]);
    const theme = useMemo(() => ({
        isDark,
        mode: isDark ? 'dark' : 'light',
        colors,
        brand: BRAND,
        gradients: GRADIENTS,
        typography: TYPOGRAPHY,
        spacing: SPACING,
        radius: RADIUS,
        height: HEIGHT,
        iconSize: ICON_SIZE,
        shadows,
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
        THEME_MODES,
    }), [isDark, colors, shadows, themeMode]);
    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
export function useColors() {
    const { colors } = useTheme();
    return colors;
}
export function useIsDark() {
    const { isDark } = useTheme();
    return isDark;
}
export default ThemeContext;
