// Gemini
// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TextInput, 
//   TouchableOpacity, 
//   ScrollView, 
//   ActivityIndicator,
//   Keyboard
// } from 'react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { searchStops, getHumanFriendlyRoutes } from '../utils/calcQuery';
// import { useTheme } from '../styles/ThemesContext';

// export default function Calc() {
//   const { theme } = useTheme();
//   const router = useRouter();
//   const params = useLocalSearchParams(); // To catch data back from a map picker if needed

//   const [loading, setLoading] = useState(false);
  
//   // Input States
//   const [startQuery, setStartQuery] = useState('');
//   const [endQuery, setEndQuery] = useState('');
  
//   // Selected Objects
//   const [startStop, setStartStop] = useState(null);
//   const [endStop, setEndStop] = useState(null);
  
//   // UI States
//   const [searchResults, setSearchResults] = useState({ type: null, data: [] });
//   const [solutions, setSolutions] = useState([]);

//   // Handle Search logic as user types
//   const handleSearch = async (text, type) => {
//     if (type === 'start') {
//       setStartQuery(text);
//       setStartStop(null);
//     } else {
//       setEndQuery(text);
//       setEndStop(null);
//     }

//     if (text.length > 1) {
//       const data = await searchStops(text);
//       setSearchResults({ type, data });
//     } else {
//       setSearchResults({ type: null, data: [] });
//     }
//   };

//   const onSelectStop = (stop, type) => {
//     if (type === 'start') {
//       setStartStop(stop);
//       setStartQuery(stop.name_en);
//     } else {
//       setEndStop(stop);
//       setEndQuery(stop.name_en);
//     }
//     setSearchResults({ type: null, data: [] });
//     Keyboard.dismiss();
//   };

//   const handleCalculate = async () => {
//     if (!startStop || !endStop) {
//       alert("Please select both stops from the suggestions!");
//       return;
//     }
    
//     setLoading(true);
//     const paths = await getHumanFriendlyRoutes(startStop, endStop);
//     setSolutions(paths);
//     setLoading(false);
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
      
//       {/* --- INPUT SECTION --- */}
//       <View style={styles.searchContainer}>
//         {/* Start Point */}
//         <View style={styles.inputRow}>
//           <Ionicons name="location" size={20} color="green" style={styles.icon} />
//           <TextInput
//             style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: startStop ? 'green' : theme.border }]}
//             placeholder="From: Search start bus stop..."
//             placeholderTextColor={theme.textMuted}
//             value={startQuery}
//             onChangeText={(t) => handleSearch(t, 'start')}
//           />
//         </View>

//         <View style={[styles.inputRow, { marginTop: 10 }]}>
//           <Ionicons name="flag" size={20} color="red" style={styles.icon} />
//           <TextInput
//             style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: endStop ? 'red' : theme.border }]}
//             placeholder="To: Search destination stop..."
//             placeholderTextColor={theme.textMuted}
//             value={endQuery}
//             onChangeText={(t) => handleSearch(t, 'end')}
//           />
//         </View>

//         {/* --- SUGGESTIONS DROPDOWN --- */}
//         {searchResults.data.length > 0 && (
//           <View style={[styles.dropdown, { backgroundColor: theme.card, shadowColor: '#000' }]}>
//             <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 250 }}>
//               {searchResults.data.map((item) => (
//                 <TouchableOpacity 
//                   key={item.id} 
//                   style={[styles.dropItem, { borderBottomColor: theme.border }]}
//                   onPress={() => onSelectStop(item, searchResults.type)}
//                 >
//                   <Text style={[styles.stopName, { color: theme.text }]}>{item.name_en}</Text>
//                   <Text style={styles.stopDetails}>{item.road_en} • {item.township_en}</Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}

//         <TouchableOpacity 
//           style={[styles.calcBtn, { backgroundColor: (startStop && endStop) ? theme.primary : '#ccc' }]}
//           onPress={handleCalculate}
//           disabled={!startStop || !endStop}
//         >
//           {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.calcBtnText}>Find Best Routes</Text>}
//         </TouchableOpacity>
//       </View>

//       {/* --- RESULTS LIST --- */}
//       <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
//         {solutions.length === 0 && !loading && startStop && endStop && (
//           <Text style={styles.emptyText}>No direct or 1-transfer routes found.</Text>
//         )}

//         {solutions.map((item) => (
//           <TouchableOpacity 
//             key={item.id} 
//             style={[styles.resultCard, { backgroundColor: theme.card }]}
//             onPress={() => router.push({ pathname: '/calcDetail', params: { data: JSON.stringify(item) } })}
//           >
//             <View style={styles.busRow}>
//               {item.busNumbers.map((num, i) => (
//                 <React.Fragment key={i}>
//                   <View style={[styles.busBadge, { backgroundColor: theme.primary }]}>
//                     <Text style={styles.busBadgeText}>{num}</Text>
//                   </View>
//                   {i < item.busNumbers.length - 1 && <Ionicons name="arrow-forward" size={16} color={theme.textMuted} style={{ marginHorizontal: 5 }} />}
//                 </React.Fragment>
//               ))}
//             </View>

