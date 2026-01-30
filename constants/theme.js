export const COLORS = {
    // Deep Ocean Palette
    primary: '#00334e',    // Deep Navy
    secondary: '#145374',  // Steel Blue
    accent: '#5588a3',     // Lighter Blue
    highlight: '#e8d5b5',  // Luxury Sand / Muted Gold

    // Base
    background: '#f0f4f8', // Ice White/Light Gray
    surface: '#ffffff',
    text: '#00334e',
    textLight: '#ffffff',
    textDim: '#829ab1',

    // Functional
    success: '#4caf50',
    error: '#e53935',
    glass: 'rgba(255, 255, 255, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
};

export const SIZES = {
    h1: 30,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 14,
    radius: 16,
    padding: 24,
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 5,
    },
};
