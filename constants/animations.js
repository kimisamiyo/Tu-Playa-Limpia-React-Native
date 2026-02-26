import { Easing } from 'react-native-reanimated';
export const SPRING = {
    snappy: {
        damping: 15,
        stiffness: 400,
        mass: 0.8,
    },
    smooth: {
        damping: 20,
        stiffness: 200,
        mass: 1,
    },
    bouncy: {
        damping: 10,
        stiffness: 150,
        mass: 1,
    },
    gentle: {
        damping: 25,
        stiffness: 100,
        mass: 1,
    },
};
export const TIMING = {
    fast: {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
    normal: {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
    slow: {
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
    enter: {
        duration: 400,
        easing: Easing.bezier(0, 0, 0.2, 1),
    },
    exit: {
        duration: 300,
        easing: Easing.bezier(0.4, 0, 1, 1),
    },
};
export const SCALE = {
    pressed: 0.96,
    pressedSubtle: 0.98,
    hover: 1.02,
    active: 1.05,
};
export const OPACITY = {
    disabled: 0.5,
    pressed: 0.8,
    overlay: 0.7,
    muted: 0.6,
};
export const DURATION = {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
    splash: 3500,
};
export const STAGGER = {
    fast: 50,
    normal: 100,
    slow: 150,
};
export const LOOP = {
    pulse: 2000,
    shimmer: 1500,
    wave: 3000,
    bubble: 4000,
    rotation: 4000,
};
