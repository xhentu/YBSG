// import { View, Pressable, Text, StyleSheet, Animated } from "react-native";
// import React, { useRef, useEffect } from "react";

// const tabs = ["routes", "stops", "calc", "map"];

// export default function TopNav({ activePage, setActivePage }) {
//   const underlineAnim = useRef(new Animated.Value(0)).current;
//   const TAB_WIDTH = 90;

//   useEffect(() => {
//     const index = tabs.indexOf(activePage);

//     Animated.timing(underlineAnim, {
//       toValue: index * TAB_WIDTH,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, [activePage]);

//   return (
//     <View style={styles.topNav}>
//       <View style={styles.row}>

//         {/* Animated underline */}
//         <Animated.View
//           style={[
//             styles.underline,
//             { width: TAB_WIDTH, transform: [{ translateX: underlineAnim }] }
//           ]}
//         />

//         {tabs.map((tab) => (
//           <Pressable
//             key={tab}
//             style={styles.navButton}
//             onPress={() => setActivePage(tab)}
//           >
//             <Text style={styles.navText}>{tab.toUpperCase()}</Text>
//           </Pressable>
//         ))}

//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//     topNav: {
//       paddingTop: 6,
//       paddingBottom: 10,
//       backgroundColor: "#f0f2f5",
//       borderBottomWidth: 1,
//       borderBottomColor: "#e0d5eb", // soft purple-gray
//     },
  
//     row: {
//       flexDirection: "row",
//       justifyContent: "space-around",   // cleaner spacing
//       alignItems: "center",
//       position: "relative",
//       // paddingHorizontal: 12,
//     },
  
//     navButton: {
//       // paddingVertical: 6,
//       // paddingHorizontal: 10,
//       width: TAB_WIDTH,
//       alignItems: "center",
//       paddingVertical: 6,
//     },
  
//     navText: {
//       fontSize: 15,
//       fontWeight: "600",
//       color: "#b63beb",
//     },
  
//     underline: {
//       position: "absolute",
//       bottom: 0,
//       height: 3,
//       backgroundColor: "#b63beb",
//       borderRadius: 3,
//     },
//   });  


// second topNav

// import { View, Pressable, Text, StyleSheet, Animated } from "react-native";
// import React, { useRef, useEffect, useState } from "react";

// const tabs = ["routes", "stops", "calc", "info"];

// // --- CONSTANTS ---
// const ROW_PADDING_HORIZONTAL = 10; 
// const UNDERLINE_WIDTH_SHORT = 45; // New constant for the shorter underline

// export default function TopNav({ activePage, setActivePage }) {
//   // We use one Animated.Value for the position (translateX)
//   const positionAnim = useRef(new Animated.Value(0)).current; 
  
//   // State to hold the layout information: x-coordinate and width for each tab
//   const [tabLayouts, setTabLayouts] = useState([]); 
  
//   // State to hold the width of the active tab (will be set to UNDERLINE_WIDTH_SHORT)
//   const [currentTabWidth, setCurrentTabWidth] = useState(0); 

//   // --- 1. Store Layout Measurements (Captures x and width) ---
//   const handleTabLayout = (event, index) => {
//     const { x, width } = event.nativeEvent.layout;
    
//     setTabLayouts(prev => {
//       const newLayouts = [...prev];
//       // Store the button's layout (position x and its full width)
//       if (!newLayouts[index] || newLayouts[index].x !== x || newLayouts[index].width !== width) {
//          newLayouts[index] = { x, width };
//       }
//       return newLayouts;
//     });
//   };

//   // --- 2. Animate Position & Update Width ---
//   useEffect(() => {
//     const index = tabs.indexOf(activePage);

//     if (tabLayouts[index]) {
//       const { x, width } = tabLayouts[index];

//       // Calculate the adjustment needed to CENTER the shorter underline:
//       // Start position (x) + (Full Button Width / 2) - (Underline Width / 2)
//       const centerOffset = x + (width / 2) - (UNDERLINE_WIDTH_SHORT / 2);

//       // 1. Smoothly Animate Position (using Spring for elegance)
//       Animated.spring(positionAnim, {
//         toValue: centerOffset,
//         duration: 400, // Spring doesn't use duration, but uses tension/friction
//         useNativeDriver: true,
//         // Optional: Custom spring configuration for a different feel
//         tension: 300, 
//         friction: 20, 
//       }).start();

