import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../store/useThemeStore';

interface NotificationModalProps {
  visible: boolean;
  onAllow: () => void;
  onSkip: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onAllow,
  onSkip,
}) => {
  const { colors, isDark } = useThemeStore();

  const handleAllow = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
    onAllow();
  };

  const handleSkip = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    onSkip();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View style={[styles.cardContainer, { borderColor: colors.border }]}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 85 : 100}
            tint={isDark ? 'dark' : 'light'}
            style={styles.blur}
          >
            <View
              style={[
                styles.content,
                {
                  backgroundColor: isDark
                    ? 'rgba(18, 18, 18, 0.92)'
                    : 'rgba(255, 255, 255, 0.94)',
                },
              ]}
            >
              {/* Soundwave Bell Icon matching Screen 7 */}
              <View style={styles.bellWrapper}>
                {/* Left soundwave arc */}
                <View style={[styles.soundwaveLeft, { borderColor: colors.text }]} />

                {/* Center Bell */}
                <View style={[styles.bellCircle, { backgroundColor: isDark ? '#27272A' : '#F1F5F9' }]}>
                  <Bell size={52} color={colors.text} strokeWidth={2.2} />
                </View>

                {/* Right soundwave arc */}
                <View style={[styles.soundwaveRight, { borderColor: colors.text }]} />
              </View>

              {/* Headline matching Screen 7 */}
              <Text style={[styles.title, { color: colors.text }]}>
                Turn on notifications{'\n'}so that you don't miss{'\n'}new wallpapers
              </Text>

              {/* Allow Button */}
              <TouchableOpacity
                onPress={handleAllow}
                activeOpacity={0.85}
                style={[styles.allowButton, { backgroundColor: '#000000' }]}
              >
                <Text style={styles.allowButtonText}>Allow</Text>
              </TouchableOpacity>

              {/* Skip Button */}
              <TouchableOpacity
                onPress={handleSkip}
                activeOpacity={0.7}
                style={[
                  styles.skipButton,
                  {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',
                  },
                ]}
              >
                <Text style={[styles.skipButtonText, { color: colors.text }]}>Skip</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  blur: {
    width: '100%',
  },
  content: {
    paddingHorizontal: 26,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
  },
  bellWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    height: 100,
    width: 140,
    position: 'relative',
  },
  bellCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  soundwaveLeft: {
    position: 'absolute',
    left: 2,
    top: 18,
    width: 24,
    height: 54,
    borderLeftWidth: 4,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
  },
  soundwaveRight: {
    position: 'absolute',
    right: 2,
    top: 18,
    width: 24,
    height: 54,
    borderRightWidth: 4,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 22,
    fontFamily: 'SourGummy-Black',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 28,
    letterSpacing: -0.3,
  },
  allowButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  allowButtonText: {
    color: '#FFFFFF',
    fontFamily: 'SourGummy-Bold',
    fontSize: 17,
  },
  skipButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  skipButtonText: {
    fontFamily: 'SourGummy-Bold',
    fontSize: 17,
  },
});
