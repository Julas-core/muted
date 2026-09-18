import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
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
import { useAuthStore } from '../store/useAuthStore';
import { AuthGateModal } from '../components/AuthGateModal';

function RootSessionHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { user, isGuest, isInitialized, initSessionListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initSessionListener();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const segs = (segments as unknown as string[]) || [];
    const isSignIn = segs.includes('sign-in');
    const isOnboarding = segs.includes('onboarding');
    const isSplash = segs.length === 0 || segs.includes('index');

    // 1. If guest user, allow exploring tabs or flows
    if (isGuest) {
      return;
    }

    // 2. If no session exists -> navigate to SignIn
    if (!user) {
      if (!isSignIn) {
        router.replace('/(auth)/sign-in');
      }
      return;
    }

    // 3. If session exists but profiles.onboarding_complete is false or missing ->
    // onboarding flow starting at Splash
    if (!user.onboarding_complete) {
      if (!isSplash && !isOnboarding) {
        router.replace('/');
      }
      return;
    }

    // 4. If session exists and onboarding_complete is true -> main tabs
    if (user.onboarding_complete) {
      if (isSignIn || isSplash || isOnboarding) {
        router.replace('/(tabs)');
      }
    }
  }, [user, isGuest, isInitialized, segments]);

  return <>{children}</>;
}

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
      <RootSessionHandler>
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
      </RootSessionHandler>
    </SafeAreaProvider>
  );
}
