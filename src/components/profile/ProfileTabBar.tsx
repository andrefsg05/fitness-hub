import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

export type ProfileTabKey = 'progress' | 'goals' | 'reminders' | 'settings';

interface TabItem {
  key: ProfileTabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  {
    key: 'progress',
    label: 'Progress',
    icon: 'trending-up-outline',
    activeIcon: 'trending-up',
  },
  {
    key: 'goals',
    label: 'Goals',
    icon: 'flag-outline',
    activeIcon: 'flag',
  },
  {
    key: 'reminders',
    label: 'Reminders',
    icon: 'alarm-outline',
    activeIcon: 'alarm',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'settings-outline',
    activeIcon: 'settings',
  },
];

interface ProfileTabBarProps {
  activeTab: ProfileTabKey;
  onSelectTab: (tab: ProfileTabKey) => void;
}

export function ProfileTabBar({ activeTab, onSelectTab }: ProfileTabBarProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const iconColor = isActive ? colors.primary : colors.textSecondary;
        const textColor = isActive ? colors.primary : colors.textSecondary;

        return (
          <Pressable
            key={tab.key}
            style={[
              styles.tabButton,
              isActive && { backgroundColor: colors.primarySubtle },
            ]}
            onPress={() => onSelectTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}>
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={18}
              color={iconColor}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: textColor },
                isActive && styles.activeTabLabel,
              ]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});
