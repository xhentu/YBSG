import { View, Text, Switch, StyleSheet } from "react-native";
import { useTheme } from "../styles/ThemesContext";

export default function SettingsPage() {
  const { theme, themeType, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
        <Switch value={themeType === "dark"} onValueChange={toggleTheme} />
      </View>

      <Text style={[styles.info, { color: theme.textMuted }]}>
        App Version: 1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    alignItems: "center",
  },
  label: { fontSize: 18 },
  info: { marginTop: 40, fontSize: 14 },
});
