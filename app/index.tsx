import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/useThemeStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { colors, isDark } = useThemeStore();

  // Spin animation for background gradient (responsive, fluid speed)
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Fade & slide animation for the tagline text
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(24)).current;

  // Pulse animation for the central logo
  const logoScaleAnim = useRef(new Animated.Value(0.92)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Continuous fluid rotation for background gradient
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2600, // brisk, energetic pace so user knows it's actively loading
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinLoop.start();

    // 2. Logo entrance
    Animated.parallel([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Smooth entrance for "a feed built around your taste"
    const textTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 1100);

    // 4. Auto-transition to Onboarding after animation showcase
    const navigateTimer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 3200);

    return () => {
      spinLoop.stop();
      clearTimeout(textTimer);
      clearTimeout(navigateTimer);
    };
  }, []);

  const handleSkip = () => {
    router.replace('/(auth)/onboarding');
  };

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleSkip}
      style={styles.container}
    >
      {/* Dynamic Spinning Gradient Background */}
      <Animated.View
        style={[
          styles.spinningGradientContainer,
          { transform: [{ rotate: spinInterpolation }] },
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ['#FF001E', '#7F000A', '#1A0003', '#99000C', '#E50914']
              : ['#0D5DFE', '#3B82F6', '#93C5FD', '#1D4ED8', '#60A5FA']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fullGradient}
        />
      </Animated.View>

      {/* Subtle darkening vignette overlay */}
      <View
        style={[
          styles.vignetteOverlay,
          {
            backgroundColor: isDark
              ? 'rgba(0, 0, 0, 0.45)'
              : 'rgba(13, 93, 254, 0.15)',
          },
        ]}
      />

      {/* Center Branding Content */}
      <View style={styles.centerContent}>
        {/* Animated Central M Logo */}
        <Animated.View
          style={{
            opacity: logoFadeAnim,
            transform: [{ scale: logoScaleAnim }],
          }}
        >
          <Text style={styles.scriptLetterLogo}>M</Text>
        </Animated.View>

        {/* Animated Tagline */}
        <Animated.View
          style={[
            styles.taglineWrapper,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.taglineText}>
            a wallpaper feed built{'\n'}around your taste
          </Text>
        </Animated.View>
      </View>

      {/* Skip indicator */}
      <View style={styles.footerHint}>
        <Text style={styles.hintText}>tap anywhere to enter</Text>
      </View>
    </TouchableOpacity>
  );
}

const GRADIENT_SIZE = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 1.8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D5DFE',
    overflow: 'hidden',
  },
  spinningGradientContainer: {
    position: 'absolute',
    width: GRADIENT_SIZE,
    height: GRADIENT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullGradient: {
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFill,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  scriptLetterLogo: {
    fontSize: 140,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: -6,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 18,
    textAlign: 'center',
  },
  taglineWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  taglineText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  footerHint: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
