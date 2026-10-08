import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, useColorScheme, View } from 'react-native';

// Ocultar barras de scroll vertical e horizontal globalmente em toda a app
(ScrollView as unknown as { defaultProps?: Record<string, unknown> }).defaultProps = {
  ...((ScrollView as unknown as { defaultProps?: Record<string, unknown> }).defaultProps || {}),
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
};

(FlatList as unknown as { defaultProps?: Record<string, unknown> }).defaultProps = {
  ...((FlatList as unknown as { defaultProps?: Record<string, unknown> }).defaultProps || {}),
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
};

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aldrich_400Regular, useFonts } from '@expo-google-fonts/aldrich';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { DatabaseProvider, useDatabase } from '@/context/DatabaseContext';
import { setupNotifications } from '@/services/notificationService';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';

SplashScreen.preventAutoHideAsync();

function RootApp() {
  const colorScheme = useColorScheme();
  const { isReady, error } = useDatabase();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[colorScheme === 'unspecified' ? 'light' : colorScheme];

  const insets = useSafeAreaInsets();
  const customTopPadding = insets.top;

  const [fontsLoaded] = useFonts({
    Aldrich_400Regular,
  });

  const { user, isLoaded: isUserLoaded, fetchProfile } = useUserStore();
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const settingsLoaded = useSettingsStore((state) => state.isLoaded);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    setupNotifications().catch(console.warn);
  }, []);

  useEffect(() => {
    if (isReady) {
      fetchProfile();
      fetchSettings();
    }
  }, [isReady, fetchProfile, fetchSettings]);

  useEffect(() => {
    if (!fontsLoaded || !isReady || !isUserLoaded || !settingsLoaded) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!user && !inOnboarding) {
      router.replace('/onboarding');
    } else if (user && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [fontsLoaded, isReady, isUserLoaded, settingsLoaded, user, segments, router]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24 }}>
        <Text style={{ color: colors.danger, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Database Error</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{error.message}</Text>
      </View>
    );
  }

  if (!fontsLoaded || !isReady || !isUserLoaded || !settingsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={theme}>
      <AnimatedSplashOverlay />
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: customTopPadding }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              gestureEnabled: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="workout/active"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="workout/[id]"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="workout/summary/[id]"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="statistics/prs"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="profile/bodyweight"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="profile/progress-alerts"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <RootApp />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
