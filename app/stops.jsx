// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Keyboard } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { getTownshipList, getStopsByTownship, getStopsForSearch, getRouteDetailsByIds } from '../utils/stops';
// import { useTheme } from '../styles/ThemesContext';
// import { GlobalStyles, LAYOUT, FONT } from '../styles/globalCSS';

// export default function StopsPage() {
//   const { theme } = useTheme();
//   const mapRef = useRef(null);
  
//   // State
//   const [allMarkers, setAllMarkers] = useState([]);
//   const [townships, setTownships] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedTownship, setSelectedTownship] = useState(null);
//   const [selectedStop, setSelectedStop] = useState(null);
//   const [stopRoutes, setStopRoutes] = useState([]);

//   // Refs for background "Engine"
//   const searchCache = useRef([]);
//   const loadingQueue = useRef([]);
//   const isMounted = useRef(true);

//   useEffect(() => {
//     async function init() {
//       searchCache.current = await getStopsForSearch();
//       const list = await getTownshipList();
//       setTownships(list);
//       loadingQueue.current = [...list];
//       streamNextTownship();
//     }
//     init();
//     return () => { isMounted.current = false; };
//   }, []);

//   const streamNextTownship = async () => {
//     if (loadingQueue.current.length === 0 || !isMounted.current) return;
//     const next = loadingQueue.current.shift();
//     const data = await getStopsByTownship(next.township_en);
//     setAllMarkers(prev => [...prev, ...data]);
//     requestAnimationFrame(streamNextTownship);
//   };

//   // Filter markers based on chip selection
//   const displayMarkers = useMemo(() => {
//     if (!selectedTownship) return allMarkers;
//     return allMarkers.filter(m => m.township_en === selectedTownship);
//   }, [allMarkers, selectedTownship]);

//   // Search logic
//   const filteredResults = useMemo(() => {
//     if (searchQuery.length < 2) return [];
//     const q = searchQuery.toLowerCase();
//     return searchCache.current.filter(s => s.name_en?.toLowerCase().includes(q)).slice(0, 8);
//   }, [searchQuery]);

//   // Handle touching a marker or search result
//   const handleStopSelection = async (stop) => {
//     setSelectedStop(stop);
//     setSearchQuery("");
//     Keyboard.dismiss();

//     // Fly to stop
//     mapRef.current?.animateToRegion({
//       latitude: stop.lat,
//       longitude: stop.lng,
//       latitudeDelta: 0.005,
//       longitudeDelta: 0.005,
//     }, 800);

//     // Fetch bus details
//     const routes = await getRouteDetailsByIds(stop.route_ids_string);
//     setStopRoutes(routes);
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       <MapView 
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         style={StyleSheet.absoluteFill}
//         mapPadding={{ top: 100, right: 10, bottom: 120, left: 10 }}
//         initialRegion={{ latitude: 16.82, longitude: 96.15, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
//         onPress={() => setSelectedStop(null)} // Close details when tapping empty map
//       >
//         {displayMarkers.map(stop => (
//           <Marker
//             key={`marker-${stop.id}-${stop.lat}`}
//             coordinate={{ latitude: stop.lat, longitude: stop.lng }}
//             tracksViewChanges={false}
//             pinColor={theme.primary} // Always theme primary color
//             onPress={() => handleStopSelection(stop)}
//           />
//         ))}
//       </MapView>

//       {/* SEARCH & CHIPS OVERLAY */}
//       <View style={styles.topOverlay}>
//         <View style={[styles.inputWrapper, GlobalStyles.shadowSm, { backgroundColor: theme.card, borderColor: theme.border }]}>
//             <TextInput 
//               style={[styles.searchInput, { color: theme.text }]}
//               placeholder="Search bus stops..."
//               placeholderTextColor={theme.textMuted}
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//             {searchQuery.length > 0 && (
//                 <TouchableOpacity onPress={() => setSearchQuery("")}>
//                     <Text style={{color: theme.textMuted, paddingRight: 10}}>✕</Text>
//                 </TouchableOpacity>
//             )}
//         </View>

//         {filteredResults.length > 0 && (
//           <View style={[styles.resultsContainer, { backgroundColor: theme.card }]}>
//             {filteredResults.map(res => (
//               <TouchableOpacity key={res.id} style={styles.resultItem} onPress={() => handleStopSelection(res)}>
//                 <Text style={{color: theme.text}}>{res.name_en}</Text>
//                 <Text style={{color: theme.textMuted, fontSize: 10}}>{res.township_en}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         <FlatList 
//           horizontal
//           data={townships}
//           showsHorizontalScrollIndicator={false}
//           style={styles.chipList}

