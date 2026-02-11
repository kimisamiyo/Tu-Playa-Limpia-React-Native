import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  Linking,
  Image,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { BRAND } from "../constants/theme";
import { rs, rf, SPACING, RADIUS } from "../constants/responsive";
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import CelebrationModal from '../components/CelebrationModal';
import { mintNFT } from "../utils/blockchain/missionNFT";
import { generateNFTAttributes } from "../utils/nftGenerator";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const BLUE_GREY = "#607d8b";
const BLUE_GREY_DARK = "#455a64";
const BLUE_GREY_LIGHT = "#cfd8dc";
const BLUE_GREY_BG = "rgba(96, 125, 139, 0.15)";

// ═══════════════════════════════════════════════════════════════════════════
// LIMA BEACHES DATABASE
// ═══════════════════════════════════════════════════════════════════════════
const LIMA_BEACHES = [
  {
    id: 1,
    name: "Playa Miramar",
    zone: "Lima Norte",
    district: "Ancón",
    lat: -11.7695,
    lng: -77.1758,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/12098668774628945837_0",
    clean: true,
    people: 0,
  },
  {
    id: 2,
    name: "Playa Las Conchitas",
    zone: "Lima Norte",
    district: "Ancón",
    lat: -11.7588,
    lng: -77.1732,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/9350125998810273840_0",
    clean: true,
    people: 0,
  },
  {
    id: 3,
    name: "Playa Pocitos",
    zone: "Lima Norte",
    district: "Ancón",
    lat: -11.7725,
    lng: -77.1789,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/12098668774628945837_0",
    clean: false,
    people: 0,
  },
  {
    id: 4,
    name: "Playa Hermosa",
    zone: "Lima Norte",
    district: "Ancón",
    lat: -11.7772,
    lng: -77.1803,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/2991879153895291309_0",
    clean: true,
    people: 0,
  },
  {
    id: 5,
    name: "Playa Chica",
    zone: "Lima Norte",
    district: "Santa Rosa",
    lat: -11.8015,
    lng: -77.1688,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/4234238059033332624_0",
    clean: true,
    people: 0,
  },
  {
    id: 6,
    name: "Playa Grande",
    zone: "Lima Norte",
    district: "Santa Rosa",
    lat: -11.8082,
    lng: -77.1655,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/4234238059033332624_0",
    clean: true,
    people: 0,
  },
  {
    id: 7,
    name: "Los Delfines",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1192,
    lng: -77.0435,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/15442054068016348752_0",
    clean: true,
    people: 0,
  },
  {
    id: 8,
    name: "Punta Roquitas",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1215,
    lng: -77.0418,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/4415167619125315981_0",
    clean: true,
    people: 0,
  },
  {
    id: 9,
    name: "La Pampilla",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1234,
    lng: -77.0402,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/5425523489229387305_0",
    clean: true,
    people: 0,
  },
  {
    id: 10,
    name: "Waikiki",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1275,
    lng: -77.0377,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/13528375338114968724_0",
    clean: true,
    people: 0,
  },
  {
    id: 11,
    name: "Makaha",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1287,
    lng: -77.0369,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/9106905456784631900_0",
    clean: true,
    people: 0,
  },
  {
    id: 12,
    name: "Redondo",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1315,
    lng: -77.0352,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/8755651127993604943_0",
    clean: true,
    people: 0,
  },
  {
    id: 13,
    name: "La Estrella",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1342,
    lng: -77.0335,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/9304157753602949464_0",
    clean: false,
    people: 0,
  },
  {
    id: 14,
    name: "Las Cascadas",
    zone: "Lima Centro",
    district: "Barranco",
    lat: -12.1438,
    lng: -77.0289,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/1514262505119911213_0",
    clean: true,
    people: 0,
  },
  {
    id: 15,
    name: "Barranquito",
    zone: "Lima Centro",
    district: "Barranco",
    lat: -12.1472,
    lng: -77.0275,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/1514262505119911213_0",
    clean: true,
    people: 0,
  },
  {
    id: 16,
    name: "Los Pavos",
    zone: "Lima Centro",
    district: "Barranco",
    lat: -12.1505,
    lng: -77.0263,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/4581299634875604549_0",
    clean: false,
    people: 0,
  },
  {
    id: 17,
    name: "Los Yuyos",
    zone: "Lima Centro",
    district: "Barranco",
    lat: -12.1528,
    lng: -77.0255,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/4581299634875604549_0",
    clean: false,
    people: 0,
  },
  {
    id: 18,
    name: "Las Sombrillas",
    zone: "Lima Centro",
    district: "Barranco",
    lat: -12.1569,
    lng: -77.0258,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/4581299634875604549_0",
    clean: true,
    people: 0,
  },
  {
    id: 19,
    name: "Agua Dulce",
    zone: "Lima Centro",
    district: "Chorrillos",
    lat: -12.1612,
    lng: -77.0266,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/10147769838552140328_0",
    clean: false,
    people: 0,
  },
  {
    id: 20,
    name: "Pescadores",
    zone: "Lima Centro",
    district: "Chorrillos",
    lat: -12.1645,
    lng: -77.0278,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/10147769838552140328_0",
    clean: false,
    people: 0,
  },
  {
    id: 21,
    name: "La Herradura",
    zone: "Lima Centro",
    district: "Chorrillos",
    lat: -12.1744,
    lng: -77.0336,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/4415167619125315497_0",
    clean: false,
    people: 0,
  },
  {
    id: 22,
    name: "La Chira",
    zone: "Lima Centro",
    district: "Chorrillos",
    lat: -12.1885,
    lng: -77.0405,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/4415167619125315497_0",
    clean: false,
    people: 0,
  },
  {
    id: 23,
    name: "Playa Venecia",
    zone: "Lima Sur",
    district: "Villa El Salvador",
    lat: -12.2355,
    lng: -76.9758,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/16251957852010507805_0",
    clean: true,
    people: 0,
  },
  {
    id: 24,
    name: "Barlovento",
    zone: "Lima Sur",
    district: "Villa El Salvador",
    lat: -12.2452,
    lng: -76.9655,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/16251957852010507805_0",
    clean: true,
    people: 0,
  },
  {
    id: 25,
    name: "San Pedro",
    zone: "Lima Sur",
    district: "Lurín",
    lat: -12.2685,
    lng: -76.9248,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/15442054068016347587_0",
    clean: true,
    people: 0,
  },
  {
    id: 26,
    name: "Arica",
    zone: "Lima Sur",
    district: "Lurín",
    lat: -12.2785,
    lng: -76.9125,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/4234238059033329921_0",
    clean: false,
    people: 0,
  },
  {
    id: 27,
    name: "Los Pulpos",
    zone: "Lima Sur",
    district: "Lurín",
    lat: -12.2882,
    lng: -76.9015,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/9556956261350643755_0",
    clean: true,
    people: 0,
  },
  {
    id: 28,
    name: "El Silencio",
    zone: "Sur Chico",
    district: "Punta Hermosa",
    lat: -12.3153,
    lng: -76.8364,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/12170764564398274593_0",
    clean: true,
    people: 0,
  },
  {
    id: 29,
    name: "Caballeros",
    zone: "Sur Chico",
    district: "Punta Hermosa",
    lat: -12.3297,
    lng: -76.8319,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/9048603210385633278_0",
    clean: true,
    people: 0,
  },
  {
    id: 30,
    name: "Señoritas",
    zone: "Sur Chico",
    district: "Punta Hermosa",
    lat: -12.3315,
    lng: -76.8292,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/5540709583569388708_0",
    clean: true,
    people: 0,
  },
  {
    id: 31,
    name: "Playa Norte (Isla)",
    zone: "Sur Chico",
    district: "Punta Hermosa",
    lat: -12.3335,
    lng: -76.8242,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/12170764564398274593_0",
    clean: true,
    people: 0,
  },
  {
    id: 32,
    name: "Playa Blanca",
    zone: "Sur Chico",
    district: "Punta Hermosa",
    lat: -12.3365,
    lng: -76.8215,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/12170764564398274593_0",
    clean: true,
    people: 0,
  },
  {
    id: 33,
    name: "Kontiki",
    zone: "Sur Chico",
    district: "Punta Hermosa",
    lat: -12.3392,
    lng: -76.8188,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/12170764564398274593_0",
    clean: true,
    people: 0,
  },
  {
    id: 34,
    name: "Punta Rocas",
    zone: "Sur Chico",
    district: "Punta Negra",
    lat: -12.3619,
    lng: -76.8047,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/8490164425596468136_0",
    clean: true,
    people: 0,
  },
  {
    id: 35,
    name: "Punta Negra",
    zone: "Sur Chico",
    district: "Punta Negra",
    lat: -12.3665,
    lng: -76.7985,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/16197627442249995180_0",
    clean: true,
    people: 0,
  },
  {
    id: 36,
    name: "San Bartolo Norte",
    zone: "Sur Chico",
    district: "San Bartolo",
    lat: -12.3885,
    lng: -76.7825,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/9304157753602950553_0",
    clean: true,
    people: 0,
  },
  {
    id: 37,
    name: "San Bartolo Sur",
    zone: "Sur Chico",
    district: "San Bartolo",
    lat: -12.3945,
    lng: -76.7788,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/9304157753602950553_0",
    clean: false,
    people: 0,
  },
  {
    id: 38,
    name: "Santa María",
    zone: "Sur Chico",
    district: "Santa María",
    lat: -12.4045,
    lng: -76.7715,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/1514262505119909208_0",
    clean: true,
    people: 0,
  },
  {
    id: 39,
    name: "Embajadores",
    zone: "Sur Chico",
    district: "Santa María",
    lat: -12.4095,
    lng: -76.7758,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/12269554642538269264_0",
    clean: true,
    people: 0,
  },
  {
    id: 40,
    name: "Naplo",
    zone: "Sur Grande",
    district: "Pucusana",
    lat: -12.4792,
    lng: -76.7885,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/10147769838552140237_0",
    clean: true,
    people: 0,
  },
  {
    id: 41,
    name: "Pucusana",
    zone: "Sur Grande",
    district: "Pucusana",
    lat: -12.4815,
    lng: -76.7962,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/10147769838552140237_0",
    clean: true,
    people: 0,
  },
  {
    id: 42,
    name: "Las Ninfas",
    zone: "Sur Grande",
    district: "Pucusana",
    lat: -12.4845,
    lng: -76.7988,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/10147769838552140237_0",
    clean: false,
    people: 0,
  },
  {
    id: 43,
    name: "Chilca (Yaya)",
    zone: "Sur Grande",
    district: "Chilca",
    lat: -12.5055,
    lng: -76.7455,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/10147769838552140237_0",
    clean: true,
    people: 0,
  },
  {
    id: 44,
    name: "Puerto Viejo",
    zone: "Sur Grande",
    district: "San Antonio",
    lat: -12.5694,
    lng: -76.7111,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/13080852119667066337_0",
    clean: true,
    people: 0,
  },
  {
    id: 45,
    name: "León Dormido",
    zone: "Sur Grande",
    district: "San Antonio",
    lat: -12.6316,
    lng: -76.6685,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/7654971804938497510_0",
    clean: true,
    people: 0,
  },
  {
    id: 46,
    name: "Bujama",
    zone: "Sur Grande",
    district: "Mala",
    lat: -12.7058,
    lng: -76.6345,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/16251957852010504646_0",
    clean: true,
    people: 0,
  },
  {
    id: 47,
    name: "Totoritas",
    zone: "Sur Grande",
    district: "Mala",
    lat: -12.7215,
    lng: -76.6288,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/16251957852010504646_0",
    clean: true,
    people: 0,
  },
  {
    id: 48,
    name: "Asia (Boulevard)",
    zone: "Sur Grande",
    district: "Asia",
    lat: -12.7792,
    lng: -76.6083,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/15442054068016346422_0",
    clean: true,
    people: 0,
  },
  {
    id: 49,
    name: "Cayma",
    zone: "Sur Grande",
    district: "Asia",
    lat: -12.7955,
    lng: -76.5985,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/15442054068016346422_0",
    clean: true,
    people: 0,
  },
  {
    id: 50,
    name: "Sarapampa",
    zone: "Sur Grande",
    district: "Asia",
    lat: -12.8355,
    lng: -76.5815,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/15442054068016346422_0",
    clean: true,
    people: 0,
  },
  {
    id: 51,
    name: "Chepeconde",
    zone: "Sur Grande",
    district: "Cerro Azul",
    lat: -12.9285,
    lng: -76.5385,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/5425523489229387646_0",
    clean: true,
    people: 0,
  },
  {
    id: 52,
    name: "Cerro Azul",
    zone: "Sur Grande",
    district: "Cerro Azul",
    lat: -13.0268,
    lng: -76.4837,
    image:
      "http://googleusercontent.com/image_collection/image_retrieval/5425523489229387646_0",
    clean: true,
    people: 0,
  },
];

