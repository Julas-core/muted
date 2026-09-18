import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Mail } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { BrandLogo } from './BrandLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const AuthGateModal: React.FC = () => {
  const { isAuthModalOpen, authModalReason, closeAuthModal, signIn } = useAuthStore();
  const { colors, isDark } = useThemeStore();
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    if (!email.trim()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
    signIn(email.trim());
    setEmail('');
  };

  const handleGoogleSignIn = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
    signIn('google_user@muted.app', 'Google Explorer');
  };

  return (
    <Modal
      visible={isAuthModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closeAuthModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={closeAuthModal}
        />

        <View style={[styles.sheetContainer, { borderColor: colors.border }]}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 85 : 100}
            tint={isDark ? 'dark' : 'light'}
            style={styles.blur}
          >
            <View
              style={[
                styles.sheetContent,
                { backgroundColor: isDark ? 'rgba(18, 18, 18, 0.88)' : 'rgba(255, 255, 255, 0.92)' },
              ]}
            >
              {/* Close Button */}
              <TouchableOpacity
                onPress={closeAuthModal}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={20} color={isDark ? '#A1A1AA' : '#64748B'} />
              </TouchableOpacity>

              {/* Logo & Headline */}
              <View style={styles.header}>
                <BrandLogo variant="full" size={42} color={isDark ? '#FFFFFF' : '#0D5DFE'} />
                <Text style={[styles.title, { color: colors.text }]}>Sign In</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  {authModalReason}
                </Text>
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: isDark ? '#A1A1AA' : '#475569' }]}>
                  Email
                </Text>
                <View
                  style={[
                    styles.inputFieldContainer,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Mail size={18} color={isDark ? '#A1A1AA' : '#94A3B8'} style={styles.mailIcon} />
                  <TextInput
                    placeholder="Enter your email address"
                    placeholderTextColor={isDark ? '#71717A' : '#94A3B8'}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                onPress={handleContinue}
                activeOpacity={0.85}
                style={[styles.continueButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>Or</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Google Button */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                activeOpacity={0.85}
                style={[
                  styles.googleButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={styles.googleIconText}>G</Text>
                <Text style={[styles.googleButtonText, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>
                  Continue with Google
                </Text>
              </TouchableOpacity>

              {/* Guest Dismiss link */}
              <TouchableOpacity
                onPress={closeAuthModal}
                style={styles.guestLink}
                activeOpacity={0.7}
              >
                <Text style={[styles.guestLinkText, { color: colors.primary }]}>
                  Continue browsing as Guest
                </Text>
              </TouchableOpacity>

              {/* Terms */}
              <Text style={[styles.legalText, { color: colors.textMuted }]}>
                By continuing you agree to Muted's{' '}
                <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
                  Terms of Service
                </Text>{' '}
                and acknowledge our{' '}
                <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  blur: {},
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'SourGummy-Black',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'SourGummy-Medium',
    marginTop: 4,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'SourGummy-Bold',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  mailIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'SourGummy-Medium',
    height: '100%',
  },
  continueButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'SourGummy-Bold',
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
    fontFamily: 'SourGummy-Bold',
  },
  googleButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  googleIconText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontFamily: 'SourGummy-Bold',
  },
  guestLink: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  guestLinkText: {
    fontSize: 14,
    fontFamily: 'SourGummy-Bold',
  },
  legalText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
