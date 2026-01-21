// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { useRouter } from "expo-router";

// import { getAllRoutes } from "../utils/routes";
// import { useTheme } from "../styles/ThemesContext";
// import { BASE_COLORS, LAYOUT, FONT, GlobalStyles } from "../styles/globalCSS";

// const CARD_HEIGHT = 92;

// export default function RoutesPage() {
//   const router = useRouter();
//   const { theme } = useTheme();

//   const [routes, setRoutes] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     async function loadRoutes() {
//       try {
//         const data = await getAllRoutes();
//         if (mounted) setRoutes(data || []);
//       } catch (err) {
//         console.error("Error loading routes", err);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }

//     loadRoutes();
//     return () => (mounted = false);
//   }, []);

//   const openRoute = useCallback(
//     (routeId) => {
//       router.push(`/routes/${encodeURIComponent(routeId)}`);
//     },
//     [router]
//   );

//   const renderItem = useCallback(
//     ({ item }) => {
//       const rawColor = item.color || BASE_COLORS.primary;
//       const badgeColor = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
//       const cleanId = item.id?.split("-")[0] ?? "";

//       return (
//         <TouchableOpacity
//           activeOpacity={0.88}
//           onPress={() => openRoute(item.id)}
//           style={[
//             styles.card,
//             GlobalStyles.shadowSm,
//             {
//               backgroundColor: theme.card,
//               borderColor: theme.border,
//             },
//           ]}
//         >
//           <View style={GlobalStyles.row}>
//             {/* ID Badge */}
//             <View style={[styles.idBox, { backgroundColor: badgeColor }]}>
//               <Text style={styles.idText}>{cleanId}</Text>
//             </View>

//             {/* Route Info */}
//             <View style={styles.infoColumn}>
//               <Text
//                 style={[styles.routeName, { color: theme.text }]}
//                 numberOfLines={2}
//               >
//                 {item.name}
//               </Text>

//               <Text
//                 style={[styles.agencyText, { color: theme.textMuted }]}
//                 numberOfLines={1}
//               >
//                 {item.agency_id}
//               </Text>
//             </View>
//           </View>
//         </TouchableOpacity>
//       );
//     },
//     [theme, openRoute]
//   );

//   if (loading) {
//     return (
//       <View
//         style={[
//           GlobalStyles.center,
//           { backgroundColor: theme.background },
//         ]}
//       >
//         <ActivityIndicator size="large" color={theme.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       <FlatList
//         data={routes}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: LAYOUT.spacing.lg }}
//         initialNumToRender={12}
//         maxToRenderPerBatch={12}
//         windowSize={11}
//         getItemLayout={(_, index) => ({
//           length: CARD_HEIGHT,
//           offset: CARD_HEIGHT * index,
//           index,
//         })}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: LAYOUT.padding,
//   },

//   card: {
//     height: CARD_HEIGHT,
//     padding: LAYOUT.spacing.sm,
//     marginBottom: LAYOUT.spacing.md,
//     borderRadius: LAYOUT.borderRadius.md,
//     borderWidth: 1,
//     justifyContent: "center",
//   },

//   idBox: {
//     minWidth: 56,
//     height: 56,
//     borderRadius: LAYOUT.borderRadius.sm,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: LAYOUT.spacing.sm,
//   },

//   idText: {
//     color: BASE_COLORS.white,
//     fontSize: FONT.size_lg,
//     fontWeight: FONT.weight_bold,
//   },

//   infoColumn: {
//     marginLeft: LAYOUT.spacing.lg,
//     flex: 1,
//   },

//   routeName: {
//     fontSize: FONT.size_md,
//     fontWeight: FONT.weight_semibold,
//   },

//   agencyText: {
//     fontSize: FONT.size_xs,
//     marginTop: LAYOUT.spacing.xs,
//   },
// });


import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

import { getAllRoutes } from "../utils/routes";
import { useTheme } from "../styles/ThemesContext";
import { LAYOUT, getGlobalStyles } from "../styles/globalCSS";

export default function RoutesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const gStyles = getGlobalStyles(theme);

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadRoutes() {
      try {
        const data = await getAllRoutes();
        if (mounted) setRoutes(data || []);
      } catch (err) {
        console.error("Error loading routes", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadRoutes();
    return () => (mounted = false);
  }, []);

  const openRoute = useCallback(
    (routeId) => {
      router.push(`/routes/${encodeURIComponent(routeId)}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const rawColor = item.color || theme.primary;
      const badgeColor = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
      const cleanId = item.id?.split("-")[0] ?? "";

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openRoute(item.id)}
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.rowAlignTop}>
            {/* ID Badge */}
            <View style={[styles.idBox, { backgroundColor: badgeColor }]}>
              <Text style={styles.idText}>{cleanId}</Text>
            </View>

            {/* Route Info */}
            <View style={styles.infoColumn}>
              <Text
                style={[styles.routeName, { color: theme.text }]}
                // Removed numberOfLines to show full name
              >
                {item.name}
              </Text>

              <Text
                style={[styles.agencyText, { color: theme.textMuted }]}
                numberOfLines={1}
              >
                {item.agency_id}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [theme, openRoute]
  );

  if (loading) {
    return (
      <View style={[gStyles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: LAYOUT.spacing.lg }}
        initialNumToRender={10}
        // Removed getItemLayout because height is now dynamic (variable)
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  card: {
    // Removed fixed height to allow expansion
    minHeight: 80, 
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
  },
  rowAlignTop: {
    flexDirection: "row",
    alignItems: "flex-start", // Align badge to top if text is long
  },
  idBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  idText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoColumn: {
    marginLeft: 15,
    flex: 1,
    justifyContent: "center",
  },
  routeName: {
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 22, // Added spacing for readability on multiple lines
    marginBottom: 4,
  },
  agencyText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
