import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { BrandLogo } from '../../components/BrandLogo';
import { SEED_WALLPAPERS } from '../../constants/seedWallpapers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, setGuestMode } = useAuthStore();
  const { colors, isDark } = useThemeStore();
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    if (!email.trim()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
    signIn(email.trim());
    router.replace('/(tabs)');
  };

  const handleGoogleSignIn = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
    signIn('google_user@muted.app', 'Google Explorer');
    router.replace('/(tabs)');
  };

  const handleGuestBrowse = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    setGuestMode();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Top Wallpaper Collage matching Screen 2 */}
            <View style={styles.collageContainer}>
              <View style={[styles.collageCard, styles.cardLeft]}>
                <Image
                  source={{ uri: SEED_WALLPAPERS[1].url }}
                  style={styles.collageImage}
                  contentFit="cover"
                />
              </View>
              <View style={[styles.collageCard, styles.cardCenter]}>
                <Image
                  source={{ uri: SEED_WALLPAPERS[0].url }}
                  style={styles.collageImage}
                  contentFit="cover"
                />
              </View>
              <View style={[styles.collageCard, styles.cardRight]}>
                <Image
                  source={{ uri: SEED_WALLPAPERS[2].url }}
                  style={styles.collageImage}
                  contentFit="cover"
                />
              </View>

              {/* Muted Script Wordmark overlay */}
              <View style={styles.logoOverlay}>
                <BrandLogo variant="full" size={68} color="#FFFFFF" />
              </View>
            </View>

            {/* Bottom Form Sheet matching Screen 2 */}
            <View style={styles.formContainer}>
              <Text style={[styles.signInTitle, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>
                Sign In
              </Text>

              {/* Email Input Field */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: isDark ? '#A1A1AA' : '#64748B' }]}>
                  Email
                </Text>
                <TextInput
                  placeholder="Enter your email address"
                  placeholderTextColor={isDark ? '#71717A' : '#94A3B8'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              {/* Continue Pill Button */}
              <TouchableOpacity
                onPress={handleContinue}
                activeOpacity={0.85}
                style={[styles.continueButton, { backgroundColor: '#000000' }]}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>

              {/* Or Divider */}
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]} />
                <Text style={[styles.dividerText, { color: isDark ? '#A1A1AA' : '#475569' }]}>
                  Or
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]} />
              </View>

              {/* Continue with Google */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                activeOpacity={0.85}
                style={[
                  styles.googleButton,
                  {
                    backgroundColor: '#FFFFFF',
                    borderColor: isDark ? 'transparent' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={styles.googleIconText}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Switch to Create One */}
              <View style={styles.footerRow}>
                <Text style={[styles.footerPrompt, { color: isDark ? '#A1A1AA' : '#475569' }]}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                  <Text style={[styles.footerLink, { color: colors.primary }]}>Create one</Text>
                </TouchableOpacity>
              </View>

              {/* Guest Explore Link */}
              <TouchableOpacity
                onPress={handleGuestBrowse}
                activeOpacity={0.7}
                style={styles.guestLink}
              >
                <Text style={[styles.guestLinkText, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>
                  Browse as Guest →
                </Text>
              </TouchableOpacity>

              {/* Legal Disclaimer */}
              <Text style={[styles.legalText, { color: isDark ? '#A1A1AA' : '#64748B' }]}>
                By Continuing you agree to Muted's{' '}
                <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
                  Terms or Service
                </Text>{' '}
                and acknowledge that you've read our{' '}
                <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  collageContainer: {
    height: SCREEN_WIDTH * 0.85,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collageCard: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.45,
    height: SCREEN_WIDTH * 0.65,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  cardLeft: {
    transform: [{ rotate: '-12deg' }, { translateX: -80 }, { translateY: -10 }],
  },
  cardCenter: {
    zIndex: 2,
    transform: [{ translateY: -20 }],
  },
  cardRight: {
    transform: [{ rotate: '12deg' }, { translateX: 80 }, { translateY: -10 }],
  },
  collageImage: {
    width: '100%',
    height: '100%',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: 16,
    zIndex: 5,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  signInTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    fontSize: 15,
    borderWidth: 1,
  },
  continueButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  googleIconText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerPrompt: {
    fontSize: 13,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  guestLink: {
    alignItems: 'center',
    marginTop: 14,
  },
  guestLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  legalText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
});