//           initialNumToRender={10}    // Only draw 10 chips at first
//           maxToRenderPerBatch={5}     // Don't draw too many at once
//           windowSize={5}              // Keep the memory footprint small

//           renderItem={({item}) => {
//             const isSelected = selectedTownship === item.township_en;
//             return (
//               <TouchableOpacity 
//                 onPress={() => setSelectedTownship(isSelected ? null : item.township_en)}
//                 style={[styles.chip, { backgroundColor: isSelected ? "#000" : theme.card, borderColor: theme.border }]}
//               >
//                 <Text style={[styles.chipText, { color: isSelected ? "#FFF" : theme.text }]}>
//                     {isSelected ? "✕ " : ""}{item.township_en}
//                 </Text>
//               </TouchableOpacity>
//             );
//           }}
//         />
//       </View>

//       {/* DETAIL PANEL */}
//       {selectedStop && (
//         <View style={[styles.detailPanel, GlobalStyles.shadowLg, { backgroundColor: theme.card }]}>
//           <View style={styles.panelHeader}>
//             <View style={{ flex: 1 }}>
//               {/* English Name */}
//               <Text style={[styles.stopTitle, { color: theme.text }]}>
//                 {selectedStop.name_en}
//               </Text>
//               {/* Burmese Name - Added here */}
//               <Text style={{ color: theme.text, fontSize: 16, marginTop: 2, fontWeight: '500' }}>
//                 {selectedStop.name_mm}
//               </Text>
//             </View>
            
//             <TouchableOpacity onPress={() => setSelectedStop(null)}>
//                 <Text style={{ color: theme.textMuted, fontSize: 18, padding: 5 }}>✕</Text>
//             </TouchableOpacity>
//           </View>

//           <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 5 }}>
//             {selectedStop.road_en} • {selectedStop.township_en}
//           </Text>
          
//           <Text style={[styles.sectionTitle, { color: theme.text }]}>Passing Bus Lines</Text>
//           <View style={styles.routeRow}>
//             {stopRoutes.map(route => (
//               <View key={route.id} style={[styles.routeBadge, { backgroundColor: `#${route.color || 'ccc'}` }]}>
//                 <Text style={styles.routeBadgeText}>{route.id.split('-')[0]}</Text>
//               </View>
//             ))}
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   topOverlay: { position: 'absolute', top: 10, left: 15, right: 15 },
//   inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: LAYOUT.borderRadius.md, borderWidth: 1 },
//   searchInput: { flex: 1, padding: 12, fontSize: FONT.size_md },
//   resultsContainer: { marginTop: 5, borderRadius: LAYOUT.borderRadius.md, overflow: 'hidden', elevation: 5 },
//   resultItem: { padding: 15, borderBottomWidth: 0.5, borderColor: '#eee' },
//   chipList: { marginTop: 10 },
//   chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
//   chipText: { fontSize: 12, fontWeight: 'bold' },
  
//   detailPanel: { 
//     position: 'absolute', bottom: 30, left: 15, right: 15, 
//     padding: 20, borderRadius: LAYOUT.borderRadius.lg, borderBottomWidth: 0
//   },
//   panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
//   stopTitle: { fontSize: FONT.size_lg, fontWeight: 'bold' },
//   sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
//   routeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
//   routeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, minWidth: 40, alignItems: 'center' },
//   routeBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
// });

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getTownshipList, getStopsByTownship, getStopsForSearch, getRouteDetailsByIds } from '../utils/stops';
import { useTheme } from '../styles/ThemesContext';
import { getGlobalStyles, LAYOUT, FONT } from '../styles/globalCSS';

