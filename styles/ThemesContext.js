import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { BASE_COLORS } from './globalCSS';

// --- Theme Definitions ---
const lightTheme = {
    // Primary elements
    primary: BASE_COLORS.primary,   // #b63beb (Rich Violet)
    secondary: "#4F46E5",          // Indigo
    
    // Backgrounds
    background: '#F9FAFB',         // Soft Gray-White
    card: '#FFFFFF',               // Pure White
    
    // Text
    text: '#333',               // Deep Charcoal (Near black)
    textMuted: '#777',          // Slate Gray
    
    // Borders/Dividers
    border: '#333',             // Standard Light Border
    
    status: 'light',
};

const darkTheme = {
    // Primary elements
    primary: '#D18BFF',            // Softer Violet (better for eyes on dark)
    secondary: '#818CF8',
    
    // Backgrounds
    background: '#0F0F0F',         // True Deep Black
    card: '#1A1A1A',               // Dark Charcoal Card
    
    // Text
    text: '#F9FAFB',               // Off-White
    textMuted: '#9CA3AF',          // Medium Gray
    
    // Borders/Dividers
    border: '#2E2E2E',             // Subtle Dark Border
    
    status: 'dark',
};

// --- Context and Hook Setup ---
const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme(); 
    const [themeType, setThemeType] = useState(systemColorScheme || 'light'); 

    const currentTheme = themeType === 'dark' ? darkTheme : lightTheme;

    // Sync with system preference
    useEffect(() => {
        if (systemColorScheme) {
            setThemeType(systemColorScheme);
        }
    }, [systemColorScheme]);

    const toggleTheme = () => {
        setThemeType(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const value = {
        theme: currentTheme,
        themeType,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};