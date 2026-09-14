import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, useColorScheme, View, Text } from 'react-native';

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFonts, Aldrich_400Regular } from '@expo-google-fonts/aldrich';


import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { DatabaseProvider, useDatabase } from '@/context/DatabaseContext';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

function RootApp() {
  const colorScheme = useColorScheme();
  const { isReady, error } = useDatabase();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[colorScheme === 'unspecified' ? 'light' : colorScheme];

  const insets = useSafeAreaInsets();
  const customTopPadding = Math.max(insets.top - 14, 14);

  const [fontsLoaded] = useFonts({
    Aldrich_400Regular,
  });

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24 }}>
        <Text style={{ color: colors.danger, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Database Error</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{error.message}</Text>
      </View>
    );
  }

  if (!fontsLoaded || !isReady) {
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