export default function StopsPage() {
  const { theme } = useTheme();
  const gStyles = getGlobalStyles(theme); // Added for dynamic global styles
  const mapRef = useRef(null);
  
  // Logic remains exactly as you provided...
  const [allMarkers, setAllMarkers] = useState([]);
  const [townships, setTownships] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTownship, setSelectedTownship] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [stopRoutes, setStopRoutes] = useState([]);

  const searchCache = useRef([]);
  const loadingQueue = useRef([]);
  const isMounted = useRef(true);

  useEffect(() => {
    async function init() {
      searchCache.current = await getStopsForSearch();
      const list = await getTownshipList();
      setTownships(list);
      loadingQueue.current = [...list];
      streamNextTownship();
    }
    init();
    return () => { isMounted.current = false; };
  }, []);

  const streamNextTownship = async () => {
    if (loadingQueue.current.length === 0 || !isMounted.current) return;
    const next = loadingQueue.current.shift();
    const data = await getStopsByTownship(next.township_en);
    setAllMarkers(prev => [...prev, ...data]);
    requestAnimationFrame(streamNextTownship);
  };

  const displayMarkers = useMemo(() => {
    if (!selectedTownship) return allMarkers;
    return allMarkers.filter(m => m.township_en === selectedTownship);
  }, [allMarkers, selectedTownship]);

  const filteredResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return searchCache.current.filter(s => s.name_en?.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

  const handleStopSelection = async (stop) => {
    setSelectedStop(stop);
    setSearchQuery("");
    Keyboard.dismiss();
    mapRef.current?.animateToRegion({
      latitude: stop.lat,
      longitude: stop.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 800);
    const routes = await getRouteDetailsByIds(stop.route_ids_string);
    setStopRoutes(routes);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapView 
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        mapPadding={{ top: 120, right: 10, bottom: 140, left: 10 }}
        initialRegion={{ latitude: 16.82, longitude: 96.15, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        onPress={() => setSelectedStop(null)}
      >
        {displayMarkers.map(stop => (
          <Marker
            key={`marker-${stop.id}-${stop.lat}`}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            tracksViewChanges={false}
            pinColor={theme.primary}
            onPress={() => handleStopSelection(stop)}
          />
        ))}
      </MapView>

      {/* SEARCH & CHIPS OVERLAY */}
      <View style={styles.topOverlay}>
        <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput 
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search bus stops..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Text style={{color: theme.textMuted, paddingRight: 15, fontSize: 18}}>✕</Text>
                </TouchableOpacity>
            )}
        </View>

        {filteredResults.length > 0 && (
          <View style={[styles.resultsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {filteredResults.map(res => (
              <TouchableOpacity key={res.id} style={[styles.resultItem, { borderBottomColor: theme.border }]} onPress={() => handleStopSelection(res)}>
                <Text style={{color: theme.text, fontWeight: '600'}}>{res.name_en}</Text>
                <Text style={{color: theme.textMuted, fontSize: 10, marginTop: 2}}>{res.township_en}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <FlatList 
          horizontal
          data={townships}
          showsHorizontalScrollIndicator={false}
          style={styles.chipList}
          renderItem={({item}) => {
            const isSelected = selectedTownship === item.township_en;
            return (
              <TouchableOpacity 
                onPress={() => setSelectedTownship(isSelected ? null : item.township_en)}
                style={[
                  styles.chip, 
                  { 
                    backgroundColor: isSelected ? theme.primary : theme.card, 
                    borderColor: isSelected ? theme.primary : theme.border 
                  }
                ]}
              >
                <Text style={[styles.chipText, { color: isSelected ? "#FFF" : theme.text }]}>
                    {isSelected ? "✕ " : ""}{item.township_en}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* DETAIL PANEL */}
      {selectedStop && (
        <View style={[styles.detailPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.panelHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stopTitle, { color: theme.text }]}>
                {selectedStop.name_en}
              </Text>
              <Text style={{ color: theme.text, fontSize: 16, marginTop: 2, fontWeight: '600' }}>
                {selectedStop.name_mm}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedStop(null)}>
                <View style={[styles.closeBtn, { backgroundColor: theme.border }]}>
                    <Text style={{ color: theme.text, fontSize: 14 }}>✕</Text>
                </View>
            </TouchableOpacity>
          </View>

          <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 8 }}>
            {selectedStop.road_en} • {selectedStop.township_en}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Passing Bus Lines</Text>
          <View style={styles.routeRow}>
            {stopRoutes.map(route => (
              <View key={route.id} style={[styles.routeBadge, { backgroundColor: route.color ? `#${route.color}` : theme.primary }]}>
                <Text style={styles.routeBadgeText}>{route.id.split('-')[0]}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topOverlay: { position: 'absolute', top: 10, left: 15, right: 15 },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: LAYOUT.borderRadius.md, 
    borderWidth: 1,
    // Soft shadow for search
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: { flex: 1, padding: 14, fontSize: FONT.size_md },
  resultsContainer: { marginTop: 5, borderRadius: LAYOUT.borderRadius.md, borderWidth: 1, overflow: 'hidden', elevation: 5 },
  resultItem: { padding: 15, borderBottomWidth: 1 },
  chipList: { marginTop: 12 },
  chip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 8, 
    borderWidth: 1,
    height: 36,
    justifyContent: 'center'
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  
  detailPanel: { 
    position: 'absolute', bottom: 30, left: 10, right: 10, 
    padding: 20, borderRadius: LAYOUT.borderRadius.lg,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  closeBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stopTitle: { fontSize: FONT.size_lg, fontWeight: 'bold' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textTransform: 'uppercase', opacity: 0.6 },
  routeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  routeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, minWidth: 42, alignItems: 'center' },
  routeBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});