//       // 2. Statically Update Width 
//       // Set the width to the fixed shorter value (only needs to run once)
//       if (currentTabWidth !== UNDERLINE_WIDTH_SHORT) {
//         setCurrentTabWidth(UNDERLINE_WIDTH_SHORT);
//       }
//     }
//   }, [activePage, tabLayouts, positionAnim]); 

//   return (
//     <View style={styles.topNav}>
//       <View style={styles.row}>
        
//         {/* Animated underline */}
//         <Animated.View
//           style={[
//             styles.underline,
//             { 
//               width: currentTabWidth, // Now uses the fixed shorter width
//               transform: [{ translateX: positionAnim }] // Position is centered
//             }
//           ]}
//         />

//         {tabs.map((tab, index) => (
//           <Pressable
//             key={tab}
//             style={styles.navButton} 
//             onPress={() => setActivePage(tab)}
//             onLayout={(event) => handleTabLayout(event, index)}
//           >
//             <Text 
//               style={[
//                 styles.navText,
//                 activePage === tab && styles.activeNavText,
//               ]}
//             >
//               {tab.toUpperCase()}
//             </Text>
//           </Pressable>
//         ))}

//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   topNav: {
//     paddingTop: 6,
//     paddingBottom: 13, 
//     // backgroundColor: "#f0f2f5",
//     // borderBottomWidth: 1,
//     // borderBottomColor: "#e0d5eb", 
//   },

//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between", 
//     alignItems: "center",
//     position: "relative",
//     paddingHorizontal: ROW_PADDING_HORIZONTAL, 
//   },

//   navButton: {
//     flex: 1, 
//     alignItems: "center",
//     paddingVertical: 6,
//   },

//   navText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#a0a0a0",
//   },
  
//   activeNavText: {
//     color: "#b63beb",
//   },

//   underline: {
//     position: "absolute",
//     bottom: 0, 
//     height: 3,
//     backgroundColor: "#b63beb",
//     borderRadius: 3,
//     left: 0, 
//   },
// });

// third topNav

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../styles/ThemesContext'; // Import theme hook
import { LAYOUT, FONT } from '../styles/globalCSS';

// Define the tabs and their icons
const TABS = [
    { name: 'routes', icon: 'bus-alt', label: 'Routes' },
    { name: 'stops', icon: 'map-marked-alt', label: 'Stops' },
    { name: 'calc', icon: 'route', label: 'Calc' },
    { name: 'info', icon: 'question-circle', label: 'Info' }, // Updated from 'map' to 'info'
];

export default function TopNav({ activePage, setActivePage }) {
    const { theme } = useTheme();

    // Determine the icon set for the index route (Home/Search)
    const indexIcon = activePage === 'index' ? 'search' : 'search'; 

    const handlePress = (page) => {
        setActivePage(page);
    };

    return (
        <View style={[styles.navContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            
            {/* Home/Search Button (Index) */}
            <TouchableOpacity 
                style={styles.indexButton} 
                onPress={() => handlePress('index')}
            >
                <FontAwesome5 
                    name={indexIcon} 
                    size={20} 
                    color={activePage === 'index' ? theme.primary : theme.textMuted} 
                />
            </TouchableOpacity>

            {/* Main Navigation Tabs */}
            <View style={styles.tabsContainer}>
                {TABS.map((tab) => {
                    const isActive = activePage === tab.name;
                    return (
                        <TouchableOpacity 
                            key={tab.name}
                            style={styles.tabButton} 
                            onPress={() => handlePress(tab.name)}
                        >
                            <FontAwesome5 
                                name={tab.icon} 
                                size={18} 
                                // Color changes based on active state and theme
                                color={isActive ? theme.primary : theme.textMuted} 
                            />
                            <Text 
                                style={[
                                    styles.tabText, 
                                    { color: isActive ? theme.primary : theme.textMuted }
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    navContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: LAYOUT.padding,
        paddingVertical: 10,
        // borderBottomWidth: 1,
        // The background and border color are set dynamically via the theme
    },
    indexButton: {
        padding: 10,
        marginRight: 10,
    },
    tabsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabButton: {
        alignItems: 'center',
        padding: 8,
    },
    tabText: {
        fontSize: FONT.size_sm,
        marginTop: 4,
        fontWeight: FONT.weight_semibold,
    },
});