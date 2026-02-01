// ═══════════════════════════════════════════════════════════════════════════
// THEME CONSTANTS - Premium Color Palette for Tu Playa Limpia
// ═══════════════════════════════════════════════════════════════════════════

// Brand Colors - Ocean/Beach inspired
export const BRAND = {
    // Deep ocean tones
    oceanDeep: '#001220',
    oceanDark: '#00334e',
    oceanMid: '#0d5c75',
    oceanLight: '#1a8f9f',

    // Bioluminescence accents (Updated to match Navbar Icon #a8c5d4)
    biolum: '#a8c5d4',       // Previously '#00ffff'
    biolumSoft: '#c1dbe5',   // Lighter variant
    biolumDim: '#547582',    // Darker variant

    // Sand/Gold tones
    sandGold: '#d4a574',
    sandLight: '#e8c4a0',
    sandDark: '#8b6342',

    // Accent colors
    coral: '#ff6b6b',
    seaweed: '#2ed573',

    // Status colors
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
};

// Light Theme - High contrast beach palette
export const LIGHT_THEME = {
    mode: 'light',

    // Backgrounds - Subtle warm tones
    background: '#f5f3ef',           // Warm off-white
    backgroundSecondary: '#faf8f5',  // Lighter cream
    backgroundTertiary: '#e8e4dc',   // Sand beige

    // Surfaces
    surface: '#ffffff',              // Pure white for cards
    surfaceElevated: '#ffffff',
    surfacePressed: '#f0ece3',

    // Text - HIGH CONTRAST (black for readability)
    text: '#1a1a1a',                 // Near black
    textSecondary: '#4a4a4a',        // Dark gray
    textMuted: '#6b7280',            // Medium gray
    textInverse: '#ffffff',

    // Primary brand - Deep ocean
    primary: '#0d4a6f',
    primaryLight: '#1a6b8f',
    primaryDark: '#072d45',

    // Secondary
    secondary: '#1a6b8f',
    secondaryLight: '#4a9bb8',

    // Accent
    accent: '#d4a574',
    accentDark: '#b8844c',

    // Borders - Visible but subtle
    border: 'rgba(0, 0, 0, 0.1)',
    borderStrong: 'rgba(0, 0, 0, 0.2)',

    // Glass effects
    glass: 'rgba(255, 255, 255, 0.95)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    glassOverlay: 'rgba(255, 255, 255, 0.9)',

    // Shadows
    shadowColor: '#000000',

    // Tab bar
    tabBar: 'rgba(255, 255, 255, 0.98)',
    tabBarBorder: 'rgba(0, 0, 0, 0.08)',
    tabInactive: '#9ca3af',
    tabActive: '#0d4a6f',

    // Cards
    card: '#ffffff',
    cardBorder: 'rgba(0, 0, 0, 0.08)',

    // Status
    success: BRAND.success,
    error: BRAND.error,
    warning: BRAND.warning,
    info: BRAND.info,
};

// Dark Theme
export const DARK_THEME = {
    mode: 'dark',

    // Backgrounds
    background: BRAND.oceanDeep,
    backgroundSecondary: '#001830',
    backgroundTertiary: '#002040',

    // Surfaces
    surface: '#0a1f2e',
    surfaceElevated: '#0d2a3d',
    surfacePressed: '#051520',

    // Text
    text: '#ffffff',
    textSecondary: '#a8c5d4',
    textMuted: '#6b8a99',
    textInverse: '#1a1a1a',

    // Primary
    primary: BRAND.biolum,
    primaryLight: '#66ffff',
    primaryDark: BRAND.biolumDim,

    // Secondary
    secondary: BRAND.oceanLight,
    secondaryLight: '#4ab5c5',

    // Accent
    accent: BRAND.sandGold,
    accentDark: BRAND.sandDark,

    // Borders
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',

    // Glass effects
    glass: 'rgba(10, 31, 46, 0.85)',
    glassBorder: 'rgba(0, 255, 255, 0.15)',
    glassOverlay: 'rgba(0, 18, 32, 0.9)',

    // Shadows
    shadowColor: '#000000',

    // Tab bar
    tabBar: 'rgba(10, 31, 46, 0.95)',
    tabBarBorder: 'rgba(0, 255, 255, 0.1)',
    tabInactive: '#4a6575',
    tabActive: BRAND.biolum,

    // Cards
    card: '#0a1f2e',
    cardBorder: 'rgba(0, 255, 255, 0.1)',

    // Status
    success: BRAND.success,
    error: BRAND.error,
    warning: BRAND.warning,
    info: BRAND.info,
};

// Gradients
export const GRADIENTS = {
    oceanSurface: [BRAND.oceanMid, BRAND.oceanDark],
    oceanDeep: [BRAND.oceanDark, BRAND.oceanDeep],
    primaryButton: [BRAND.oceanMid, BRAND.oceanDark],
    gold: [BRAND.sandGold, BRAND.sandDark],
    biolum: [BRAND.biolum, BRAND.biolumDim],
};

// Typography scale
export const TYPOGRAPHY = {
    hero: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
    h1: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
    h3: { fontSize: 20, fontWeight: '600' },
    h4: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    bodySmall: { fontSize: 14, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '500' },
    overline: { fontSize: 10, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
};

// Legacy COLORS export for backward compatibility
export const COLORS = {
    primary: BRAND.oceanDark,
    secondary: BRAND.oceanMid,
    accent: BRAND.sandGold,
    background: BRAND.oceanDeep,
    text: '#ffffff',
    textSecondary: '#a8c5d4',
    surface: '#0a1f2e',
};

// ═══════════════════════════════════════════════════════════════════════════
// CREATE SHADOWS - Theme-aware shadow generator (REQUIRED BY ThemeContext)
// ═══════════════════════════════════════════════════════════════════════════
export const createShadows = (isDark) => ({
    sm: {
        shadowColor: isDark ? '#000000' : '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: isDark ? '#000000' : '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.4 : 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: isDark ? '#000000' : '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.5 : 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    xl: {
        shadowColor: isDark ? '#000000' : '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.6 : 0.2,
        shadowRadius: 24,
        elevation: 16,
    },
    glow: {
        shadowColor: isDark ? BRAND.biolum : BRAND.oceanMid,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
});
