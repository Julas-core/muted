import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  Maximize2,
  Download,
  MoreHorizontal,
  Check,
  Share2,
  Copy,
  User,
  Flag,
  Lock,
  Flashlight,
  Camera,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useWallpaperStore } from '../../store/useWallpaperStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { NotificationModal } from '../../components/NotificationModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PreviewMode = 'normal' | 'clean' | 'lockscreen' | 'homescreen';

export default function WallpaperDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { wallpapers, favorites, toggleFavorite, recordDownload, downloads } = useWallpaperStore();
  const { isGuest, openAuthModal } = useAuthStore();
  const { colors } = useThemeStore();

  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('normal');
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isNotificationPromptOpen, setIsNotificationPromptOpen] = useState(false);

  // Time state for realistic Lock Screen overlay
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const wallpaper = wallpapers.find((w) => w.id === id) || wallpapers[0];
  const isFavorite = favorites.includes(wallpaper.id);

  // Spring animations
  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    router.back();
  };

  const handleFavorite = () => {
    if (isGuest) {
      openAuthModal('Sign in to favorite and save wallpapers');
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}

    // Bouncy pop animation
    Animated.sequence([
      Animated.timing(heartScaleAnim, {
        toValue: 1.45,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(heartScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    toggleFavorite(wallpaper.id);
  };

  const handleCyclePreview = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}

    setPreviewMode((prev) => {
      switch (prev) {
        case 'normal':
          return 'clean';
        case 'clean':
          return 'lockscreen';
        case 'lockscreen':
          return 'homescreen';
        case 'homescreen':
          return 'normal';
      }
    });
  };

  const handleDownload = async () => {
    if (isGuest) {
      openAuthModal('Sign in to download 4K wallpapers to your gallery');
      return;
    }

    try {
      setDownloading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (Platform.OS !== 'web') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const destination = new File(Paths.document, `${wallpaper.id}.jpg`);
          const downloadRes = await File.downloadFileAsync(wallpaper.url, destination);
          await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
        }
      }

      recordDownload(wallpaper.id);
      setDownloading(false);
      setDownloaded(true);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Trigger notification permission modal if this is the first download
      if (downloads.length === 0) {
        setTimeout(() => {
          setIsNotificationPromptOpen(true);
        }, 1200);
      }

      setTimeout(() => {
        setDownloaded(false);
      }, 3000);
    } catch (err) {
      setDownloading(false);
      Alert.alert('Download Completed', 'Wallpaper saved to your device collection.');
      recordDownload(wallpaper.id);
    }
  };

  const handleShare = async () => {
    setIsActionSheetOpen(false);
    try {
      if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(wallpaper.url);
      } else {
        Alert.alert('Share', `Check out "${wallpaper.title}" on Muted!\n${wallpaper.url}`);
      }
    } catch (_) {}
  };

  const formattedHours = currentTime.getHours().toString().padStart(2, '0');
  const formattedMinutes = currentTime.getMinutes().toString().padStart(2, '0');
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Tap anywhere during clean / preview modes to return to normal */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => previewMode !== 'normal' && setPreviewMode('normal')}
        style={StyleSheet.absoluteFill}
      >
        {/* Full-bleed Wallpaper Image */}
        <Image
          source={{ uri: wallpaper.url }}
          style={styles.fullImage}
          contentFit="cover"
          priority="high"
        />
      </TouchableOpacity>

      {/* Mode 1: Normal View Top Floating Action Bar */}
      {previewMode === 'normal' && (
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            style={styles.circleButton}
          >
            <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.topRightRow}>
            <TouchableOpacity
              onPress={handleFavorite}
              activeOpacity={0.7}
              style={[
                styles.circleButton,
                isFavorite && { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
              ]}
            >
              <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                <Heart
                  size={20}
                  color={isFavorite ? colors.heartActive : '#FFFFFF'}
                  fill={isFavorite ? colors.heartActive : 'transparent'}
                  strokeWidth={2}
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCyclePreview}
              activeOpacity={0.7}
              style={[styles.circleButton, { marginLeft: 10 }]}
            >
              <Maximize2 size={20} color="#FFFFFF" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* Mode 2: Clean View Hint */}
      {previewMode === 'clean' && (
        <View style={styles.previewModeBadge}>
          <Text style={styles.previewModeBadgeText}>Clean View • Tap to cycle</Text>
        </View>
      )}

      {/* Mode 3: Realistic Lock Screen Overlay */}
      {previewMode === 'lockscreen' && (
        <SafeAreaView style={styles.lockScreenOverlay} pointerEvents="box-none">
          <View style={styles.lockHeader}>
            <Lock size={18} color="#FFFFFF" />
          </View>

          <View style={styles.clockContainer}>
            <Text style={styles.lockDateText}>{formattedDate}</Text>
            <Text style={styles.lockTimeText}>
              {formattedHours}:{formattedMinutes}
            </Text>
          </View>

          <View style={styles.lockFooter}>
            <View style={styles.lockIconCircle}>
              <Flashlight size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.lockSwipeHint}>Swipe up to unlock</Text>
            <View style={styles.lockIconCircle}>
              <Camera size={22} color="#FFFFFF" />
            </View>
          </View>
        </SafeAreaView>
      )}

      {/* Mode 4: Realistic Home Screen Overlay */}
      {previewMode === 'homescreen' && (
        <SafeAreaView style={styles.homeScreenOverlay} pointerEvents="box-none">
          <View style={styles.appGrid}>
            {[
              { name: 'Photos', color: '#38BDF8' },
              { name: 'Camera', color: '#94A3B8' },
              { name: 'Music', color: '#FB7185' },
              { name: 'Notes', color: '#FBBF24' },
              { name: 'Mail', color: '#60A5FA' },
              { name: 'Safari', color: '#3B82F6' },
              { name: 'Settings', color: '#64748B' },
              { name: 'Muted', color: '#0D5DFE' },
            ].map((app, i) => (
              <View key={i} style={styles.appItem}>
                <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                  <Text style={styles.appIconLetter}>{app.name[0]}</Text>
                </View>
                <Text style={styles.appName}>{app.name}</Text>
              </View>
            ))}
          </View>

          {/* Bottom Dock */}
          <View style={styles.dockWrapper}>
            <BlurView intensity={70} tint="light" style={styles.dock}>
              {['Phone', 'Messages', 'Browser', 'Music'].map((name, i) => (
                <View key={i} style={[styles.dockIcon, { backgroundColor: 'rgba(255,255,255,0.85)' }]} />
              ))}
            </BlurView>
          </View>
        </SafeAreaView>
      )}

      {/* Bottom Sheet Card matching Screen 12 (Shown in normal mode) */}
      {previewMode === 'normal' && (
        <View style={styles.bottomSheetWrapper}>
          <View style={[styles.bottomSheetContainer, { borderColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 75 : 100}
              tint="dark"
              style={styles.blurView}
            >
              <View style={styles.sheetContent}>
                {/* Creator Info Row */}
                <View style={styles.creatorRow}>
                  <View style={styles.creatorInfo}>
                    <Image
                      source={{ uri: wallpaper.authorAvatar }}
                      style={styles.creatorAvatar}
                    />
                    <View style={styles.creatorTextCol}>
                      <Text style={styles.wallpaperTitle}>{wallpaper.title}</Text>
                      <Text style={styles.creatorName}>by {wallpaper.author}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setIsActionSheetOpen(true)}
                    activeOpacity={0.7}
                    style={styles.moreButton}
                  >
                    <MoreHorizontal size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Set as Wallpaper / Download Button */}
                <TouchableOpacity
                  onPress={handleDownload}
                  activeOpacity={0.85}
                  disabled={downloading}
                  style={[
                    styles.downloadButton,
                    {
                      backgroundColor: downloaded ? '#10B981' : '#000000',
                    },
                  ]}
                >
                  <Text style={styles.downloadButtonText}>
                    {downloaded
                      ? 'Saved to Gallery!'
                      : downloading
                      ? 'Saving 4K Image...'
                      : 'Set as Wallpaper'}
                  </Text>
                  <View style={styles.downloadIconCircle}>
                    {downloaded ? (
                      <Check size={18} color="#000000" strokeWidth={3} />
                    ) : (
                      <Download size={18} color="#000000" strokeWidth={2.5} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </View>
      )}

      {/* Three-Dots Quick Action Sheet */}
      <Modal
        visible={isActionSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsActionSheetOpen(false)}
      >
        <View style={styles.actionBackdrop}>
          <TouchableOpacity
            style={styles.dismissArea}
            activeOpacity={1}
            onPress={() => setIsActionSheetOpen(false)}
          />

          <View style={styles.actionSheetContainer}>
            <BlurView intensity={90} tint="dark" style={styles.actionBlur}>
              <View style={styles.actionContent}>
                <View style={styles.actionHeader}>
                  <Text style={styles.actionSheetTitle}>Wallpaper Options</Text>
                  <TouchableOpacity onPress={() => setIsActionSheetOpen(false)} style={{ padding: 4 }}>
                    <X size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleShare} style={styles.actionItem}>
                  <Share2 size={20} color="#FFFFFF" />
                  <Text style={styles.actionItemText}>Share Wallpaper</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsActionSheetOpen(false);
                    Alert.alert('Link Copied', '4K image link copied to clipboard.');
                  }}
                  style={styles.actionItem}
                >
                  <Copy size={20} color="#FFFFFF" />
                  <Text style={styles.actionItemText}>Copy 4K Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsActionSheetOpen(false);
                    router.push('/(tabs)/explore');
                  }}
                  style={styles.actionItem}
                >
                  <User size={20} color="#FFFFFF" />
                  <Text style={styles.actionItemText}>View Creator's Drops</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsActionSheetOpen(false);
                    Alert.alert('Report Submitted', 'Thank you for keeping Muted safe.');
                  }}
                  style={[styles.actionItem, { borderBottomWidth: 0 }]}
                >
                  <Flag size={20} color="#EF4444" />
                  <Text style={[styles.actionItemText, { color: '#EF4444' }]}>Report Content</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </View>
      </Modal>

      {/* Notification Modal on First Download */}
      <NotificationModal
        visible={isNotificationPromptOpen}
        onAllow={() => setIsNotificationPromptOpen(false)}
        onSkip={() => setIsNotificationPromptOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 6,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewModeBadge: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewModeBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'SourGummy-Bold',
    fontSize: 13,
  },
  lockScreenOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 24,
  },
  lockHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  clockContainer: {
    alignItems: 'center',
    marginTop: -80,
  },
  lockDateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  lockTimeText: {
    color: '#FFFFFF',
    fontSize: 88,
    fontWeight: '200',
    letterSpacing: -2,
    lineHeight: 92,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  lockFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  lockIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockSwipeHint: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  homeScreenOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  appItem: {
    width: (SCREEN_WIDTH - 80) / 4,
    alignItems: 'center',
    marginBottom: 24,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  appIconLetter: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dockWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  dock: {
    width: '100%',
    height: 80,
    borderRadius: 32,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dockIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
  },
  bottomSheetWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  bottomSheetContainer: {
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  blurView: {
    width: '100%',
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 12,
  },
  creatorTextCol: {
    flex: 1,
  },
  wallpaperTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'SourGummy-Black',
    letterSpacing: -0.3,
  },
  creatorName: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontFamily: 'SourGummy-Medium',
    marginTop: 2,
  },
  moreButton: {
    padding: 6,
  },
  downloadButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'SourGummy-Bold',
    letterSpacing: -0.2,
  },
  downloadIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  actionSheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionBlur: {
    width: '100%',
  },
  actionContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 42 : 28,
    backgroundColor: 'rgba(18, 18, 18, 0.92)',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionSheetTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'SourGummy-Black',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionItemText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'SourGummy-Bold',
    marginLeft: 14,
  },
});
