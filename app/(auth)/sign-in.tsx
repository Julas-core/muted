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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/useAuthStore';
import { GoogleIcon } from '../../components/GoogleIcon';
import { SEED_WALLPAPERS } from '../../constants/seedWallpapers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Card dimensions for the 2×3 mosaic grid
const CARD_GAP = 8;
const GRID_PAD_H = 10;
const COL_WIDTH = (SCREEN_WIDTH - GRID_PAD_H * 2 - CARD_GAP) / 2;
const ROW_HEIGHT = (SCREEN_HEIGHT * 0.52) / 3;

// Collage images – pick visually striking ones from seed
const COLLAGE_IMAGES = [
  SEED_WALLPAPERS[6]?.url || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80', // car / cyberpunk
  SEED_WALLPAPERS[0]?.url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80', // cloud ape
  SEED_WALLPAPERS[3]?.url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80', // dark grain
  SEED_WALLPAPERS[7]?.url || 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&q=80', // oakley visor
  SEED_WALLPAPERS[9]?.url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80', // comic
  SEED_WALLPAPERS[2]?.url || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80', // tiger
];

// Each tile's slight rotation for the organic collage feel
const TILE_ROTATIONS = ['-4deg', '3deg', '-3deg', '2deg', '-2deg', '4deg'];

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, setGuestMode, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    setErrorMessage(null);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    const result = await signInWithEmail(email.trim());
    if (result.success) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
    } else {
      setErrorMessage(result.error || 'Failed to sign in. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    const result = await signInWithGoogle();
    if (result.success) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  const handleGuestBrowse = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    setGuestMode();
    router.replace('/(tabs)');
  };

  const handleCreateAccount = () => {
    Alert.alert(
      'Create Account',
      'Enter your email above and tap Continue to create your account instantly.',
      [{ text: 'Got it' }]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Solid light sky blue background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#A8D4FE' }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Top Collage Area ── */}
          <View style={styles.collageSection}>
            <View style={styles.collageGrid}>
              {COLLAGE_IMAGES.map((uri, idx) => {
                const row = Math.floor(idx / 2);
                const col = idx % 2;
                return (
                  <View
                    key={`tile-${idx}`}
                    style={[
                      styles.gridCard,
                      {
                        top: row * (ROW_HEIGHT + CARD_GAP),
                        left: col === 0 ? 0 : COL_WIDTH + CARD_GAP,
                        width: COL_WIDTH,
                        height: ROW_HEIGHT - (row === 0 ? 0 : 0),
                        transform: [{ rotate: TILE_ROTATIONS[idx] }],
                      },
                    ]}
                  >
                    <Image
                      source={{ uri }}
                      style={styles.cardImage}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                );
              })}
            </View>

            {/* "Muted" hand-lettered wordmark overlapping bottom of collage */}
            <View style={styles.wordmarkWrap}>
              {/* Black stroke outline via text shadow layers */}
              <Text style={[styles.wordmark, styles.wordmarkStroke,
                { textShadowOffset: { width: -2, height: -2 } }]}>Muted</Text>
              <Text style={[styles.wordmark, styles.wordmarkStroke,
                { textShadowOffset: { width: 2, height: -2 } }]}>Muted</Text>
              <Text style={[styles.wordmark, styles.wordmarkStroke,
                { textShadowOffset: { width: -2, height: 2 } }]}>Muted</Text>
              <Text style={[styles.wordmark, styles.wordmarkStroke,
                { textShadowOffset: { width: 2, height: 2 } }]}>Muted</Text>
              <Text style={[styles.wordmark, styles.wordmarkStroke,
                { textShadowOffset: { width: 0, height: -3 } }]}>Muted</Text>
              <Text style={[styles.wordmark, styles.wordmarkStroke,
                { textShadowOffset: { width: 0, height: 3 } }]}>Muted</Text>
              <Text style={[styles.wordmark, styles.wordmarkStroke,
                { textShadowOffset: { width: -3, height: 0 } }]}>Muted</Text>
              <Text style={[styles.wordmark, styles.wordmarkStroke,
                { textShadowOffset: { width: 3, height: 0 } }]}>Muted</Text>
              {/* White fill on top */}
              <Text style={[styles.wordmark, { color: '#FFFFFF' }]}>Muted</Text>
            </View>
          </View>

          {/* ── White form sheet ── */}
          <View style={styles.formSheet}>
            {/* Sign In header – italic bold */}
            <Text style={styles.signInLabel}>Sign In</Text>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email input – light rounded pill with stacked label */}
            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>Email</Text>
              <TextInput
                placeholder="Enter your email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(t) => { setEmail(t); if (errorMessage) setErrorMessage(null); }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.emailInput}
              />
            </View>

            {/* Black Continue button */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={isLoading}
              activeOpacity={0.85}
              style={styles.continueBtn}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.continueBtnText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Or divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Or</Text>
              <View style={styles.orLine} />
            </View>

            {/* Continue with Google – white outlined pill */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
              style={styles.googleBtn}
            >
              <GoogleIcon size={20} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Don't have an account? Create one */}
            <View style={styles.createRow}>
              <Text style={styles.createPrompt}>Don't have an account ?  </Text>
              <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.7}>
                <Text style={styles.createLink}>Create one</Text>
              </TouchableOpacity>
            </View>

            {/* Legal text */}
            <Text style={styles.legalText}>
              By Continuing you agree to Muted's{' '}
              <Text style={styles.legalLink}>Terms or Service</Text>
              {' '}and{'\n'}acknowledge that you've read our{'\n'}
              <Text style={styles.legalLink}>Privacy Policy.</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#A8D4FE',
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* ── Collage ── */
  collageSection: {
    height: SCREEN_HEIGHT * 0.56,
    position: 'relative',
    overflow: 'visible',
  },
  collageGrid: {
    position: 'absolute',
    top: 0,
    left: GRID_PAD_H,
    right: GRID_PAD_H,
    bottom: 60, // leave room for wordmark overlap
  },
  gridCard: {
    position: 'absolute',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  /* ── Wordmark ── */
  wordmarkWrap: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  wordmark: {
    fontFamily: 'MV-Boli',
    fontSize: 80,
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  wordmarkStroke: {
    position: 'absolute',
    color: '#000000',
    textShadowColor: '#000000',
    textShadowRadius: 0,
  },

  /* ── White form sheet ── */
  formSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    minHeight: SCREEN_HEIGHT * 0.44,
  },
  signInLabel: {
    fontSize: 20,
    fontFamily: 'SourGummy-Bold',
    fontStyle: 'italic',
    color: '#111827',
    marginBottom: 14,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontFamily: 'SourGummy-Medium',
    textAlign: 'center',
  },

  /* ── Email input ── */
  emailContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 14,
  },
  emailLabel: {
    fontSize: 11,
    fontFamily: 'SourGummy-Medium',
    color: '#6B7280',
    marginBottom: 2,
  },
  emailInput: {
    fontSize: 17,
    fontFamily: 'SourGummy-Regular',
    color: '#111827',
    paddingVertical: 0,
    height: 26,
  },

  /* ── Continue button ── */
  continueBtn: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'SourGummy-Bold',
  },

  /* ── Or divider ── */
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D1D5DB',
  },
  orText: {
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'SourGummy-Medium',
    color: '#6B7280',
  },

  /* ── Google button ── */
  googleBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  googleBtnText: {
    color: '#111827',
    fontSize: 15,
    fontFamily: 'SourGummy-Bold',
    marginLeft: 10,
  },

  /* ── Create account ── */
  createRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  createPrompt: {
    fontSize: 13,
    fontFamily: 'SourGummy-Regular',
    color: '#374151',
  },
  createLink: {
    fontSize: 13,
    fontFamily: 'SourGummy-Bold',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },

  /* ── Legal ── */
  legalText: {
    fontSize: 12,
    fontFamily: 'SourGummy-Regular',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 24,
    paddingHorizontal: 8,
  },
  legalLink: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
});
