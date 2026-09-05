import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Wallpaper } from '../constants/seedWallpapers';
import { useWallpaperStore } from '../store/useWallpaperStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  width?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

export const WallpaperCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  width = DEFAULT_CARD_WIDTH,
}) => {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { favorites, toggleFavorite } = useWallpaperStore();
  const { isGuest, openAuthModal } = useAuthStore();

  const isFavorite = favorites.includes(wallpaper.id);
  const cardHeight = width * wallpaper.heightRatio;

  const handlePressCard = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    router.push(`/wallpaper/${wallpaper.id}`);
  };

  const handlePressHeart = () => {
    if (isGuest) {
      openAuthModal('Sign in to save wallpapers to your favorites');
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
    toggleFavorite(wallpaper.id);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePressCard}
      style={[
        styles.cardContainer,
        {
          width,
          height: cardHeight,
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
        },
      ]}
    >
      <Image
        source={{ uri: wallpaper.url }}
        style={styles.image}
        contentFit="cover"
        transition={250}
      />

      {/* Subtle overlay gradient */}
      <View style={styles.gradientOverlay} />

      {/* Floating Author Pill */}
      <View style={styles.bottomRow}>
        <View style={styles.authorPill}>
          <Image source={{ uri: wallpaper.authorAvatar }} style={styles.authorAvatar} />
          <Text style={styles.authorText} numberOfLines={1}>
            {wallpaper.author}
          </Text>
        </View>

        {/* Heart Favorite Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePressHeart}
          style={[
            styles.heartButton,
            isFavorite && { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
          ]}
        >
          <Heart
            size={16}
            color={isFavorite ? colors.heartActive : '#FFFFFF'}
            fill={isFavorite ? colors.heartActive : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  bottomRow: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    maxWidth: '68%',
  },
  authorAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  authorText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  heartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
