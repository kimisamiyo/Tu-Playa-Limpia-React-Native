import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    Modal,
    ActivityIndicator,
    Platform,
    Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { BRAND, GRADIENTS } from '../constants/theme';
import { rs, rf, rh, SPACING, RADIUS, SCREEN } from '../constants/responsive';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const BLUE_GREY = '#607d8b'; // Main Blue Grey
const BLUE_GREY_DARK = '#455a64';
const BLUE_GREY_LIGHT = '#cfd8dc';
const BLUE_GREY_BG = 'rgba(96, 125, 139, 0.15)';

// ═══════════════════════════════════════════════════════════════════════════
// LIMA BEACHES DATABASE
// ═══════════════════════════════════════════════════════════════════════════
const LIMA_BEACHES = [
    { id: 1, name: 'Playa Miramar', zone: 'Lima Norte', district: 'Ancón', lat: -11.7695, lng: -77.1758, image: 'http://googleusercontent.com/image_collection/image_retrieval/12098668774628945837_0', clean: true, people: 0 },
    { id: 2, name: 'Playa Las Conchitas', zone: 'Lima Norte', district: 'Ancón', lat: -11.7588, lng: -77.1732, image: 'http://googleusercontent.com/image_collection/image_retrieval/9350125998810273840_0', clean: true, people: 0 },
    { id: 3, name: 'Playa Pocitos', zone: 'Lima Norte', district: 'Ancón', lat: -11.7725, lng: -77.1789, image: 'http://googleusercontent.com/image_collection/image_retrieval/12098668774628945837_0', clean: false, people: 0 },
    { id: 4, name: 'Playa Hermosa', zone: 'Lima Norte', district: 'Ancón', lat: -11.7772, lng: -77.1803, image: 'http://googleusercontent.com/image_collection/image_retrieval/2991879153895291309_0', clean: true, people: 0 },
    { id: 5, name: 'Playa Chica', zone: 'Lima Norte', district: 'Santa Rosa', lat: -11.8015, lng: -77.1688, image: 'http://googleusercontent.com/image_collection/image_retrieval/4234238059033332624_0', clean: true, people: 0 },
    { id: 6, name: 'Playa Grande', zone: 'Lima Norte', district: 'Santa Rosa', lat: -11.8082, lng: -77.1655, image: 'http://googleusercontent.com/image_collection/image_retrieval/4234238059033332624_0', clean: true, people: 0 },
    { id: 7, name: 'Los Delfines', zone: 'Lima Centro', district: 'Miraflores', lat: -12.1192, lng: -77.0435, image: 'http://googleusercontent.com/image_collection/image_retrieval/15442054068016348752_0', clean: true, people: 0 },
    { id: 8, name: 'Punta Roquitas', zone: 'Lima Centro', district: 'Miraflores', lat: -12.1215, lng: -77.0418, image: 'http://googleusercontent.com/image_collection/image_retrieval/4415167619125315981_0', clean: true, people: 0 },
    { id: 9, name: 'La Pampilla', zone: 'Lima Centro', district: 'Miraflores', lat: -12.1234, lng: -77.0402, image: 'http://googleusercontent.com/image_collection/image_retrieval/5425523489229387305_0', clean: true, people: 0 },
    { id: 10, name: 'Waikiki', zone: 'Lima Centro', district: 'Miraflores', lat: -12.1275, lng: -77.0377, image: 'http://googleusercontent.com/image_collection/image_retrieval/13528375338114968724_0', clean: true, people: 0 },
    { id: 11, name: 'Makaha', zone: 'Lima Centro', district: 'Miraflores', lat: -12.1287, lng: -77.0369, image: 'http://googleusercontent.com/image_collection/image_retrieval/9106905456784631900_0', clean: true, people: 0 },
    { id: 12, name: 'Redondo', zone: 'Lima Centro', district: 'Miraflores', lat: -12.1315, lng: -77.0352, image: 'http://googleusercontent.com/image_collection/image_retrieval/8755651127993604943_0', clean: true, people: 0 },
    { id: 13, name: 'La Estrella', zone: 'Lima Centro', district: 'Miraflores', lat: -12.1342, lng: -77.0335, image: 'http://googleusercontent.com/image_collection/image_retrieval/9304157753602949464_0', clean: false, people: 0 },
    { id: 14, name: 'Las Cascadas', zone: 'Lima Centro', district: 'Barranco', lat: -12.1438, lng: -77.0289, image: 'http://googleusercontent.com/image_collection/image_retrieval/1514262505119911213_0', clean: true, people: 0 },
    { id: 15, name: 'Barranquito', zone: 'Lima Centro', district: 'Barranco', lat: -12.1472, lng: -77.0275, image: 'http://googleusercontent.com/image_collection/image_retrieval/1514262505119911213_0', clean: true, people: 0 },
    { id: 16, name: 'Los Pavos', zone: 'Lima Centro', district: 'Barranco', lat: -12.1505, lng: -77.0263, image: 'http://googleusercontent.com/image_collection/image_retrieval/4581299634875604549_0', clean: false, people: 0 },
    { id: 17, name: 'Los Yuyos', zone: 'Lima Centro', district: 'Barranco', lat: -12.1528, lng: -77.0255, image: 'http://googleusercontent.com/image_collection/image_retrieval/4581299634875604549_0', clean: false, people: 0 },
    { id: 18, name: 'Las Sombrillas', zone: 'Lima Centro', district: 'Barranco', lat: -12.1569, lng: -77.0258, image: 'http://googleusercontent.com/image_collection/image_retrieval/4581299634875604549_0', clean: true, people: 0 },
    { id: 19, name: 'Agua Dulce', zone: 'Lima Centro', district: 'Chorrillos', lat: -12.1612, lng: -77.0266, image: 'http://googleusercontent.com/image_collection/image_retrieval/10147769838552140328_0', clean: false, people: 0 },
    { id: 20, name: 'Pescadores', zone: 'Lima Centro', district: 'Chorrillos', lat: -12.1645, lng: -77.0278, image: 'http://googleusercontent.com/image_collection/image_retrieval/10147769838552140328_0', clean: false, people: 0 },
    { id: 21, name: 'La Herradura', zone: 'Lima Centro', district: 'Chorrillos', lat: -12.1744, lng: -77.0336, image: 'http://googleusercontent.com/image_collection/image_retrieval/4415167619125315497_0', clean: false, people: 0 },
    { id: 22, name: 'La Chira', zone: 'Lima Centro', district: 'Chorrillos', lat: -12.1885, lng: -77.0405, image: 'http://googleusercontent.com/image_collection/image_retrieval/4415167619125315497_0', clean: false, people: 0 },
    { id: 23, name: 'Playa Venecia', zone: 'Lima Sur', district: 'Villa El Salvador', lat: -12.2355, lng: -76.9758, image: 'http://googleusercontent.com/image_collection/image_retrieval/16251957852010507805_0', clean: true, people: 0 },
    { id: 24, name: 'Barlovento', zone: 'Lima Sur', district: 'Villa El Salvador', lat: -12.2452, lng: -76.9655, image: 'http://googleusercontent.com/image_collection/image_retrieval/16251957852010507805_0', clean: true, people: 0 },
    { id: 25, name: 'San Pedro', zone: 'Lima Sur', district: 'Lurín', lat: -12.2685, lng: -76.9248, image: 'http://googleusercontent.com/image_collection/image_retrieval/15442054068016347587_0', clean: true, people: 0 },
    { id: 26, name: 'Arica', zone: 'Lima Sur', district: 'Lurín', lat: -12.2785, lng: -76.9125, image: 'http://googleusercontent.com/image_collection/image_retrieval/4234238059033329921_0', clean: false, people: 0 },
    { id: 27, name: 'Los Pulpos', zone: 'Lima Sur', district: 'Lurín', lat: -12.2882, lng: -76.9015, image: 'http://googleusercontent.com/image_collection/image_retrieval/9556956261350643755_0', clean: true, people: 0 },
    { id: 28, name: 'El Silencio', zone: 'Sur Chico', district: 'Punta Hermosa', lat: -12.3153, lng: -76.8364, image: 'http://googleusercontent.com/image_collection/image_retrieval/12170764564398274593_0', clean: true, people: 0 },
    { id: 29, name: 'Caballeros', zone: 'Sur Chico', district: 'Punta Hermosa', lat: -12.3297, lng: -76.8319, image: 'http://googleusercontent.com/image_collection/image_retrieval/9048603210385633278_0', clean: true, people: 0 },
    { id: 30, name: 'Señoritas', zone: 'Sur Chico', district: 'Punta Hermosa', lat: -12.3315, lng: -76.8292, image: 'http://googleusercontent.com/image_collection/image_retrieval/5540709583569388708_0', clean: true, people: 0 },
    { id: 31, name: 'Playa Norte (Isla)', zone: 'Sur Chico', district: 'Punta Hermosa', lat: -12.3335, lng: -76.8242, image: 'http://googleusercontent.com/image_collection/image_retrieval/12170764564398274593_0', clean: true, people: 0 },
    { id: 32, name: 'Playa Blanca', zone: 'Sur Chico', district: 'Punta Hermosa', lat: -12.3365, lng: -76.8215, image: 'http://googleusercontent.com/image_collection/image_retrieval/12170764564398274593_0', clean: true, people: 0 },
    { id: 33, name: 'Kontiki', zone: 'Sur Chico', district: 'Punta Hermosa', lat: -12.3392, lng: -76.8188, image: 'http://googleusercontent.com/image_collection/image_retrieval/12170764564398274593_0', clean: true, people: 0 },
    { id: 34, name: 'Punta Rocas', zone: 'Sur Chico', district: 'Punta Negra', lat: -12.3619, lng: -76.8047, image: 'http://googleusercontent.com/image_collection/image_retrieval/8490164425596468136_0', clean: true, people: 0 },
    { id: 35, name: 'Punta Negra', zone: 'Sur Chico', district: 'Punta Negra', lat: -12.3665, lng: -76.7985, image: 'http://googleusercontent.com/image_collection/image_retrieval/16197627442249995180_0', clean: true, people: 0 },
    { id: 36, name: 'San Bartolo Norte', zone: 'Sur Chico', district: 'San Bartolo', lat: -12.3885, lng: -76.7825, image: 'http://googleusercontent.com/image_collection/image_retrieval/9304157753602950553_0', clean: true, people: 0 },
    { id: 37, name: 'San Bartolo Sur', zone: 'Sur Chico', district: 'San Bartolo', lat: -12.3945, lng: -76.7788, image: 'http://googleusercontent.com/image_collection/image_retrieval/9304157753602950553_0', clean: false, people: 0 },
    { id: 38, name: 'Santa María', zone: 'Sur Chico', district: 'Santa María', lat: -12.4045, lng: -76.7715, image: 'http://googleusercontent.com/image_collection/image_retrieval/1514262505119909208_0', clean: true, people: 0 },
    { id: 39, name: 'Embajadores', zone: 'Sur Chico', district: 'Santa María', lat: -12.4095, lng: -76.7758, image: 'http://googleusercontent.com/image_collection/image_retrieval/12269554642538269264_0', clean: true, people: 0 },
    { id: 40, name: 'Naplo', zone: 'Sur Grande', district: 'Pucusana', lat: -12.4792, lng: -76.7885, image: 'http://googleusercontent.com/image_collection/image_retrieval/10147769838552140237_0', clean: true, people: 0 },
    { id: 41, name: 'Pucusana', zone: 'Sur Grande', district: 'Pucusana', lat: -12.4815, lng: -76.7962, image: 'http://googleusercontent.com/image_collection/image_retrieval/10147769838552140237_0', clean: true, people: 0 },
    { id: 42, name: 'Las Ninfas', zone: 'Sur Grande', district: 'Pucusana', lat: -12.4845, lng: -76.7988, image: 'http://googleusercontent.com/image_collection/image_retrieval/10147769838552140237_0', clean: false, people: 0 },
    { id: 43, name: 'Chilca (Yaya)', zone: 'Sur Grande', district: 'Chilca', lat: -12.5055, lng: -76.7455, image: 'http://googleusercontent.com/image_collection/image_retrieval/10147769838552140237_0', clean: true, people: 0 },
    { id: 44, name: 'Puerto Viejo', zone: 'Sur Grande', district: 'San Antonio', lat: -12.5694, lng: -76.7111, image: 'http://googleusercontent.com/image_collection/image_retrieval/13080852119667066337_0', clean: true, people: 0 },
    { id: 45, name: 'León Dormido', zone: 'Sur Grande', district: 'San Antonio', lat: -12.6316, lng: -76.6685, image: 'http://googleusercontent.com/image_collection/image_retrieval/7654971804938497510_0', clean: true, people: 0 },
    { id: 46, name: 'Bujama', zone: 'Sur Grande', district: 'Mala', lat: -12.7058, lng: -76.6345, image: 'http://googleusercontent.com/image_collection/image_retrieval/16251957852010504646_0', clean: true, people: 0 },
    { id: 47, name: 'Totoritas', zone: 'Sur Grande', district: 'Mala', lat: -12.7215, lng: -76.6288, image: 'http://googleusercontent.com/image_collection/image_retrieval/16251957852010504646_0', clean: true, people: 0 },
    { id: 48, name: 'Asia (Boulevard)', zone: 'Sur Grande', district: 'Asia', lat: -12.7792, lng: -76.6083, image: 'http://googleusercontent.com/image_collection/image_retrieval/15442054068016346422_0', clean: true, people: 0 },
    { id: 49, name: 'Cayma', zone: 'Sur Grande', district: 'Asia', lat: -12.7955, lng: -76.5985, image: 'http://googleusercontent.com/image_collection/image_retrieval/15442054068016346422_0', clean: true, people: 0 },
    { id: 50, name: 'Sarapampa', zone: 'Sur Grande', district: 'Asia', lat: -12.8355, lng: -76.5815, image: 'http://googleusercontent.com/image_collection/image_retrieval/15442054068016346422_0', clean: true, people: 0 },
    { id: 51, name: 'Chepeconde', zone: 'Sur Grande', district: 'Cerro Azul', lat: -12.9285, lng: -76.5385, image: 'http://googleusercontent.com/image_collection/image_retrieval/5425523489229387646_0', clean: true, people: 0 },
    { id: 52, name: 'Cerro Azul', zone: 'Sur Grande', district: 'Cerro Azul', lat: -13.0268, lng: -76.4837, image: 'http://googleusercontent.com/image_collection/image_retrieval/5425523489229387646_0', clean: true, people: 0 },
];

