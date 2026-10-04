import { create } from 'zustand';
import { Appearance, Platform } from 'react-native';
import { getDatabase } from '@/db/database';
import { SettingsRepository } from '@/db/repositories/settingsRepository';
import {
  cancelAllScheduledNotificationsAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications';
import { syncAllHabitsNotifications } from '@/services/notificationService';
import { useHabitsStore } from '@/stores/useHabitsStore';

export type ThemePreference = 'system' | 'light' | 'dark';

interface SettingsState {
  themePreference: ThemePreference;
  notificationsEnabled: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  fetchSettings: () => Promise<void>;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
}

const getRepo = async () => {
  const db = await getDatabase();
  return new SettingsRepository(db);
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  themePreference: 'system',
  notificationsEnabled: true,
  isLoading: false,
  isLoaded: false,

  fetchSettings: async () => {
    try {
      set({ isLoading: true });
      const repo = await getRepo();
      const savedTheme = (await repo.getSetting('theme_preference', 'system')) as ThemePreference;
      const savedNotifications = (await repo.getSetting('notifications_enabled', 'true')) === 'true';

      // Apply theme preference to React Native's Appearance API
      if (savedTheme === 'system') {
        Appearance.setColorScheme('unspecified');
      } else {
        Appearance.setColorScheme(savedTheme);
      }

      set({
        themePreference: savedTheme,
        notificationsEnabled: savedNotifications,
        isLoaded: true,
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setThemePreference: async (pref: ThemePreference) => {
    try {
      set({ themePreference: pref });
      if (pref === 'system') {
        Appearance.setColorScheme('unspecified');
      } else {
        Appearance.setColorScheme(pref);
      }
      const repo = await getRepo();
      await repo.setSetting('theme_preference', pref);
    } catch (err) {
      console.error('Error saving theme preference:', err);
    }
  },

  setNotificationsEnabled: async (enabled: boolean) => {
    try {
      if (enabled && Platform.OS !== 'web') {
        const { status: existingStatus } = await getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          return false;
        }
      }

      set({ notificationsEnabled: enabled });
      const repo = await getRepo();
      await repo.setSetting('notifications_enabled', enabled ? 'true' : 'false');

      if (Platform.OS !== 'web') {
        if (!enabled) {
          await cancelAllScheduledNotificationsAsync();
        } else {
          const habits = useHabitsStore.getState().habits;
          await syncAllHabitsNotifications(habits);
        }
      }
      return true;
    } catch (err) {
      console.error('Error saving notification preference:', err);
      return false;
    }
  },
}));
