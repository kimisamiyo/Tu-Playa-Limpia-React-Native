import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { rs, RADIUS } from '../constants/responsive';

const GlassCard = ({ children, variant = 'default', style }) => {
  const { colors, isDark } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        };
      case 'flat':
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
        };
      default:
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.85)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
    }
  };

  return (
    <View style={[styles.container, getVariantStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
});

export default GlassCard;
