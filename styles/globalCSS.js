import { StyleSheet } from "react-native";

export const BASE_COLORS = {
    primary: "#b63beb", 
    secondary: "#4F46E5",
    success: "#10B981",
    error: "#EF4444",
    white: "#FFFFFF",
    black: "#333",
};

export const LAYOUT = {
    padding: 16,
    margin: 12,
    borderRadius: { sm: 6, md: 10, lg: 12 }, // Updated to match your calc snippet
    spacing: { xs: 4, sm: 8, md: 12, lg: 16 }
};

export const FONT = {
    size_xs: 11,
    size_sm: 12, // Adjusted to your calc snippet
    size_md: 14,
    size_lg: 18,
    weight_bold: "bold", // Use standard "bold" for cleaner look
};

export const getGlobalStyles = (theme) => {
    return {
        row: { flexDirection: "row", alignItems: "center" },
        center: { flex: 1, justifyContent: "center", alignItems: "center" },
        container: { flex: 1, backgroundColor: theme.background, padding: LAYOUT.padding },

        // --- Standardized Boxes (No Shadows) ---
        input: {
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
            fontSize: FONT.size_md,
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
        },
        card: {
            padding: 16,
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            marginTop: 12,
            // Removed all shadow/elevation properties here
        },

        // --- Standardized Text ---
        title: {
            fontSize: FONT.size_md,
            fontWeight: 'bold',
            color: theme.text,
        },
        subtitle: {
            fontSize: FONT.size_sm,
            color: theme.textMuted,
            marginTop: 2,
        },

        // --- Badges ---
        badge: {
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: theme.primary,
            justifyContent: 'center',
            alignItems: 'center'
        },
        badgeText: {
            fontSize: FONT.size_sm,
            fontWeight: 'bold',
            color: '#FFFFFF',
        }
    };
};