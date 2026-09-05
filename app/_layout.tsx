import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/useThemeStore';
import { AuthGateModal } from '../components/AuthGateModal';

export default function RootLayout() {
  const { isDark } = useThemeStore();

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
