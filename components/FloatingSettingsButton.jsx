// import { Pressable, Text, StyleSheet } from "react-native";

// export default function FloatingSettingsButton() {
//   return (
//     <Pressable 
//       style={styles.fab}
//       onPress={() => console.log("Settings pressed")}
//     >
//       <Text style={styles.icon}>!</Text>
//     </Pressable>
//   );
// }

// const styles = StyleSheet.create({
//   fab: {
//     position: "absolute",
//     bottom: 25,
//     right: 25,
//     width: 45,
//     height: 45,
//     borderRadius: 30,
//     backgroundColor: "#b63beb",
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 4,
//   },
//   icon: {
//     color: "white",
//     fontSize: 26,
//   },
// });

import { Pressable, StyleSheet, Animated } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useRef } from "react";
import { useTheme } from "../styles/ThemesContext";

export default function FloatingSettingsButton({ onPress }) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          backgroundColor: theme.primary,
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        android_ripple={{ color: theme.card }}
        style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
      >
        <FontAwesome5 name="cog" size={22} color="white" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 25,
    right: 25,
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
