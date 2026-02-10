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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { BRAND } from "../constants/theme";
import { rs, rf, SPACING, RADIUS } from "../constants/responsive";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const BLUE_GREY = "#607d8b";
const BLUE_GREY_DARK = "#455a64";
const BLUE_GREY_LIGHT = "#cfd8dc";
const BLUE_GREY_BG = "rgba(96, 125, 139, 0.15)";

// ═══════════════════════════════════════════════════════════════════════════
// BEACH IMAGES MAPPING
// ═══════════════════════════════════════════════════════════════════════════
const BEACH_IMAGES = {
  "PE-LIM-MIRAMAR.webp": require("./Beach/public/PE-LIM-MIRAMAR.webp"),
  "PE-LIM-LASCONCHITAS.webp": require("./Beach/public/PE-LIM-LASCONCHITAS.webp"),
  "PE-LIM-PLAYAHERMOSA.webp": require("./Beach/public/PE-LIM-PLAYAHERMOSA.webp"),
  "PE-LIM-PLAYACHICA.webp": require("./Beach/public/PE-LIM-PLAYACHICA.webp"),
  "PE-LIM-PLAYAGRANDE.webp": require("./Beach/public/PE-LIM-PLAYAGRANDE.webp"),
  "PE-LIM-PUNTAROQUITAS.webp": require("./Beach/public/PE-LIM-PUNTAROQUITAS.webp"),
  "PE-LIM-LAPAMPILLA.webp": require("./Beach/public/PE-LIM-LAPAMPILLA.webp"),
  "PE-LIM-WAIKIKI.webp": require("./Beach/public/PE-LIM-WAIKIKI.webp"),
  "PE-LIM-MAKAHA.webp": require("./Beach/public/PE-LIM-MAKAHA.webp"),
  "PE-LIM-REDONDO.webp": require("./Beach/public/PE-LIM-REDONDO.webp"),
  "PE-LIM-LAESTRELLA.webp": require("./Beach/public/PE-LIM-LAESTRELLA.webp"),
  "PE-LIM-LASCASCADAS.webp": require("./Beach/public/PE-LIM-LASCASCADAS.webp"),
  "PE-LIM-BARRANQUITO.webp": require("./Beach/public/PE-LIM-BARRANQUITO.webp"),
  "PE-LIM-LOSPAVOS.webp": require("./Beach/public/PE-LIM-LOSPAVOS.webp"),
  "PE-LIM-LOSYUYOS.webp": require("./Beach/public/PE-LIM-LOSYUYOS.webp"),
  "PE-LIM-LASSOMBRILLAS.webp": require("./Beach/public/PE-LIM-LASSOMBRILLAS.webp"),
  "PE-LIM-AGUADULCE.webp": require("./Beach/public/PE-LIM-AGUADULCE.webp"),
  "PE-LIM-PESCADORES.webp": require("./Beach/public/PE-LIM-PESCADORES.webp"),
  "PE-LIM-LAHERRADURA.webp": require("./Beach/public/PE-LIM-LAHERRADURA.webp"),
  "PE-LIM-LACHIRA.webp": require("./Beach/public/PE-LIM-LACHIRA.webp"),
  "PE-LIM-PLAYAVENECIA.webp": require("./Beach/public/PE-LIM-PLAYAVENECIA.webp"),
  "PE-LIM-BARLOVENTO.webp": require("./Beach/public/PE-LIM-BARLOVENTO.webp"),
  "PE-LIM-SANPEDRO.webp": require("./Beach/public/PE-LIM-SANPEDRO.webp"),
  "PE-LIM-ARICA.webp": require("./Beach/public/PE-LIM-ARICA.webp"),
  "PE-LIM-LOSPULPUS.webp": require("./Beach/public/PE-LIM-LOSPULPUS.webp"),
  "PE-LIM-ELSILENCIO.webp": require("./Beach/public/PE-LIM-ELSILENCIO.webp"),
  "PE-LIM-PLAYACABALLEROS.webp": require("./Beach/public/PE-LIM-PLAYACABALLEROS.webp"),
  "PE-LIM-PLAYASENORITAS.webp": require("./Beach/public/PE-LIM-PLAYASENORITAS.webp"),
};

