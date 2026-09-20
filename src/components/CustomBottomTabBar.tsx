import React from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export type TabKey = 'index' | 'workouts' | 'profile';

interface TabItemConfig {
  key: TabKey;
  label: string;
  focusedIcon: keyof typeof Ionicons.glyphMap;
  outlineIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItemConfig[] = [
  {
    key: 'index',
    label: 'Home',
    focusedIcon: 'home',
    outlineIcon: 'home-outline',
  },
  {
    key: 'workouts',
    label: 'Workouts',
    focusedIcon: 'barbell',
    outlineIcon: 'barbell-outline',
  },
  {
    key: 'profile',
    label: 'Profile',
    focusedIcon: 'person',
    outlineIcon: 'person-outline',
  },
];

interface CustomBottomTabBarProps {
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export function CustomBottomTabBar({ activeIndex, onTabPress }: CustomBottomTabBarProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10),
        },
      ]}>
      {TABS.map((tab, index) => {
        const isFocused = activeIndex === index;
        const color = isFocused ? colors.tint : colors.textSecondary;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => onTabPress(index)}
            style={styles.tabItem}>
            <Ionicons
              name={isFocused ? tab.focusedIcon : tab.outlineIcon}
              size={24}
              color={color}
            />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});