const LIMA_CENTER = { lat: -12.12, lng: -77.03 };

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ═══════════════════════════════════════════════════════════════════════════
// BEACH CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const BeachCard = ({ beach, isDark, onPress }) => {
  const { t } = useLanguage();

  const zoneMapping = {
    "Lima Norte": "map_zone_north",
    "Lima Centro": "map_zone_center",
    "Lima Sur": "map_zone_south",
    "Sur Chico": "map_zone_south_chico",
    "Sur Grande": "map_zone_south_grande",
  };

  const cardBg = isDark ? "rgba(13, 58, 77, 0.6)" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const subTextColor = isDark ? "rgba(170, 222, 243, 0.8)" : "#666666";
  const statusBg = beach.clean ? BLUE_GREY_BG : "rgba(245, 158, 11, 0.15)";
  const statusColor = beach.clean ? BLUE_GREY : "#f59e0b";

  return (
    <TouchableOpacity
      style={[styles.beachCard, { backgroundColor: cardBg }]}
      onPress={() => onPress(beach)}
      activeOpacity={0.7}
    >
      <Image
        source={require("../public/un-atractivo-valioso.jpg")}
        style={styles.beachCardImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={
          isDark
            ? ["transparent", "rgba(10, 31, 46, 0.95)"]
            : ["transparent", "rgba(255, 255, 255, 0.95)"]
        }
        style={styles.beachCardGradient}
      >
        <View style={styles.beachCardContent}>
          <View style={styles.beachCardHeader}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.beachCardTitle, { color: textColor }]}
                numberOfLines={1}
              >
                {beach.name}
              </Text>
              <Text style={[styles.beachCardSubtitle, { color: subTextColor }]}>
                {beach.district} · {t(zoneMapping[beach.zone] || beach.zone)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${beach.lat},${beach.lng}`;
                if (Platform.OS !== "web")
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(url);
              }}
              style={[styles.mapIconBtn, { backgroundColor: BLUE_GREY }]}
            >
              <Ionicons name="location" size={rs(18)} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.beachCardStats}>
            <View style={[styles.beachCardStat, { backgroundColor: statusBg }]}>
              <Ionicons
                name={beach.clean ? "checkmark-circle" : "alert-circle"}
                size={rs(16)}
                color={statusColor}
              />
              <Text style={[styles.beachCardStatText, { color: statusColor }]}>
                {beach.clean ? t('map_clean') : t('map_dirty')}
              </Text>
            </View>
            <View
              style={[styles.beachCardStat, { backgroundColor: BLUE_GREY_BG }]}
            >
              <Ionicons name="people" size={rs(16)} color={BLUE_GREY} />
              <Text style={[styles.beachCardStatText, { color: BLUE_GREY }]}>
                {beach.people} {t('map_cleaning_count')}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export default function BeachMapScreen() {
  const { colors, shadows, isDark } = useTheme();
  const { unlockRegionNFT } = useGame();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState("map_all_zones");
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastUnlockedNFT, setLastUnlockedNFT] = useState(null);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const numColumns = isDesktop ? 4 : 1;
  // Calculate width: Desktop uses Grid, Mobile uses List (full width)
  const sidebarOffset = isDesktop ? 250 : 0;
  const padding = SPACING.lg * 2;
  const gap = SPACING.md;
  const availableWidth = width - sidebarOffset - padding - (gap * (numColumns - 1));
  const cardWidth = isDesktop ? availableWidth / numColumns : '100%';

  const zones = [
    "map_all_zones",
    "map_zone_north",
    "map_zone_center",
    "map_zone_south",
    "map_zone_south_chico",
    "map_zone_south_grande",
  ];

  const zoneMapping = {
    "Lima Norte": "map_zone_north",
    "Lima Centro": "map_zone_center",
    "Lima Sur": "map_zone_south",
    "Sur Chico": "map_zone_south_chico",
    "Sur Grande": "map_zone_south_grande",
  };

  const filteredBeaches = LIMA_BEACHES.filter((beach) => {
    const matchesSearch =
      beach.name.toLowerCase().includes(search.toLowerCase()) ||
      beach.district.toLowerCase().includes(search.toLowerCase()) ||
      t(zoneMapping[beach.zone] || '').toLowerCase().includes(search.toLowerCase());

    const matchesZone = selectedZone === "map_all_zones" ||
      zoneMapping[beach.zone] === selectedZone;

    return matchesSearch && matchesZone;
  });

  const textColor = isDark ? colors.text : "#000000";
  const subTextColor = isDark ? colors.textMuted : "#666666";
  const inputBg = isDark ? "rgba(0, 0, 0, 0.3)" : "#f5f5f5";
  const headerBg = isDark ? BRAND.oceanDark : "#ffffff";

  const handleBeachPress = (beach) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const newNFT = unlockRegionNFT(beach.name, beach.image);
    if (newNFT) {
      setLastUnlockedNFT(newNFT);
      setShowCelebration(true);
    }
    // Open map as requested
    const url = `https://www.google.com/maps/search/?api=1&query=${beach.lat},${beach.lng}`;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CelebrationModal
        visible={showCelebration}
        onClose={() => setShowCelebration(false)}
        message={lastUnlockedNFT ? `${t('celebration_thanks')}\n\n${t('celebration_nft_unlocked')}\n${lastUnlockedNFT.title}\n\n${t('celebration_see_rewards')}` : t('celebration_thanks')}
      />

      <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: headerBg, zIndex: 10 }]}>
        {/* HEADER */}
        <View style={[styles.header, shadows.md, { backgroundColor: headerBg }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>{t('map_title')}</Text>
          <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
            {filteredBeaches.length} {t('map_available')}
          </Text>
        </View>

        {/* SEARCH BAR */}
        <View style={[styles.searchBar, { backgroundColor: inputBg }]}>
          <Ionicons name="search" size={rs(18)} color={subTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder={t('map_search_placeholder')}
            placeholderTextColor={subTextColor}
            value={search}
            onChangeText={setSearch}
          />
          {
            search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={rs(18)}
                  color={subTextColor}
                />
              </TouchableOpacity>
            )
          }
        </View >

        {/* ZONE FILTERS */}
        < FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={zones}
          keyExtractor={(item) => item
          }
          contentContainerStyle={styles.zoneFilters}
          renderItem={({ item }) => {
            const isSelected = selectedZone === item;
            return (
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedZone(item);
                }}
                style={[
                  styles.zoneFilterBtn,
                  {
                    backgroundColor: isSelected
                      ? BLUE_GREY
                      : isDark
                        ? "rgba(96, 125, 139, 0.2)"
                        : "#e0e0e0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.zoneFilterText,
                    { color: isSelected ? "#fff" : textColor },
                  ]}
                >
                  {t(item)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />


        {/* BEACH CARDS LIST */}
        <FlatList
          key={numColumns}
          data={filteredBeaches}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.beachList}
          columnWrapperStyle={numColumns > 1 ? { gap: SPACING.md } : undefined}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <BeachCard beach={item} isDark={isDark} onPress={handleBeachPress} />
            </View>
          )}
          ListEmptyComponent={
            < View style={styles.emptyState} >
              <Ionicons name="beach-outline" size={rs(64)} color={subTextColor} />
              <Text style={[styles.emptyText, { color: textColor }]}>
                {t('map_no_beaches')}
              </Text>
              <Text style={[styles.emptySubtext, { color: subTextColor }]}>
                {t('map_no_beaches_desc')}
              </Text>
            </View >
          }
        />
      </SafeAreaView >
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: rf(24),
    fontWeight: "800",
    marginBottom: rs(4),
  },
  headerSubtitle: {
    fontSize: rf(13),
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    height: rs(44),
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: rf(14),
  },
  zoneFilters: {
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  zoneFilterBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.xs,
  },
  zoneFilterText: {
    fontSize: rf(12),
    fontWeight: "600",
  },
  beachList: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  beachCard: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.md,
    height: rs(220),
  },
  beachCardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  beachCardGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: SPACING.md,
  },
  beachCardContent: {
    gap: SPACING.sm,
  },
  beachCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  beachCardTitle: {
    fontSize: rf(18),
    fontWeight: "700",
  },
  beachCardSubtitle: {
    fontSize: rf(12),
    marginTop: rs(2),
  },
  mapIconBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  beachCardStats: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  beachCardStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: rs(6),
  },
  beachCardStatText: {
    fontSize: rf(11),
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rs(80),
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: rf(16),
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: rf(13),
  },
});