// ═══════════════════════════════════════════════════════════════════════════
// LIMA BEACHES DATABASE (Solo playas con imágenes disponibles)
// ═══════════════════════════════════════════════════════════════════════════
const LIMA_BEACHES = [
  {
    id: 1,
    name: "Playa Miramar",
    zone: "Lima Norte",
    district: "Ancón",
    lat: -11.7658365,
    lng: -77.1718652,
    image: "PE-LIM-MIRAMAR.webp",
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
    image: "PE-LIM-LASCONCHITAS.webp",
    clean: true,
    people: 0,
  },
  {
    id: 3,
    name: "Playa Hermosa",
    zone: "Lima Norte",
    district: "Ancón",
    lat: -11.7772,
    lng: -77.1803,
    image: "PE-LIM-PLAYAHERMOSA.webp",
    clean: true,
    people: 0,
  },
  {
    id: 4,
    name: "Playa Chica",
    zone: "Lima Norte",
    district: "Santa Rosa",
    lat: -11.8015,
    lng: -77.1688,
    image: "PE-LIM-PLAYACHICA.webp",
    clean: true,
    people: 0,
  },
  {
    id: 5,
    name: "Playa Grande",
    zone: "Lima Norte",
    district: "Santa Rosa",
    lat: -11.8082,
    lng: -77.1655,
    image: "PE-LIM-PLAYAGRANDE.webp",
    clean: true,
    people: 0,
  },
  {
    id: 6,
    name: "Punta Roquitas",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1215,
    lng: -77.0418,
    image: "PE-LIM-PUNTAROQUITAS.webp",
    clean: true,
    people: 0,
  },
  {
    id: 7,
    name: "La Pampilla",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1234,
    lng: -77.0402,
    image: "PE-LIM-LAPAMPILLA.webp",
    clean: true,
    people: 0,
  },
  {
    id: 8,
    name: "Waikiki",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1275,
    lng: -77.0377,
    image: "PE-LIM-WAIKIKI.webp",
    clean: true,
    people: 0,
  },
  {
    id: 9,
    name: "Makaha",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1287,
    lng: -77.0369,
    image: "PE-LIM-MAKAHA.webp",
    clean: true,
    people: 0,
  },
  {
    id: 10,
    name: "Redondo",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1315,
    lng: -77.0352,
    image: "PE-LIM-REDONDO.webp",
    clean: true,
    people: 0,
  },
  {
    id: 11,
    name: "La Estrella",
    zone: "Lima Centro",
    district: "Miraflores",
    lat: -12.1342,
    lng: -77.0335,
    image: "PE-LIM-LAESTRELLA.webp",
    clean: false,
    people: 0,
  },
  {
    id: 12,
    name: "Las Cascadas",
    zone: "Lima Centro",
    district: "Barranco",
    lat: -12.1438,
    lng: -77.0289,
    image: "PE-LIM-LASCASCADAS.webp",
    clean: true,
    people: 0,
  },
  {
    id: 13,
    name: "Barranquito",
    zone: "Lima Centro",
    district: "Barranco",
    lat: -12.1472,
    lng: -77.0275,
    image: "PE-LIM-BARRANQUITO.webp",
    clean: true,
    people: 0,
  },
  {
    id: 14,
    name: "Los Pavos",
    zone: "Lima Centro",
    district: "Barranco",
    lat: -12.1505,
    lng: -77.0263,
    image: "PE-LIM-LOSPAVOS.webp",
    clean: false,
    people: 0,
  },
  {
    id: 15,
    name: "Los Yuyos",
    zone: "Lima Centro",
    district: "Barranco",
    lat: -12.1528,
    lng: -77.0255,
    image: "PE-LIM-LOSYUYOS.webp",
    clean: false,
    people: 0,
  },
  {
    id: 16,
    name: "Las Sombrillas",
    zone: "Lima Centro",
    district: "Barranco",
    lat: -12.1569,
    lng: -77.0258,
    image: "PE-LIM-LASSOMBRILLAS.webp",
    clean: true,
    people: 0,
  },
  {
    id: 17,
    name: "Agua Dulce",
    zone: "Lima Centro",
    district: "Chorrillos",
    lat: -12.1612,
    lng: -77.0266,
    image: "PE-LIM-AGUADULCE.webp",
    clean: false,
    people: 0,
  },
  {
    id: 18,
    name: "Pescadores",
    zone: "Lima Centro",
    district: "Chorrillos",
    lat: -12.1645,
    lng: -77.0278,
    image: "PE-LIM-PESCADORES.webp",
    clean: false,
    people: 0,
  },
  {
    id: 19,
    name: "La Herradura",
    zone: "Lima Centro",
    district: "Chorrillos",
    lat: -12.1744,
    lng: -77.0336,
    image: "PE-LIM-LAHERRADURA.webp",
    clean: false,
    people: 0,
  },
  {
    id: 20,
    name: "La Chira",
    zone: "Lima Centro",
    district: "Chorrillos",
    lat: -12.1885,
    lng: -77.0405,
    image: "PE-LIM-LACHIRA.webp",
    clean: false,
    people: 0,
  },
  {
    id: 21,
    name: "Playa Venecia",
    zone: "Lima Sur",
    district: "Villa El Salvador",
    lat: -12.2355,
    lng: -76.9758,
    image: "PE-LIM-PLAYAVENECIA.webp",
    clean: true,
    people: 0,
  },
  {
    id: 22,
    name: "Barlovento",
    zone: "Lima Sur",
    district: "Villa El Salvador",
    lat: -12.2452,
    lng: -76.9655,
    image: "PE-LIM-BARLOVENTO.webp",
    clean: true,
    people: 0,
  },
  {
    id: 23,
    name: "San Pedro",
    zone: "Lima Sur",
    district: "Lurín",
    lat: -12.2685,
    lng: -76.9248,
    image: "PE-LIM-SANPEDRO.webp",
    clean: true,
    people: 0,
  },
  {
    id: 24,
    name: "Arica",
    zone: "Lima Sur",
    district: "Lurín",
    lat: -12.2785,
    lng: -76.9125,
    image: "PE-LIM-ARICA.webp",
    clean: false,
    people: 0,
  },
  {
    id: 25,
    name: "Los Pulpos",
    zone: "Lima Sur",
    district: "Lurín",
    lat: -12.2882,
    lng: -76.9015,
    image: "PE-LIM-LOSPULPUS.webp",
    clean: true,
    people: 0,
  },
  {
    id: 26,
    name: "El Silencio",
    zone: "Sur Chico",
    district: "Punta Hermosa",
    lat: -12.3153,
    lng: -76.8364,
    image: "PE-LIM-ELSILENCIO.webp",
    clean: true,
    people: 0,
  },
  {
    id: 27,
    name: "Caballeros",
    zone: "Sur Chico",
    district: "Punta Hermosa",
    lat: -12.3297,
    lng: -76.8319,
    image: "PE-LIM-PLAYACABALLEROS.webp",
    clean: true,
    people: 0,
  },
  {
    id: 28,
    name: "Señoritas",
    zone: "Sur Chico",
    district: "Punta Hermosa",
    lat: -12.3315,
    lng: -76.8292,
    image: "PE-LIM-PLAYASENORITAS.webp",
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
  const [isPressed, setIsPressed] = useState(false);
  const cardBg = isDark ? "rgba(13, 58, 77, 0.7)" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const subTextColor = isDark ? "rgba(170, 222, 243, 0.8)" : "#666666";
  const statusBg = beach.clean ? BLUE_GREY_BG : "rgba(245, 158, 11, 0.15)";
  const statusColor = beach.clean ? BLUE_GREY : "#f59e0b";

  const cardShadow = isDark
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 12,
      }
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      };

  return (
    <TouchableOpacity
      style={[
        styles.beachCard,
        { backgroundColor: cardBg },
        cardShadow,
        isPressed && styles.beachCardPressed,
      ]}
      onPress={() => onPress(beach)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.95}
    >
      <Image
        source={BEACH_IMAGES[beach.image]}
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
                {beach.district} · {beach.zone}
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
                {beach.clean ? "Limpia" : "Sucia"}
              </Text>
            </View>
            <View
              style={[styles.beachCardStat, { backgroundColor: BLUE_GREY_BG }]}
            >
              <Ionicons name="people" size={rs(16)} color={BLUE_GREY} />
              <Text style={[styles.beachCardStatText, { color: BLUE_GREY }]}>
                {beach.people} limpiando
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
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState("Todas");

  const zones = [
    "Todas",
    "Lima Norte",
    "Lima Centro",
    "Lima Sur",
    "Sur Chico",
    "Sur Grande",
  ];

  const filteredBeaches = LIMA_BEACHES.filter((beach) => {
    const matchesSearch =
      beach.name.toLowerCase().includes(search.toLowerCase()) ||
      beach.district.toLowerCase().includes(search.toLowerCase()) ||
      beach.zone.toLowerCase().includes(search.toLowerCase());
    const matchesZone = selectedZone === "Todas" || beach.zone === selectedZone;
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
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? BRAND.oceanDeep : "#f0f0f0" },
      ]}
      edges={["top"]}
    >
      {/* HEADER */}
      <View style={[styles.header, shadows.md, { backgroundColor: headerBg }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Playas de Perú
        </Text>
        <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
          {filteredBeaches.length} playas disponibles
        </Text>

        {/* SEARCH BAR */}
        <View style={[styles.searchBar, { backgroundColor: inputBg }]}>
          <Ionicons name="search" size={rs(18)} color={subTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Buscar playa, distrito o zona..."
            placeholderTextColor={subTextColor}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={rs(18)}
                color={subTextColor}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ZONE FILTERS */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={zones}
          keyExtractor={(item) => item}
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
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* BEACH CARDS LIST */}
      <FlatList
        data={filteredBeaches}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.beachList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BeachCard beach={item} isDark={isDark} onPress={handleBeachPress} />
        )}
        // Optimizaciones de rendimiento
        initialNumToRender={6}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: rs(220) + SPACING.md,
          offset: (rs(220) + SPACING.md) * index,
          index,
        })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="beach-outline" size={rs(64)} color={subTextColor} />
            <Text style={[styles.emptyText, { color: textColor }]}>
              No se encontraron playas
            </Text>
            <Text style={[styles.emptySubtext, { color: subTextColor }]}>
              Intenta con otros términos de búsqueda
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    transform: [{ scale: 1 }],
  },
  beachCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  beachCardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  beachCardGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
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
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  beachCardSubtitle: {
    fontSize: rf(12),
    marginTop: rs(2),
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mapIconBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
    borderRadius: RADIUS.md,
    gap: rs(6),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  beachCardStatText: {
    fontSize: rf(11),
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
