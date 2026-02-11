import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LAYER_IMAGES } from '../constants/nftAssets';

const GenerativeNFT = ({ attributes, width, height }) => {
    if (!attributes || !Array.isArray(attributes)) return null;

    // Filter out 'none' or missing traits
    const validAttributes = attributes.filter(attr => attr.value !== 'None' && attr.value !== 'Ninguno');

    return (
        <View style={[styles.container, { width, height }]}>
            {validAttributes.map((attr, index) => {
                // Construct key for mapping: e.g. "Fondo_Amanecer Costero" or based on filename if we kept it
                // In generator we'll ensure we pass enough info.
                // Using the specific mapping structure: LAYER_IMAGES[LayerName][ElementName]

                const layerImages = LAYER_IMAGES[attr.trait_type];
                const imageSource = layerImages ? layerImages[attr.value] : null;

                if (!imageSource) return null;

                return (
                    <Image
                        key={`${attr.trait_type}-${index}`}
                        source={imageSource}
                        style={[styles.layer, { width, height }]}
                        resizeMode="contain"
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        position: 'relative',
    },
    layer: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
});

export default GenerativeNFT;
