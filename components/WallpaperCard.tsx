import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
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

  // Spring animation values
  const cardScaleAnim = useRef(new Animated.Value(1)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(cardScaleAnim, {
      toValue: 0.96,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

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

    // Bouncy heart pop animation
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

  return (
    <Animated.View style={{ transform: [{ scale: cardScaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
          source={typeof wallpaper.url === 'number' ? wallpaper.url : { uri: wallpaper.url }}
          style={styles.image}
          contentFit="cover"
          transition={250}
        />

        <View style={styles.gradientOverlay} />

        {/* Floating Author Pill */}
        <View style={styles.bottomRow}>
          <View
            style={styles.authorPill}
            accessible
            accessibilityLabel={`Wallpaper by ${wallpaper.author}`}
          >
            <View style={styles.authorBarLong} />
            <View style={styles.authorBarShort} />
          </View>

          {/* Heart Favorite Button with Spring Bounce */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePressHeart}
            style={[
              styles.heartButton,
              isFavorite && { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
              <Heart
                size={16}
                color={isFavorite ? colors.heartActive : '#858585'}
                fill={isFavorite ? colors.heartActive : 'transparent'}
                strokeWidth={2}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 0,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
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
    backgroundColor: 'transparent',
    width: '64%',
    paddingVertical: 0,
    borderRadius: 0,
  },
  authorAvatar: {
    width: 0,
    height: 0,
  },
  authorText: {
    color: 'transparent',
    fontSize: 1,
  },
  heartButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorBarLong: {
    width: '100%',
    height: 14,
    backgroundColor: '#858585',
    marginBottom: 4,
  },
  authorBarShort: {
    width: '72%',
    height: 7,
    backgroundColor: '#858585',
  },
});
