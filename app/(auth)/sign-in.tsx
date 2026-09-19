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
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/useAuthStore';
import { GoogleIcon } from '../../components/GoogleIcon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// The cropped header image is 440 x 585 (from collage top down to just below 'Muted' wordmark)
const HEADER_ASPECT_RATIO = 585 / 440;
const HEADER_HEIGHT = SCREEN_WIDTH * HEADER_ASPECT_RATIO;

export default function SignInScreen() {
  const { signInWithEmail, signInWithGoogle, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    setErrorMessage(null);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}

    const result = await signInWithEmail(email.trim());
    if (result.success) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    } else {
      setErrorMessage(result.error || 'Failed to sign in. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}

    const result = await signInWithGoogle();
    if (result.success) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  const handleCreateAccount = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    Alert.alert(
      'Create Account',
      'Enter your email in the box above and tap Continue to create your account instantly.',
      [{ text: 'Got it' }]
    );
  };

  const handleTerms = () => {
    Alert.alert('Terms of Service', 'Terms of Service for Muted.');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy Policy', 'Privacy Policy for Muted.');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header image: Collage + Muted display wordmark cropped from design */}
          <Image
            source={require('../../assets/images/signin-header.png')}
            style={{ width: SCREEN_WIDTH, height: HEADER_HEIGHT }}
            contentFit="cover"
          />

          {/* This gradient begins at the exact final pixel of the header crop. */}
          <LinearGradient
            colors={['#97BEF7', '#E8F0FD']}
            style={[styles.formBackground, { minHeight: SCREEN_HEIGHT - HEADER_HEIGHT }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            {/* Form controls below wordmark */}
            <View style={styles.formContainer}>
              <Text style={styles.signInLabel}>Sign In</Text>

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

            {/* Light rounded pill with stacked 'Email' label + input */}
            <View style={styles.emailPill}>
              <Text style={styles.emailSubLabel}>Email</Text>
              <TextInput
                accessibilityLabel="Email address"
                placeholder="Enter your email address"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.emailInput}
              />
            </View>

            {/* Black Continue pill button */}
            <TouchableOpacity
              accessibilityLabel="Continue with email"
              onPress={handleContinue}
              disabled={isLoading}
              activeOpacity={0.85}
              style={styles.continueButton}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Or Divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Or</Text>
              <View style={styles.orLine} />
            </View>

            {/* White Continue with Google button with blue border */}
            <TouchableOpacity
              accessibilityLabel="Continue with Google"
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
              style={styles.googleButton}
            >
              <GoogleIcon size={20} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Don't have an account ? Create one */}
            <View style={styles.createAccountRow}>
              <Text style={styles.dontHaveAccountText}>Don't have an account ? </Text>
              <TouchableOpacity
                accessibilityLabel="Create an account"
                onPress={handleCreateAccount}
                activeOpacity={0.7}
              >
                <Text style={styles.createOneLink}>Create one</Text>
              </TouchableOpacity>
            </View>

            {/* Legal terms & privacy notice */}
            <Text style={styles.legalNotice}>
              By Continuing you agree to Muted's{' '}
              <Text onPress={handleTerms} style={styles.legalLink}>
                Terms or Service
              </Text>
              {' '}and{'\n'}acknowledge that you've read our{'\n'}
              <Text onPress={handlePrivacy} style={styles.legalLink}>
                Privacy Policy.
              </Text>
            </Text>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#97BEF7',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formBackground: {
    flexGrow: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  signInLabel: {
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 4,
    marginLeft: 20,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  emailPill: {
    height: 50,
    backgroundColor: '#EDF4FE',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingTop: 5,
    marginBottom: 22,
  },
  emailSubLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#4B5563',
    marginBottom: 0,
  },
  emailInput: {
    fontSize: 21,
    color: '#111827',
    paddingVertical: 0,
    height: 27,
    fontWeight: '400',
  },
  continueButton: {
    backgroundColor: '#000000',
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 48,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
    opacity: 0.7,
  },
  orText: {
    paddingHorizontal: 24,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '400',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    height: 38,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 9,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  googleButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 10,
  },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  dontHaveAccountText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '400',
  },
  createOneLink: {
    fontSize: 14,
    color: '#1D70E2',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalNotice: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 28,
    marginHorizontal: -14,
    paddingHorizontal: 0,
    fontWeight: '400',
  },
  legalLink: {
    color: '#1D70E2',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
