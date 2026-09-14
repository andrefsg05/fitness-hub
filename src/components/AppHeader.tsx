import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export function AppHeader() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.logoText, { color: colors.text }]}>
        fitness<Text style={{ color: colors.primary }}>hub</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  logoText: {
    fontFamily: 'Aldrich_400Regular',
    fontSize: 24,
    letterSpacing: 1,
  },
});
