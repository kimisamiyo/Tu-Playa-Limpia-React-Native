import { Easing } from 'react-native-reanimated';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION PRESETS - Reusable animation configurations for premium feel
// ═══════════════════════════════════════════════════════════════════════════

// Spring configurations
export const SPRING = {
    // Snappy feedback for buttons
    snappy: {
        damping: 15,
        stiffness: 400,
        mass: 0.8,
    },
    // Smooth transitions
    smooth: {
        damping: 20,
        stiffness: 200,
        mass: 1,
    },
    // Bouncy for playful elements
    bouncy: {
        damping: 10,
        stiffness: 150,
        mass: 1,
    },
    // Gentle for subtle animations
    gentle: {
        damping: 25,
        stiffness: 100,
        mass: 1,
    },
};

// Timing configurations
export const TIMING = {
    // Fast micro-interactions
    fast: {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
    // Normal transitions
    normal: {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
    // Slow, smooth transitions
    slow: {
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
    // Enter animations
    enter: {
        duration: 400,
        easing: Easing.bezier(0, 0, 0.2, 1),
    },
    // Exit animations
    exit: {
        duration: 300,
        easing: Easing.bezier(0.4, 0, 1, 1),
    },
};

// Scale presets
export const SCALE = {
    pressed: 0.96,
    pressedSubtle: 0.98,
    hover: 1.02,
    active: 1.05,
};

// Opacity presets
export const OPACITY = {
    disabled: 0.5,
    pressed: 0.8,
    overlay: 0.7,
    muted: 0.6,
};

// Duration presets (ms)
export const DURATION = {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
    splash: 3500,
};

// Stagger delays for list animations
export const STAGGER = {
    fast: 50,
    normal: 100,
    slow: 150,
};

// Loop animation durations
export const LOOP = {
    pulse: 2000,
    shimmer: 1500,
    wave: 3000,
    bubble: 4000,
    rotation: 4000,
};