const LIMA_CENTER = { lat: -12.1200, lng: -77.0300 };

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatTime = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}min`;
};

const findNearestBeach = (location) => {
    if (!location) return LIMA_BEACHES[0];
    let nearest = LIMA_BEACHES[0], minDist = Infinity;
    LIMA_BEACHES.forEach(b => {
        const d = calculateDistance(location.lat, location.lng, b.lat, b.lng);
        if (d < minDist) { minDist = d; nearest = b; }
    });
    return nearest;
};

// ═══════════════════════════════════════════════════════════════════════════
// LEAFLET MAP HTML
// ═══════════════════════════════════════════════════════════════════════════
const generateMapHTML = (origin, destination, isDark, routeCoords) => {
    // Robust default values
    const centerLat = destination?.lat || origin?.lat || LIMA_CENTER.lat;
    const centerLng = destination?.lng || origin?.lng || LIMA_CENTER.lng;
    const zoom = destination ? 13 : 11;

    // Theme colors
    const bgColor = isDark ? '#0a1f2e' : '#f5f5f5';
    const routeColor = '#1e3a5f';
    const popupBg = isDark ? '#1b233d' : '#ffffff';
    const popupText = isDark ? '#ffffff' : '#000000';
    const popupSubText = isDark ? 'rgba(170, 222, 243, 0.8)' : '#333333';
    const popupZoneText = isDark ? 'rgba(170, 222, 243, 0.5)' : '#666666';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; background: ${bgColor}; }
        #map { width: 100%; height: 100%; }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important; }
        .leaflet-control-zoom a { background: ${isDark ? '#0d3a4d' : '#000'} !important; color: ${isDark ? '#8ec3b9' : '#fff'} !important; border: none !important; }
        
        .beach-marker { background: #fff; border-radius: 50%; border: 2.5px solid; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); cursor: pointer; transition: transform 0.2s; }
        .beach-marker:hover { transform: scale(1.15); }
        .origin-marker { background: ${BLUE_GREY}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(96,125,139,0.5); }
        .destination-marker { background: linear-gradient(135deg, ${BLUE_GREY_DARK}, ${BLUE_GREY_LIGHT}); width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(96,125,139,0.6); } 50% { box-shadow: 0 0 0 10px rgba(96,125,139,0); } }
        
        .leaflet-popup-content-wrapper { padding: 0 !important; border-radius: 12px !important; overflow: hidden !important; box-shadow: 0 8px 24px rgba(0,0,0,0.25) !important; background: ${popupBg} !important; }
        .leaflet-popup-content { margin: 0 !important; width: 180px !important; }
        .leaflet-popup-tip { background: ${popupBg} !important; }
        .leaflet-popup-close-button { color: ${isDark ? 'white' : 'black'} !important; font-size: 18px !important; top: 6px !important; right: 8px !important; }
        
        .beach-card { width: 180px; background: ${popupBg}; }
        .beach-card-img { width: 100%; height: 80px; object-fit: cover; background: linear-gradient(45deg, ${BLUE_GREY}, ${BLUE_GREY_LIGHT}); }
        .beach-card-img-fallback { background: linear-gradient(45deg, ${BLUE_GREY}, ${BLUE_GREY_LIGHT}) !important; object-fit: contain !important; }
        
        .beach-card-body { padding: 10px; }
        .beach-card-name { color: ${popupText}; font-weight: 700; font-size: 13px; margin-bottom: 2px; }
        .beach-card-district { color: ${popupSubText}; font-size: 10px; margin-bottom: 4px; }
        .beach-card-zone { color: ${popupZoneText}; font-size: 9px; margin-bottom: 6px; }
        .beach-card-stats { display: flex; justify-content: space-between; gap: 4px; }
        .beach-card-stat { flex: 1; text-align: center; padding: 3px 2px; background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; border-radius: 4px; }
        .stat-value { color: ${popupText}; font-size: 10px; font-weight: 600; display: block; }
        .stat-label { color: ${popupZoneText}; font-size: 8px; }
        .stat-clean { background: ${BLUE_GREY_BG}; }
        .stat-dirty { background: rgba(245,158,11,0.15); }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        try {
            var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([${centerLat}, ${centerLng}], ${zoom});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
            
            var beaches = ${JSON.stringify(LIMA_BEACHES)};
            var selectedId = ${destination?.id || 'null'};
            
            beaches.forEach(function(b) {
                var isSelected = b.id === selectedId;
                var color = b.clean ? '${BLUE_GREY}' : '#f59e0b';
                var statusClass = b.clean ? 'stat-clean' : 'stat-dirty';
                var statusText = b.clean ? '✓ Limpia' : '⚠ Sucia';
                
                // Simplified quoting for on error handler
                var popupContent = '<div class="beach-card">' +
                    '<img class="beach-card-img" src="' + b.image + '" onerror="this.classList.add(\\'beach-card-img-fallback\\'); this.removeAttribute(\\'src\\');" />' +
                    '<div class="beach-card-body">' +
                        '<div class="beach-card-name">' + (isSelected ? '🎯 ' : '') + b.name + '</div>' +
                        '<div class="beach-card-district">' + b.district + '</div>' +
                        '<div class="beach-card-zone">📍 ' + b.zone + '</div>' +
                        '<div class="beach-card-stats">' +
                            '<div class="beach-card-stat ' + statusClass + '"><span class="stat-value">' + statusText + '</span></div>' +
                            '<div class="beach-card-stat"><span class="stat-value">👥 ' + b.people + '</span><span class="stat-label">limpiando</span></div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
                
                if (isSelected) {
                    var icon = L.divIcon({ className: '', html: '<div class="destination-marker"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
                    L.marker([b.lat, b.lng], { icon: icon }).addTo(map).bindPopup(popupContent, { maxWidth: 200 }).openPopup();
                } else {
                    var icon = L.divIcon({ className: '', html: '<div class="beach-marker" style="width:26px;height:26px;border-color:' + color + '">' + (b.clean ? '🏖️' : '⚠️') + '</div>', iconSize: [26, 26], iconAnchor: [13, 13] });
                    L.marker([b.lat, b.lng], { icon: icon }).addTo(map).bindPopup(popupContent, { maxWidth: 200 });
                }
            });
            
            ${origin ? `L.marker([${origin.lat}, ${origin.lng}], { icon: L.divIcon({ className: '', html: '<div class="origin-marker"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }) }).addTo(map).bindPopup('<div class="beach-card"><div class="beach-card-body"><div class="beach-card-name">📍 Tu ubicación</div></div></div>', { maxWidth: 180 });` : ''}
            
            ${origin && destination && routeCoords && routeCoords.length > 0 ? `
                var coords = ${JSON.stringify(routeCoords)};
                L.polyline(coords.map(c => [c.lat, c.lng]), { color: '${routeColor}', weight: 5, opacity: 0.9, lineCap: 'round' }).addTo(map);
                map.fitBounds([[${origin.lat}, ${origin.lng}], [${destination.lat}, ${destination.lng}]], { padding: [50, 50] });
            ` : origin && destination ? `
                L.polyline([[${origin.lat}, ${origin.lng}], [${destination.lat}, ${destination.lng}]], { color: '${routeColor}', weight: 4, opacity: 0.8, dashArray: '10, 6' }).addTo(map);
                map.fitBounds([[${origin.lat}, ${origin.lng}], [${destination.lat}, ${destination.lng}]], { padding: [50, 50] });
            ` : ''}
        } catch(e) {
            // alert('Map Error: ' + e.message); // Uncomment for debugging
        }
    </script>
</body>
</html>`;
};

// ═══════════════════════════════════════════════════════════════════════════
// BEACH SELECTOR MODAL
// ═══════════════════════════════════════════════════════════════════════════
const BeachSelector = ({ visible, onClose, onSelect, origin }) => {
    const { colors, isDark } = useTheme();
    const [search, setSearch] = useState('');
    const filtered = LIMA_BEACHES.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.district.toLowerCase().includes(search.toLowerCase()) ||
        b.zone.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => origin ? calculateDistance(origin.lat, origin.lng, a.lat, a.lng) - calculateDistance(origin.lat, origin.lng, b.lat, b.lng) : 0);

    const textColor = isDark ? colors.text : '#000000';
    const subTextColor = isDark ? colors.textMuted : '#333333';
    const cardBg = isDark ? 'rgba(0,255,255,0.05)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(0,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: isDark ? BRAND.oceanDark : colors.surface }]}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Seleccionar Playa ({LIMA_BEACHES.length})</Text>
                        <TouchableOpacity onPress={onClose}><Ionicons name="close" size={rs(22)} color={textColor} /></TouchableOpacity>
                    </View>
                    <View style={[styles.modalSearch, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name="search" size={rs(16)} color={subTextColor} />
                        <TextInput style={[styles.modalSearchInput, { color: textColor }]} placeholder="Buscar playa, distrito o zona..." placeholderTextColor={subTextColor} value={search} onChangeText={setSearch} />
                    </View>
                    <ScrollView style={styles.beachList} showsVerticalScrollIndicator={false}>
                        {filtered.map(b => {
                            const dist = origin ? calculateDistance(origin.lat, origin.lng, b.lat, b.lng) : null;
                            return (
                                <TouchableOpacity key={b.id} onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSelect(b); onClose(); }}
                                    style={[styles.beachItem, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                                    {/* Beach Photo */}
                                    {Platform.OS === 'web' ? (
                                        <img src={b.image} alt={b.name} style={{ width: rs(50), height: rs(50), borderRadius: RADIUS.sm, objectFit: 'cover', marginRight: SPACING.sm, backgroundColor: isDark ? '#0d3a4d' : '#e5e5e5' }} />
                                    ) : (
                                        <View style={[styles.beachPhoto, { backgroundColor: isDark ? '#0d3a4d' : '#e5e5e5' }]}>
                                            <Text style={{ fontSize: rs(22) }}>{b.clean ? '🏖️' : '⚠️'}</Text>
                                        </View>
                                    )}
                                    <View style={styles.beachInfo}>
                                        <Text style={[styles.beachName, { color: textColor }]}>{b.name}</Text>
                                        <Text style={[styles.beachDistrict, { color: subTextColor }]}>{b.district} · {b.zone}</Text>
                                        <View style={styles.beachBadges}>
                                            <View style={[styles.miniBadge, { backgroundColor: b.clean ? BLUE_GREY_BG : `${BRAND.warning}15` }]}>
                                                <Text style={{ fontSize: rf(9), color: b.clean ? BLUE_GREY : BRAND.warning }}>{b.clean ? '✓ Limpia' : '⚠ Sucia'}</Text>
                                            </View>
                                            <View style={[styles.miniBadge, { backgroundColor: BLUE_GREY_BG }]}>
                                                <Text style={{ fontSize: rf(9), color: BLUE_GREY }}>👥 {b.people}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {dist && <Text style={[styles.distValue, { color: BLUE_GREY }]}>~{dist.toFixed(1)} km</Text>}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export default function BeachMapScreen() {
    const { colors, shadows, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const webViewRef = useRef(null);

    // Robust default values
    const safeColors = colors || { text: '#000', textMuted: '#888', background: '#fff', border: '#ccc', primary: BLUE_GREY, surface: '#fff' };
    const safeIsDark = isDark || false;

    const [origin, setOrigin] = useState(null);
    const [originInput, setOriginInput] = useState('');
    const [destination, setDestination] = useState(null);
    const [showBeachSelector, setShowBeachSelector] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [routeCoords, setRouteCoords] = useState([]);
    const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null });
    const [mapKey, setMapKey] = useState(0);

    const BOTTOM_MARGIN = rs(110) + insets.bottom;

    // High contrast colors for Light Mode
    const textColor = safeIsDark ? safeColors.text : '#000000';
    const subTextColor = safeIsDark ? safeColors.textMuted : '#333333';
    const cardBg = safeIsDark ? BRAND.oceanDark + 'EE' : '#ffffffEE'; // White card in light mode
    const inputBoxBg = safeIsDark ? 'rgba(0,0,0,0.25)' : '#ffffff'; // White input box
    const inputBoxBorder = safeIsDark ? safeColors.border : '#cccccc'; // Darker border in light mode

    const fetchRoute = async (orig, dest) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${orig.lng},${orig.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes?.[0]) {
                const r = data.routes[0];
                setRouteCoords(r.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] })));
                setRouteInfo({ distance: r.distance / 1000, duration: r.duration / 60 });
            }
        } catch (e) {
            const d = calculateDistance(orig.lat, orig.lng, dest.lat, dest.lng);
            setRouteInfo({ distance: d, duration: d * 2 });
        }
    };

    const getLocation = async () => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsLoadingLocation(true);
        try {
            if (Platform.OS === 'web') {
                if (!navigator.geolocation) throw new Error('Geolocalización no soportada');
                const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, e => rej(new Error(e.code === 1 ? 'Permiso denegado' : 'Error de ubicación')), { enableHighAccuracy: true, timeout: 10000 }));
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setOrigin(loc);
                setOriginInput(`📍 ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
                const nearest = findNearestBeach(loc);
                setDestination(nearest);
                await fetchRoute(loc, nearest);
                setMapKey(k => k + 1);
            } else {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') throw new Error('Permiso denegado');
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                const newOrigin = { lat: loc.coords.latitude, lng: loc.coords.longitude };
                setOrigin(newOrigin);
                setOriginInput('📍 Mi ubicación');
                const nearest = findNearestBeach(newOrigin);
                setDestination(nearest);
                await fetchRoute(newOrigin, nearest);
                setMapKey(k => k + 1);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (e) { Alert.alert('Error', e.message); }
        setIsLoadingLocation(false);
    };

    useEffect(() => { if (origin && destination) { fetchRoute(origin, destination); setMapKey(k => k + 1); } }, [destination?.id]);

    const mapHTML = generateMapHTML(origin, destination, safeIsDark, routeCoords);

    return (
        <View style={[styles.container, { backgroundColor: safeIsDark ? BRAND.oceanDeep : safeColors.background }]}>
            {/* MAP */}
            <View style={styles.mapContainer}>
                {Platform.OS === 'web' ? (
                    <iframe key={mapKey} srcDoc={mapHTML} style={{ width: '100%', height: '100%', border: 'none' }} title="Map" />
                ) : (
                    <WebView key={mapKey} ref={webViewRef} source={{ html: mapHTML }} style={{ flex: 1 }} scrollEnabled={false} javaScriptEnabled domStorageEnabled startInLoadingState
                        renderLoading={() => <View style={[styles.loading, { backgroundColor: safeIsDark ? BRAND.oceanDeep : safeColors.background }]}><ActivityIndicator size="large" color={BLUE_GREY} /></View>}
                    />
                )}
            </View>

            {/* TOP PANEL */}
            <SafeAreaView style={styles.topPanel} edges={['top']}>
                <View style={[styles.topCard, shadows.md, { backgroundColor: cardBg }]}>
                    <Text style={[styles.label, { color: subTextColor }]}>DESDE</Text>
                    <View style={styles.row}>
                        <View style={[styles.inputBox, { backgroundColor: inputBoxBg, borderColor: origin ? BLUE_GREY : inputBoxBorder }]}>
                            <Ionicons name={origin ? "checkmark-circle" : "location"} size={rs(16)} color={origin ? BLUE_GREY : subTextColor} />
                            <TextInput style={[styles.input, { color: textColor }]} placeholder="Presiona GPS →" placeholderTextColor={subTextColor} value={originInput} editable={false} />
                            {origin && <TouchableOpacity onPress={() => { setOrigin(null); setOriginInput(''); setRouteCoords([]); setRouteInfo({ distance: null, duration: null }); setMapKey(k => k + 1); }}><Ionicons name="close-circle" size={rs(16)} color={subTextColor} /></TouchableOpacity>}
                        </View>
                        <TouchableOpacity onPress={getLocation} disabled={isLoadingLocation} style={[styles.gpsBtn, { backgroundColor: origin ? BLUE_GREY : BLUE_GREY }]}>
                            {isLoadingLocation ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="navigate" size={rs(18)} color="#fff" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* BOTTOM PANEL */}
            <View style={[styles.bottomPanel, { bottom: BOTTOM_MARGIN }]}>
                <View style={[styles.bottomCard, shadows.md, { backgroundColor: cardBg }]}>
                    <TouchableOpacity onPress={() => setShowBeachSelector(true)} style={[styles.destRow, { borderColor: destination ? BLUE_GREY : inputBoxBorder }]}>
                        <View style={[styles.destIcon, { backgroundColor: destination ? (destination.clean ? BLUE_GREY_BG : `${BRAND.warning}15`) : (safeIsDark ? safeColors.backgroundTertiary : 'rgba(0,0,0,0.05)') }]}>
                            <Text style={{ fontSize: rs(16) }}>{destination ? (destination.clean ? '🏖️' : '⚠️') : '🗺️'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.destLabel, { color: subTextColor }]}>DESTINO</Text>
                            <Text style={[styles.destName, { color: textColor }]} numberOfLines={1}>{destination ? `${destination.name} · 👥 ${destination.people}` : 'Seleccionar...'}</Text>
                        </View>
                        <Ionicons name="chevron-down" size={rs(18)} color={subTextColor} />
                    </TouchableOpacity>

                    {routeInfo.distance && (
                        <View style={styles.infoRow}>
                            <View style={[styles.infoBadge, { backgroundColor: BLUE_GREY_BG }]}>
                                <Ionicons name="car" size={rs(14)} color={BLUE_GREY} />
                                <Text style={[styles.infoText, { color: textColor }]}>{routeInfo.distance.toFixed(1)} km</Text>
                            </View>
                            <View style={[styles.infoBadge, { backgroundColor: `${BRAND.sandGold}12` }]}>
                                <Ionicons name="time" size={rs(14)} color={BRAND.sandGold} />
                                <Text style={[styles.infoText, { color: textColor }]}>{formatTime(routeInfo.duration)}</Text>
                            </View>
                            <View style={[styles.infoBadge, { backgroundColor: destination?.clean ? BLUE_GREY_BG : `${BRAND.warning}12` }]}>
                                <Ionicons name={destination?.clean ? "checkmark-circle" : "alert-circle"} size={rs(14)} color={destination?.clean ? BLUE_GREY : BRAND.warning} />
                            </View>
                        </View>
                    )}

                    {origin && destination && (
                        <TouchableOpacity onPress={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
                            Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
                        }} style={styles.navBtn}>
                            <LinearGradient colors={[BLUE_GREY, BLUE_GREY_DARK]} style={styles.navBtnInner}>
                                <Ionicons name="navigate" size={rs(16)} color="#fff" />
                                <Text style={styles.navBtnText}>Google Maps</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <BeachSelector visible={showBeachSelector} onClose={() => setShowBeachSelector(false)} onSelect={setDestination} origin={origin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    mapContainer: { flex: 1 },
    loading: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },

    topPanel: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    topCard: { marginHorizontal: SPACING.md, marginTop: SPACING.xs, padding: SPACING.sm, borderRadius: RADIUS.md },
    label: { fontSize: rf(9), fontWeight: '700', letterSpacing: 1.2, marginBottom: rs(4) },
    row: { flexDirection: 'row', gap: SPACING.xs },
    inputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, height: rs(38), borderRadius: RADIUS.sm, borderWidth: 1.5, gap: rs(6) },
    input: { flex: 1, fontSize: rf(13) },
    gpsBtn: { width: rs(38), height: rs(38), borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },

    bottomPanel: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
    bottomCard: { marginHorizontal: SPACING.md, padding: SPACING.sm, borderRadius: RADIUS.md },
    destRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.xs, borderRadius: RADIUS.sm, borderWidth: 1, gap: SPACING.xs },
    destIcon: { width: rs(32), height: rs(32), borderRadius: RADIUS.xs, justifyContent: 'center', alignItems: 'center' },
    destLabel: { fontSize: rf(8), fontWeight: '600', letterSpacing: 0.8 },
    destName: { fontSize: rf(13), fontWeight: '600' },
    infoRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.xs },
    infoBadge: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: rs(4), borderRadius: RADIUS.xs, gap: rs(3) },
    infoText: { fontSize: rf(11), fontWeight: '700' },
    navBtn: { marginTop: SPACING.xs, borderRadius: RADIUS.sm, overflow: 'hidden' },
    navBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xs, gap: SPACING.xs },
    navBtnText: { color: '#fff', fontSize: rf(13), fontWeight: '700' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { maxHeight: SCREEN.height * 0.75, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, padding: SPACING.md },
    modalHandle: { width: rs(36), height: rs(4), backgroundColor: 'rgba(128,128,128,0.4)', borderRadius: rs(2), alignSelf: 'center', marginBottom: SPACING.sm },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    modalTitle: { fontSize: rf(16), fontWeight: '700' },
    modalSearch: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, height: rs(38), borderRadius: RADIUS.md, gap: SPACING.xs, marginBottom: SPACING.sm },
    modalSearchInput: { flex: 1, fontSize: rf(13) },
    beachList: { flex: 1 },
    beachItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: SPACING.sm },
    beachPhoto: { width: rs(50), height: rs(50), borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm, overflow: 'hidden' },
    beachInfo: { flex: 1 },
    beachName: { fontSize: rf(14), fontWeight: '600' },
    beachDistrict: { fontSize: rf(11), marginTop: rs(1) },
    beachBadges: { flexDirection: 'row', gap: SPACING.xs, marginTop: rs(4) },
    miniBadge: { paddingHorizontal: rs(6), paddingVertical: rs(2), borderRadius: RADIUS.xs },
    distValue: { fontSize: rf(13), fontWeight: '600' },
});