//             <View style={styles.routeInfo}>
//               <Text style={[styles.routeType, { color: item.type === 'DIRECT' ? '#4CAF50' : '#FF9800' }]}>
//                 {item.type === 'DIRECT' ? 'Direct Trip' : `1 Transfer at ${item.midStop.name}`}
//               </Text>
//               <Text style={[styles.routeStops, { color: theme.textMuted }]}>
//                 {startStop.name_en} → {endStop.name_en}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15 },
//   searchContainer: { zIndex: 10, marginBottom: 15 },
//   inputRow: { flexDirection: 'row', alignItems: 'center' },
//   icon: { marginRight: 10 },
//   input: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, fontSize: 15 },
//   dropdown: { 
//     position: 'absolute', top: 115, left: 30, right: 0, 
//     borderRadius: 10, elevation: 5, zIndex: 100,
//     borderWidth: 1, borderColor: '#ddd'
//   },
//   dropItem: { padding: 15, borderBottomWidth: 1 },
//   stopName: { fontWeight: 'bold', fontSize: 15 },
//   stopDetails: { fontSize: 12, color: '#888', marginTop: 2 },
//   calcBtn: { marginTop: 15, padding: 15, borderRadius: 10, alignItems: 'center' },
//   calcBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
//   emptyText: { textAlign: 'center', marginTop: 30, color: '#888' },
//   resultCard: { 
//     padding: 16, borderRadius: 12, marginBottom: 12, 
//     elevation: 3, shadowOpacity: 0.1, shadowRadius: 5 
//   },
//   busRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   busBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
//   busBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
//   routeInfo: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
//   routeType: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
//   routeStops: { fontSize: 12 }
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { searchStops, getHumanFriendlyRoutes } from '../utils/calcQuery';

export default function Calc() {
  const router = useRouter();

  // input text
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');

  // selected stop objects
  const [startStop, setStartStop] = useState(null);
  const [endStop, setEndStop] = useState(null);

  // search dropdown
  const [searchResults, setSearchResults] = useState({ type: null, data: [] });

  // results
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- SEARCH ---------------- */

  const handleSearch = async (text, type) => {
    if (type === 'start') {
      setStartQuery(text);
      setStartStop(null);
    } else {
      setEndQuery(text);
      setEndStop(null);
    }

    if (text.trim().length < 2) {
      setSearchResults({ type: null, data: [] });
      return;
    }

    const results = await searchStops(text);
    setSearchResults({ type, data: results });
  };

  const selectStop = (stop, type) => {
    if (type === 'start') {
      setStartStop(stop);
      setStartQuery(stop.name_en);
    } else {
      setEndStop(stop);
      setEndQuery(stop.name_en);
    }
    setSearchResults({ type: null, data: [] });
    Keyboard.dismiss();
  };

  /* ---------------- CALCULATE ---------------- */

  const handleCalculate = async () => {
    if (!startStop || !endStop) return;

    setLoading(true);
    try {
      const paths = await getHumanFriendlyRoutes(startStop, endStop);
      setSolutions(paths);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>

      {/* INPUTS */}
      <View style={styles.inputSection}>

        {/* START */}
        <View style={styles.inputRow}>
          <Ionicons name="location" size={20} color="green" />
          <TextInput
            style={styles.input}
            placeholder="From: search bus stop"
            value={startQuery}
            onChangeText={(t) => handleSearch(t, 'start')}
          />
        </View>

        {/* END */}
        <View style={[styles.inputRow, { marginTop: 10 }]}>
          <Ionicons name="flag" size={20} color="red" />
          <TextInput
            style={styles.input}
            placeholder="To: search destination stop"
            value={endQuery}
            onChangeText={(t) => handleSearch(t, 'end')}
          />
        </View>

        {/* DROPDOWN */}
        {searchResults.data.length > 0 && (
          <View style={styles.dropdown}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {searchResults.data.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.dropItem}
                  onPress={() => selectStop(item, searchResults.type)}
                >
                  <Text style={styles.stopName}>{item.name_en}</Text>
                  <Text style={styles.stopDetail}>
                    {item.road_en} • {item.township_en}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* BUTTON */}
        <TouchableOpacity
          style={[
            styles.calcBtn,
            (!startStop || !endStop) && { backgroundColor: '#aaa' }
          ]}
          disabled={!startStop || !endStop}
          onPress={handleCalculate}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.calcText}>Find Routes</Text>
          }
        </TouchableOpacity>

      </View>

      {/* RESULTS */}
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {solutions.length === 0 && !loading && startStop && endStop && (
          <Text style={styles.empty}>No routes found.</Text>
        )}

        {solutions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/calcDetail',
                params: { data: JSON.stringify(item) }
              })
            }
          >
            <View style={styles.busRow}>
              {item.busNumbers.map((b, i) => (
                <React.Fragment key={i}>
                  <View style={styles.busBadge}>
                    <Text style={styles.busText}>{b}</Text>
                  </View>
                  {i < item.busNumbers.length - 1 && (
                    <Ionicons name="arrow-forward" size={16} />
                  )}
                </React.Fragment>
              ))}
            </View>

            <Text style={styles.routeType}>
              {item.type === 'DIRECT'
                ? 'Direct trip'
                : `Transfer at ${item.midStop.name}`}
            </Text>

            <Text style={styles.routeStops}>
              {startStop.name_en} → {endStop.name_en}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15
  },
  inputSection: {
    zIndex: 10
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12
  },
  dropdown: {
    position: 'absolute',
    top: 120,
    left: 30,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: 260,
    zIndex: 100
  },
  dropItem: {
    padding: 14,
    borderBottomWidth: 1
  },
  stopName: {
    fontWeight: 'bold'
  },
  stopDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  calcBtn: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center'
  },
  calcText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777'
  },
  card: {
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12
  },
  busRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  busBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  busText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  routeType: {
    fontWeight: 'bold',
    marginBottom: 2
  },
  routeStops: {
    fontSize: 12,
    color: '#555'
  }
});


