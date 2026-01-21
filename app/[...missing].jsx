import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../styles/ThemesContext';
import { GlobalStyles } from '../styles/globalCSS';
import { FontAwesome5 } from '@expo/vector-icons';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      <FontAwesome5 name="exclamation-triangle" size={60} color={theme.primary} style={styles.icon} />

      <Text style={[styles.title, { color: theme.text }]}>404</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        Oops! This page could not be found.
      </Text>

      <TouchableOpacity 
        style={[GlobalStyles.primaryButton, styles.button, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/')}
      >
        <Text style={GlobalStyles.primaryButtonText}>Go to Home Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    width: '80%',
    maxWidth: 300,
  }
});