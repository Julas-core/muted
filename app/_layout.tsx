import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  SourGummy_400Regular,
  SourGummy_500Medium,
  SourGummy_600SemiBold,
  SourGummy_700Bold,
  SourGummy_800ExtraBold,
  SourGummy_900Black,
} from '@expo-google-fonts/sour-gummy';
import { useThemeStore } from '../store/useThemeStore';
import { AuthGateModal } from '../components/AuthGateModal';

export default function RootLayout() {
  const { isDark } = useThemeStore();

  const [fontsLoaded] = useFonts({
    'MV-Boli': require('../assets/fonts/mvboli.ttf'),
    'SourGummy-Regular': SourGummy_400Regular,
    'SourGummy-Medium': SourGummy_500Medium,
    'SourGummy-SemiBold': SourGummy_600SemiBold,
    'SourGummy-Bold': SourGummy_700Bold,
    'SourGummy-ExtraBold': SourGummy_800ExtraBold,
    'SourGummy-Black': SourGummy_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="wallpaper/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="upload-modal"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>

      {/* Global Auth Gate Interceptor Modal for Guests */}
      <AuthGateModal />
    </SafeAreaProvider>
  );
}
