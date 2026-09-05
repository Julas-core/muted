import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Edit2, LogOut, Sun, Moon, Plus, LogIn } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useWallpaperStore } from '../../store/useWallpaperStore';
import { WallpaperCard } from '../../components/WallpaperCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 44) / 2;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isGuest, signOut, openAuthModal } = useAuthStore();
  const { colors, isDark, toggleTheme } = useThemeStore();
  const { wallpapers, favorites, downloads } = useWallpaperStore();

  const [activeTab, setActiveTab] = useState<'favorites' | 'downloads' | 'collections'>('favorites');

  const displayedWallpapers = useMemo(() => {
    if (activeTab === 'favorites') {
      return wallpapers.filter((w) => favorites.includes(w.id));
    }
    if (activeTab === 'downloads') {
      return wallpapers.filter((w) => downloads.includes(w.id));
    }
    // collections (v1 shows favorites)
    return wallpapers.filter((w) => favorites.includes(w.id));
  }, [activeTab, wallpapers, favorites, downloads]);

  // Dual column layout
  const { colLeft, colRight } = useMemo(() => {
    const left: typeof displayedWallpapers = [];
    const right: typeof displayedWallpapers = [];
    let leftH = 0;
    let rightH = 0;

    displayedWallpapers.forEach((item) => {
      const h = COLUMN_WIDTH * item.heightRatio;
      if (leftH <= rightH) {
        left.push(item);
        leftH += h;
      } else {
        right.push(item);
        rightH += h;
      }
    });

    return { colLeft: left, colRight: right };
  }, [displayedWallpapers]);

  const handleTabChange = (tab: 'favorites' | 'downloads' | 'collections') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    setActiveTab(tab);
  };

  const handleToggleTheme = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
    toggleTheme();
  };

  const handleUploadPress = () => {
    if (isGuest) {
      openAuthModal('Sign in to upload and share wallpapers with the community');
      return;
    }
    router.push('/upload-modal');
  };

  const handleSignOutOrIn = () => {
    if (isGuest) {
      openAuthModal('Sign in to your Muted account');
    } else {
      signOut();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Actions: Theme toggle & Sign In/Out */}
          <View style={styles.topActionsRow}>
            <TouchableOpacity
              onPress={handleToggleTheme}
              activeOpacity={0.7}
              style={[
                styles.iconButton,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
              ]}
            >
              {isDark ? <Sun size={20} color="#FBBF24" /> : <Moon size={20} color="#0B2050" />}
            </TouchableOpacity>

            <View style={styles.rightButtonsRow}>
              <TouchableOpacity
                onPress={handleUploadPress}
                activeOpacity={0.7}
                style={[
                  styles.uploadPill,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={3} />
                <Text style={styles.uploadPillText}>Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSignOutOrIn}
                activeOpacity={0.7}
                style={[
                  styles.iconButton,
                  { backgroundColor: isDark ? 'rgba(229, 9, 20, 0.2)' : 'rgba(239, 68, 68, 0.15)' },
                ]}
              >
                {isGuest ? (
                  <LogIn size={20} color={colors.primary} />
                ) : (
                  <LogOut size={20} color="#EF4444" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Avatar with Edit Badge matching screens 11 & 15 */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user?.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
              <TouchableOpacity activeOpacity={0.8} style={styles.editBadge}>
                <Edit2 size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {user?.name}
            </Text>
            <Text style={[styles.userEmail, { color: isDark ? '#A1A1AA' : '#64748B' }]}>
              {isGuest ? 'Browse Mode • Tap to Sign In' : user?.email}
            </Text>
          </View>

          {/* Stats Row matching screens 11 & 15 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {favorites.length * 12 + 10}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A1A1AA' : '#64748B' }]}>
                saved
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {downloads.length * 8 + 4}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A1A1AA' : '#64748B' }]}>
                downloads
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                12
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A1A1AA' : '#64748B' }]}>
                collections
              </Text>
            </View>
          </View>

          {/* Segmented Tab Row matching screens 11 & 15 */}
          <View style={styles.tabsRow}>
            {(['favorites', 'downloads', 'collections'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => handleTabChange(tab)}
                  activeOpacity={0.7}
                  style={[
                    styles.tabPill,
                    isActive && [
                      styles.tabPillActive,
                      {
                        backgroundColor: isDark
                          ? 'rgba(229, 9, 20, 0.25)'
                          : 'rgba(13, 93, 254, 0.18)',
                        borderColor: colors.primary,
                      },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.tabPillText,
                      {
                        color: isActive ? colors.primary : isDark ? '#A1A1AA' : '#64748B',
                        fontWeight: isActive ? '700' : '600',
                      },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dual Column Wallpaper Grid */}
          {displayedWallpapers.length === 0 ? (
            <View style={styles.emptyGrid}>
              <Text style={[styles.emptyGridTitle, { color: colors.text }]}>No items yet</Text>
              <Text style={[styles.emptyGridSubtitle, { color: colors.textMuted }]}>
                Wallpapers you {activeTab} will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.masonryContainer}>
              <View style={styles.column}>
                {colLeft.map((item) => (
                  <WallpaperCard key={item.id} wallpaper={item} width={COLUMN_WIDTH} />
                ))}
              </View>
              <View style={styles.column}>
                {colRight.map((item) => (
                  <WallpaperCard key={item.id} wallpaper={item} width={COLUMN_WIDTH} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rightButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  uploadPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0D5DFE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 13,
    marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabPillActive: {},
  tabPillText: {
    fontSize: 13,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
  },
  emptyGrid: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyGridTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyGridSubtitle: {
    fontSize: 13,
  },
});
