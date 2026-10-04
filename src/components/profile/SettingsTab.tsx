import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useSettingsStore, ThemePreference } from '@/stores/useSettingsStore';

export function SettingsTab() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const {
    themePreference,
    notificationsEnabled,
    setThemePreference,
    setNotificationsEnabled,
  } = useSettingsStore();

  const THEME_OPTIONS: { key: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* 1. Theme Preference */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>App Theme</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Customize the look and feel of the app
            </Text>
          </View>
        </View>

        <View style={styles.themeSelectorRow}>
          {THEME_OPTIONS.map((opt) => {
            const isSelected = themePreference === opt.key;

            return (
              <Pressable
                key={opt.key}
                style={[
                  styles.themeOptionCard,
                  {
                    backgroundColor: isSelected ? colors.primarySubtle : colors.backgroundElement,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setThemePreference(opt.key)}>
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={isSelected ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeOptionLabel,
                    { color: isSelected ? colors.primary : colors.text },
                    isSelected && { fontWeight: '700' },
                  ]}>
                  {opt.label}
                </Text>
                {isSelected && (
                  <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2. Notifications Preference */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.settingRow}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Receive scheduled alerts for habits & workouts
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(val) => {
              setNotificationsEnabled(val);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </View>
      </View>

      {/* 3. App & Storage Info */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Offline-First Storage</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              All data is stored securely on this device (SQLite)
            </Text>
          </View>
        </View>

        <View style={[styles.appVersionRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.versionLabel, { color: colors.textSecondary }]}>App Version</Text>
          <Text style={[styles.versionValue, { color: colors.text }]}>1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  headerInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.one,
  },
  themeOptionCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  themeOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    bottom: 6,
  },
  appVersionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
  versionLabel: {
    fontSize: 12,
  },
  versionValue: {
    fontSize: 12,
    fontWeight: '700',
  },
});
