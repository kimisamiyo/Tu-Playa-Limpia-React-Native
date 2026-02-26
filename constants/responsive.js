import { Dimensions, PixelRatio, Platform } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;
const scale = Math.min(widthScale, heightScale);
export const rw = (size) => Math.round(size * widthScale);
export const rh = (size) => Math.round(size * heightScale);
export const rs = (size) => Math.round(size * scale);
export const rf = (size) => {
    const newSize = size * scale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 768;
export const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;
export const isDesktop = SCREEN_WIDTH >= 1024;
export const SCREEN = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmall: isSmallDevice,
    isMedium: isMediumDevice,
    isLarge: isLargeDevice,
    isTablet: isTablet,
    isDesktop: isDesktop,
};
export const SIDEBAR_WIDTH = 250;
export const CONTENT_MAX_WIDTH = 1200;
export const SPACING = {
    xs: rs(4),
    sm: rs(8),
    md: rs(16),
    lg: rs(24),
    xl: rs(32),
    xxl: rs(48),
    xxxl: rs(64),
};
export const RADIUS = {
    xs: rs(4),
    sm: rs(8),
    md: rs(12),
    lg: rs(16),
    xl: rs(24),
    xxl: rs(32),
    full: rs(999),
};
export const ICON_SIZE = {
    xs: rs(16),
    sm: rs(20),
    md: rs(24),
    lg: rs(32),
    xl: rs(48),
};
export const HEIGHT = {
    button: rh(52),
    buttonSmall: rh(40),
    input: rh(52),
    tabBar: rh(70),
    header: rh(56),
    card: rh(180),
};
