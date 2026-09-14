import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';

function AppHeader() {
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

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <AppTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  logoText: {
    fontFamily: 'Aldrich_400Regular',
    fontSize: 24,
    letterSpacing: 1,
  },
});
