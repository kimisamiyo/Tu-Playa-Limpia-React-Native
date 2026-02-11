import React, { useMemo } from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, G } from 'react-native-svg';
import { rs } from '../constants/responsive';

// ═══════════════════════════════════════════════════════════════════════════
// SHARED GENERATIVE ART COMPONENT
// procedural SVG patterns based on ID seed
// ═══════════════════════════════════════════════════════════════════════════

// Generate pattern from ID
export const generatePatternFromId = (id) => {
    const hash = id?.toString() || Math.random().toString();
    const seed = hash.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
    return {
        patternType: seed % 6,
        colorVariant: seed % 4,
        rotation: (seed * 37) % 360,
    };
};

// Color palettes
export const NFT_PALETTES = [
    { primary: '#0d4a6f', secondary: '#1a6b8f', accent: '#4a9bb8', bg: '#072d45' },
    { primary: '#1a8f7a', secondary: '#2db99d', accent: '#5fd4bf', bg: '#0d4a3f' },
    { primary: '#d4a574', secondary: '#e8c4a0', accent: '#f5dcc4', bg: '#8b6342' },
    { primary: '#7c3aed', secondary: '#a78bfa', accent: '#c4b5fd', bg: '#4c1d95' },
];

const GenerativeArt = ({ id, size, isDark, pattern: providedPattern }) => {
    // Determine pattern either from prop or generate from ID
    const pattern = useMemo(() => {
        if (providedPattern) return providedPattern;
        return generatePatternFromId(id);
    }, [id, providedPattern]);

    const palette = NFT_PALETTES[pattern.colorVariant];
    const artSize = size; // No padding logic here, caller handles padding or we adjust? 
    // Wait, original subtracted 8rs from size. Let's assume input size is the drawing area size.

    const renderPattern = () => {
        switch (pattern.patternType) {
            case 0: // Waves
                return (
                    <G>
                        {[0, 1, 2, 3].map((i) => (
                            <Path
                                key={i}
                                d={`M 0 ${25 + i * 15} Q ${artSize * 0.25} ${10 + i * 15}, ${artSize * 0.5} ${25 + i * 15} T ${artSize} ${25 + i * 15}`}
                                stroke={i % 2 === 0 ? palette.secondary : palette.accent}
                                strokeWidth={2.5 - i * 0.4}
                                fill="none"
                                opacity={0.9 - i * 0.15}
                            />
                        ))}
                    </G>
                );
            case 1: // Shell
                return (
                    <G transform={`rotate(${pattern.rotation}, ${artSize / 2}, ${artSize / 2})`}>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <Circle
                                key={i}
                                cx={artSize / 2 + Math.cos(i * 1.2) * (10 + i * 6)}
                                cy={artSize / 2 + Math.sin(i * 1.2) * (10 + i * 6)}
                                r={10 - i * 1.2}
                                fill={i % 2 === 0 ? palette.primary : palette.secondary}
                            />
                        ))}
                    </G>
                );
            case 2: // Coral
                return (
                    <G>
                        <Path
                            d={`M ${artSize / 2} ${artSize} L ${artSize / 2} ${artSize * 0.5}
                                M ${artSize / 2} ${artSize * 0.6} L ${artSize * 0.3} ${artSize * 0.35}
                                M ${artSize / 2} ${artSize * 0.6} L ${artSize * 0.7} ${artSize * 0.35}
                                M ${artSize * 0.3} ${artSize * 0.35} L ${artSize * 0.2} ${artSize * 0.2}
                                M ${artSize * 0.7} ${artSize * 0.35} L ${artSize * 0.8} ${artSize * 0.2}`}
                            stroke={palette.primary}
                            strokeWidth={3}
                            strokeLinecap="round"
                            fill="none"
                        />
                        {[0.2, 0.4, 0.6, 0.8].map((x, i) => (
                            <Circle key={i} cx={artSize * x} cy={artSize * 0.2} r={4} fill={palette.accent} />
                        ))}
                    </G>
                );
            case 3: // Starfish
                const outerR = 28;
                const innerR = 10;
                let star = '';
                for (let i = 0; i < 10; i++) {
                    const r = i % 2 === 0 ? outerR : innerR;
                    const angle = (i * Math.PI) / 5 - Math.PI / 2;
                    const x = artSize / 2 + r * Math.cos(angle);
                    const y = artSize / 2 + r * Math.sin(angle);
                    star += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
                }
                star += 'Z';
                return (
                    <G transform={`rotate(${pattern.rotation}, ${artSize / 2}, ${artSize / 2})`}>
                        <Path d={star} fill={palette.primary} />
                        <Circle cx={artSize / 2} cy={artSize / 2} r={6} fill={palette.secondary} />
                    </G>
                );
            case 4: // Dunes
                return (
                    <G>
                        {[0, 1, 2].map((i) => (
                            <Path
                                key={i}
                                d={`M 0 ${artSize - 15 - i * 18}
                                    Q ${artSize * 0.3} ${artSize - 30 - i * 18}, ${artSize * 0.5} ${artSize - 15 - i * 18}
                                    T ${artSize} ${artSize - 15 - i * 18} L ${artSize} ${artSize} L 0 ${artSize} Z`}
                                fill={i === 0 ? palette.secondary : i === 1 ? palette.primary : palette.accent}
                                opacity={0.85 - i * 0.15}
                            />
                        ))}
                        <Circle cx={artSize * 0.8} cy={15} r={12} fill="#fbbf24" opacity={0.9} />
                    </G>
                );
            case 5: // Jellyfish
                return (
                    <G>
                        <Path
                            d={`M ${artSize * 0.3} ${artSize * 0.4}
                                Q ${artSize * 0.5} ${artSize * 0.15}, ${artSize * 0.7} ${artSize * 0.4}
                                Q ${artSize * 0.5} ${artSize * 0.5}, ${artSize * 0.3} ${artSize * 0.4}`}
                            fill={palette.primary}
                        />
                        {[0.38, 0.48, 0.58].map((x, i) => (
                            <Path
                                key={i}
                                d={`M ${artSize * x} ${artSize * 0.45}
                                    Q ${artSize * (x + 0.02)} ${artSize * 0.65}, ${artSize * x} ${artSize * 0.9}`}
                                stroke={palette.accent}
                                strokeWidth={2}
                                fill="none"
                            />
                        ))}
                    </G>
                );
            default:
                return null;
        }
    };

    return (
        <Svg width={artSize} height={artSize} viewBox={`0 0 ${artSize} ${artSize}`}>
            <Defs>
                <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={palette.bg} />
                    <Stop offset="100%" stopColor={isDark ? '#001220' : palette.primary} />
                </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={artSize} height={artSize} fill="url(#bgGrad)" />
            {renderPattern()}
        </Svg>
    );
};

export default GenerativeArt;
