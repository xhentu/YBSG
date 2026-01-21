import { Stack, useRouter, useSegments } from "expo-router";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect } from "react";

// Database asset import
import "../assets/db/busSystem.db" 

// Themes and Style
import { ThemeProvider, useTheme } from "../styles/ThemesContext";
import { getGlobalStyles } from "../styles/globalCSS";

// Components
import TopNav from "../components/TopNav";
import FloatingSettingsButton from "../components/FloatingSettingsButton";

// Database initialization utility
import { initDatabase } from "../utils/database";

// This component handles the themed styling for the root
function MainLayout() {
    const { theme } = useTheme();
    const globalStyles = getGlobalStyles(theme);
    const segments = useSegments();
    const router = useRouter();
    const current = segments[0] || "index"; 

    useEffect(() => {
        initDatabase();
    }, []);

    return (
        <SafeAreaView 
            style={[styles.container, { backgroundColor: theme.background }]} 
            edges={['top']}
        >
            <TopNav
                activePage={current}
                setActivePage={(page) => router.push(`/${page}`)}
            />

            <View style={[styles.pageContainer, { backgroundColor: theme.background }]}>
                <Stack screenOptions={{ 
                    headerShown: false, 
                    unmountOnBlur: true,
                    // Ensures screen transitions don't show white flashes
                    contentStyle: { backgroundColor: theme.background } 
                }}>
                    <Stack.Screen name="index" /> 
                    <Stack.Screen name="routes" />
                    <Stack.Screen name="stops" />
                    <Stack.Screen name="calc" />
                    <Stack.Screen name="info" />
                    <Stack.Screen name="[...missing]" options={{ title: '404' }} />
                </Stack>
            </View>

            <FloatingSettingsButton />
        </SafeAreaView>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <MainLayout />
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
    },
    pageContainer: { 
        flex: 1,
    },
});