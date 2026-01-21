import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { getRouteFullDetails } from "../../utils/routes";
import { getRouteDetailsByIds } from "../../utils/stops";
import { useTheme } from "../../styles/ThemesContext";
import {
  LAYOUT,
  FONT,
  getGlobalStyles,
} from "../../styles/globalCSS";

export default function RouteDetail() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const gStyles = getGlobalStyles(theme); // Fixed: Generate dynamic styles
  const mapRef = useRef(null);

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("map"); 
  const [selectedStop, setSelectedStop] = useState(null);
  const [stopRoutes, setStopRoutes] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getRouteFullDetails(id);
        if (mounted) setRoute(data || null);
      } catch (e) {
        console.error("Route load failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [id]);

  const badgeColor = useMemo(() => {
    if (!route?.color) return theme.primary;
    return route.color.startsWith("#") ? route.color : `#${route.color}`;
  }, [route, theme.primary]);

  const cleanId = useMemo(() => route?.id?.split("-")[0] ?? "", [route]);

  const polylineCoords = useMemo(() => {
    if (!route?.geometry) return [];
    try {
      const geom = typeof route.geometry === "string" ? JSON.parse(route.geometry) : route.geometry;
      return geom?.geometry?.coordinates?.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      })) || [];
    } catch { return []; }
  }, [route]);

  const handleMarkerPress = async (stop) => {
    setSelectedStop(stop);
    setStopRoutes([]); 
    
    mapRef.current?.animateToRegion({
      latitude: stop.lat,
      longitude: stop.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 600);

    const idsToFetch = stop.route_ids_string || stop.route_ids;
    if (idsToFetch) {
      try {
        const routes = await getRouteDetailsByIds(idsToFetch);
        setStopRoutes(routes || []);
      } catch (err) {
        setStopRoutes([]); 
      }
    } else {
      setStopRoutes(route ? [route] : []);
    }
  };

  const renderStop = useCallback(({ item, index }) => (
    <TouchableOpacity 
      style={styles.stopRow} 
      onPress={() => {
        setActiveTab("map");
        setTimeout(() => handleMarkerPress(item), 300);
      }}
    >
      {/* Timeline Visual Logic */}
      <View style={styles.timelineContainer}>
        <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
        <View style={[styles.timelineDot, { borderColor: theme.primary }]} />
      </View>

      <View style={{ marginLeft: LAYOUT.spacing.md, flex: 1 }}>
        <Text style={[styles.stopName, { color: theme.text }]} numberOfLines={1}>
          {item.name_en || item.name_mm}
        </Text>
        <Text style={[styles.stopTown, { color: theme.textMuted }]} numberOfLines={1}>
          {item.road_en} • {item.township_en}
        </Text>
      </View>
      <Text style={[styles.stopIndex, { color: theme.textMuted }]}>{index + 1}</Text>
    </TouchableOpacity>
  ), [theme, route]);

  if (loading) {
    return (
      <View style={[gStyles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={gStyles.container}>
      {/* HEADER CARD */}
      <View style={gStyles.card}>
        <View style={gStyles.row}>
          <View style={[styles.idBox, { backgroundColor: badgeColor }]}>
            <Text style={styles.idText}>{cleanId}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={[styles.routeName, { color: theme.text }]}>{route?.name}</Text>
            <Text style={[styles.agencyText, { color: theme.textMuted }]}>{route?.agency_id}</Text>
          </View>
        </View>
      </View>

      {/* TABS (Segmented Control) */}
      <View style={[styles.tabsTrack, { backgroundColor: theme.border }]}>
        {["map", "stops"].map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, active && { backgroundColor: theme.card }]}
              onPress={() => {
                setActiveTab(tab);
                if (tab === "stops") setSelectedStop(null);
              }}
            >
              <Text style={{ 
                fontSize: FONT.size_sm, 
                fontWeight: FONT.weight_bold, 
                color: active ? theme.primary : theme.textMuted 
              }}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CONTENT AREA */}
      <View style={[styles.content, { backgroundColor: theme.background, borderColor: theme.border }]}>
        {activeTab === "map" && (
          <View style={StyleSheet.absoluteFill}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFill}
              onPress={() => setSelectedStop(null)}
              initialRegion={polylineCoords.length > 0 ? {
                latitude: polylineCoords[0].latitude,
                longitude: polylineCoords[0].longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              } : { latitude: 16.82, longitude: 96.15, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
            >
              {polylineCoords.length > 0 && (
                <Polyline coordinates={polylineCoords} strokeWidth={5} strokeColor={badgeColor} />
              )}
              {route?.stops?.map((s, i) => (
                <Marker
                  key={`marker-${s.id}-${i}`}
                  coordinate={{ latitude: s.lat, longitude: s.lng }}
                  pinColor={theme.primary}
                  onPress={() => handleMarkerPress(s)}
                />
              ))}
            </MapView>

            {/* FLOATING DETAIL PANEL */}
            {selectedStop && (
              <View style={[gStyles.card, styles.detailPanel]}>
                <View style={styles.panelHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stopTitle, { color: theme.text }]}>{selectedStop.name_en}</Text>
                    <Text style={{ color: theme.textMuted, fontSize: FONT.size_sm }}>
                        {selectedStop.road_en} • {selectedStop.township_en}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedStop(null)}>
                    <Text style={{ color: theme.textMuted, fontSize: 20 }}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Passing Bus Lines</Text>
                <View style={styles.badgeGrid}>
                  {stopRoutes.map((item, idx) => (
                    <View key={idx} style={[gStyles.badge, { backgroundColor: item.color ? `#${item.color}` : theme.primary }]}>
                        <Text style={gStyles.buttonText}>{item.id?.split('-')[0]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === "stops" && (
          <FlatList
            data={route?.stops || []}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderStop}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  idBox: { width: 60, height: 60, borderRadius: LAYOUT.borderRadius.md, justifyContent: "center", alignItems: "center" },
  idText: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  infoColumn: { marginLeft: LAYOUT.spacing.md, flex: 1 },
  routeName: { fontSize: FONT.size_md, fontWeight: "bold" },
  agencyText: { fontSize: FONT.size_xs, marginTop: 2 },
  
  tabsTrack: { 
    flexDirection: 'row', 
    height: 44, 
    borderRadius: LAYOUT.borderRadius.md, 
    padding: 4, 
    marginBottom: LAYOUT.spacing.md 
  },
  tabButton: { flex: 1, borderRadius: LAYOUT.borderRadius.sm, alignItems: "center", justifyContent: "center" },
  
  content: { flex: 1, borderRadius: LAYOUT.borderRadius.lg, overflow: "hidden", borderWidth: 1 },
  
  // Timeline Styles
  stopRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: LAYOUT.spacing.md, height: 70 },
  timelineContainer: { alignItems: 'center', width: 20, height: '100%' },
  timelineLine: { position: 'absolute', width: 2, height: '100%' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF', borderWidth: 2, zIndex: 1, marginTop: 29 },
  
  stopIndex: { fontSize: FONT.size_xs, fontWeight: 'bold' },
  stopName: { fontSize: FONT.size_md, fontWeight: "bold" },
  stopTown: { fontSize: FONT.size_xs, marginTop: 2 },
  
  detailPanel: { position: 'absolute', bottom: 20, left: 10, right: 10, elevation: 10 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  stopTitle: { fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { marginTop: 15, marginBottom: 8, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.6 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 }
});

// import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   Dimensions,
// } from "react-native";
// import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";

// import { getRouteFullDetails } from "../../utils/routes";
// import { getRouteDetailsByIds } from "../../utils/stops";
// import { useTheme } from "../../styles/ThemesContext";
// import {
//   BASE_COLORS,
//   LAYOUT,
//   FONT,
//   GlobalStyles,
// } from "../../styles/globalCSS";

// export default function RouteDetail() {
//   const { id } = useLocalSearchParams();
//   const { theme } = useTheme();
//   const mapRef = useRef(null);

//   const [route, setRoute] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("map"); 
//   const [selectedStop, setSelectedStop] = useState(null);
//   const [stopRoutes, setStopRoutes] = useState([]);

//   useEffect(() => {
//     let mounted = true;
//     async function load() {
//       try {
//         const data = await getRouteFullDetails(id);
//         if (mounted) setRoute(data || null);
//       } catch (e) {
//         console.error("Route load failed", e);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }
//     load();
//     return () => (mounted = false);
//   }, [id]);

//   const badgeColor = useMemo(() => {
//     if (!route?.color) return theme.primary;
//     return route.color.startsWith("#") ? route.color : `#${route.color}`;
//   }, [route, theme.primary]);

//   const cleanId = useMemo(() => route?.id?.split("-")[0] ?? "", [route]);

//   const polylineCoords = useMemo(() => {
//     if (!route?.geometry) return [];
//     try {
//       const geom = typeof route.geometry === "string" ? JSON.parse(route.geometry) : route.geometry;
//       return geom?.geometry?.coordinates?.map(([lng, lat]) => ({
//         latitude: lat,
//         longitude: lng,
//       })) || [];
//     } catch { return []; }
//   }, [route]);

//   // FIXED: Improved Marker Press Handler
//   const handleMarkerPress = async (stop) => {
//     setSelectedStop(stop);
//     setStopRoutes([]); // Reset list
    
//     mapRef.current?.animateToRegion({
//       latitude: stop.lat,
//       longitude: stop.lng,
//       latitudeDelta: 0.005,
//       longitudeDelta: 0.005,
//     }, 600);

//     // DEBUG: Look at your console to see if the column name is correct!
//     console.log("Stop Data:", stop);

//     // Try both common column names: route_ids_string or route_ids
//     const idsToFetch = stop.route_ids_string || stop.route_ids;

//     if (idsToFetch) {
//       try {
//         const routes = await getRouteDetailsByIds(idsToFetch);
//         setStopRoutes(routes || []);
//       } catch (err) {
//         console.error("Failed to fetch passing routes:", err);
//         setStopRoutes([]); 
//       }
//     } else {
//       // If no IDs found, show at least the current route so it's not empty
//       setStopRoutes(route ? [route] : []);
//     }
//   };

//   const renderStop = useCallback(({ item, index }) => (
//     <TouchableOpacity 
//       style={styles.stopRow} 
//       onPress={() => {
//         setActiveTab("map");
//         setTimeout(() => handleMarkerPress(item), 300);
//       }}
//     >
//       <Text style={[styles.stopIndex, { color: theme.textMuted }]}>{index + 1}</Text>
//       <View style={{ marginLeft: LAYOUT.spacing.md }}>
//         <Text style={[styles.stopName, { color: theme.text }]} numberOfLines={1}>
//           {item.name_en || item.name_mm || `Stop ${item.id}`}
//         </Text>
//         <Text style={[styles.stopTown, { color: theme.textMuted }]} numberOfLines={1}>
//           {item.township_en || item.township_mm || ""}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   ), [theme, route]);

//   if (loading) {
//     return (
//       <View style={[GlobalStyles.center, { backgroundColor: theme.background }]}>
//         <ActivityIndicator size="large" color={theme.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       {/* HEADER */}
//       <View style={[styles.card, GlobalStyles.shadowSm, { backgroundColor: theme.card, borderColor: theme.border }]}>
//         <View style={GlobalStyles.row}>
//           <View style={[styles.idBox, { backgroundColor: badgeColor }]}>
//             <Text style={styles.idText}>{cleanId}</Text>
//           </View>
//           <View style={styles.infoColumn}>
//             <Text style={[styles.routeName, { color: theme.text }]}>{route?.name}</Text>
//             <Text style={[styles.agencyText, { color: theme.textMuted }]}>{route?.agency_id}</Text>
//           </View>
//         </View>
//       </View>

//       {/* TABS */}
//       <View style={styles.tabsTrack}>
//         {["map", "stops"].map((tab) => {
//           const active = activeTab === tab;
//           return (
//             <TouchableOpacity
//               key={tab}
//               style={[styles.tabButton, active && { backgroundColor: theme.card }]}
//               onPress={() => {
//                 setActiveTab(tab);
//                 if (tab === "stops") setSelectedStop(null);
//               }}
//             >
//               <Text style={{ fontSize: FONT.size_sm, fontWeight: FONT.weight_semibold, color: active ? theme.primary : theme.textMuted }}>
//                 {tab.toUpperCase()}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* CONTENT */}
//       <View style={styles.content}>
//         {activeTab === "map" && (
//           <View style={StyleSheet.absoluteFill}>
//             <MapView
//               ref={mapRef}
//               provider={PROVIDER_GOOGLE}
//               style={StyleSheet.absoluteFill}
//               onPress={() => setSelectedStop(null)}
//               initialRegion={polylineCoords.length > 0 ? {
//                 latitude: polylineCoords[0].latitude,
//                 longitude: polylineCoords[0].longitude,
//                 latitudeDelta: 0.08,
//                 longitudeDelta: 0.08,
//               } : { latitude: 16.82, longitude: 96.15, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
//             >
//               {polylineCoords.length > 0 && (
//                 <Polyline coordinates={polylineCoords} strokeWidth={5} strokeColor={badgeColor} />
//               )}
//               {route?.stops?.map((s, i) => (
//                 <Marker
//                   key={`marker-${s.id}-${i}`}
//                   coordinate={{ latitude: s.lat, longitude: s.lng }}
//                   pinColor={theme.primary}
//                   onPress={() => handleMarkerPress(s)}
//                 />
//               ))}
//             </MapView>

//             {/* DETAIL PANEL */}
//             {selectedStop && (
//               <View style={[styles.detailPanel, GlobalStyles.shadowLg, { backgroundColor: theme.card }]}>
//                 <View style={styles.panelHeader}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={[styles.stopTitle, { color: theme.text }]}>{selectedStop.name_en || selectedStop.name_mm}</Text>
//                     <Text style={{ color: theme.text, fontSize: 16, marginTop: 2, fontWeight: '500' }}>
//                       {selectedStop.name_mm}
//                     </Text>
//                   </View>
//                   <TouchableOpacity onPress={() => setSelectedStop(null)}>
//                     <Text style={{ color: theme.textMuted, fontSize: 18, padding: 5 }}>✕</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 5 }}>
//                   {selectedStop.road_en || 'Main Road'} • {selectedStop.township_en || 'Yangon'}
//                 </Text>
                
//                 <Text style={{ color: theme.text, marginTop: 15, marginBottom: 10, fontWeight: 'bold', fontSize: 14 }}>
//                   Passing Bus Lines
//                 </Text>

//                 <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
//                   {stopRoutes.length > 0 ? (
//                     stopRoutes.map((item, idx) => (
//                       <View 
//                         key={`${item.id}-${idx}`} 
//                         style={[styles.routeBadge, { backgroundColor: item.color ? (item.color.startsWith('#') ? item.color : `#${item.color}`) : theme.primary }]}
//                       >
//                         <Text style={styles.routeBadgeText}>
//                           {item.id ? item.id.split('-')[0] : '??'}
//                         </Text>
//                       </View>
//                     ))
//                   ) : (
//                     <Text style={{ color: theme.textMuted, fontSize: 12, fontStyle: 'italic' }}>
//                       No other lines found
//                     </Text>
//                   )}
//                 </View>
//               </View>
//             )}
//           </View>
//         )}

//         {activeTab === "stops" && (
//           <FlatList
//             data={route?.stops || []}
//             keyExtractor={(item, index) => `${item.id}-${index}`}
//             renderItem={renderStop}
//             contentContainerStyle={{ padding: LAYOUT.spacing.md }}
//           />
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: LAYOUT.padding },
//   card: { padding: LAYOUT.spacing.md, borderRadius: LAYOUT.borderRadius.md, borderWidth: 1, marginBottom: LAYOUT.spacing.md },
//   idBox: { width: 56, height: 56, borderRadius: LAYOUT.borderRadius.sm, justifyContent: "center", alignItems: "center" },
//   idText: { color: "#FFF", fontSize: FONT.size_lg, fontWeight: "bold" },
//   infoColumn: { marginLeft: LAYOUT.spacing.lg, flex: 1 },
//   routeName: { fontSize: FONT.size_md, fontWeight: "600" },
//   agencyText: { fontSize: FONT.size_xs, marginTop: 4 },
//   tabsTrack: { ...GlobalStyles.segmentedTrack, marginBottom: LAYOUT.spacing.md },
//   tabButton: { flex: 1, borderRadius: 6, alignItems: "center", justifyContent: "center" },
//   content: { flex: 1, borderRadius: LAYOUT.borderRadius.md, overflow: "hidden", backgroundColor: "#f9f9f9" },
//   stopRow: { flexDirection: "row", alignItems: "center", paddingVertical: LAYOUT.spacing.sm },
//   stopIndex: { width: 28, textAlign: "center", fontSize: FONT.size_sm },
//   stopName: { fontSize: FONT.size_md, fontWeight: "500" },
//   stopTown: { fontSize: FONT.size_xs },
//   detailPanel: { 
//     position: 'absolute', bottom: 20, left: 15, right: 15, 
//     padding: 20, borderRadius: 15, zIndex: 999, elevation: 5
//   },
//   panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   stopTitle: { fontSize: 18, fontWeight: 'bold' },
//   routeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, minWidth: 40, alignItems: 'center' },
//   routeBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 }
// });