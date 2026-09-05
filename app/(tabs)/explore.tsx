import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useWallpaperStore } from '../../store/useWallpaperStore';
import { useThemeStore } from '../../store/useThemeStore';
import { EXPLORE_TAGS } from '../../constants/categories';
import { CategoryPill } from '../../components/CategoryPill';
import { WallpaperCard } from '../../components/WallpaperCard';
import { BrandLogo } from '../../components/BrandLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 44) / 2;

export default function ExploreScreen() {
  const { colors, isDark } = useThemeStore();
  const {
    wallpapers,
    searchQuery,
    setSearchQuery,
    activeExploreTag,
    setActiveExploreTag,
  } = useWallpaperStore();

  const filteredWallpapers = useMemo(() => {
    return wallpapers.filter((item) => {
      // Category filter
      const matchesCategory =
        activeExploreTag === 'All' ||
        item.category.toLowerCase() === activeExploreTag.toLowerCase() ||
        item.tags.some((t) => t.toLowerCase() === activeExploreTag.toLowerCase());

      // Search text filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [wallpapers, activeExploreTag, searchQuery]);

  // Dual column distribution
  const { colLeft, colRight } = useMemo(() => {
    const left: typeof filteredWallpapers = [];
    const right: typeof filteredWallpapers = [];
    let leftH = 0;
    let rightH = 0;

    filteredWallpapers.forEach((item) => {
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
  }, [filteredWallpapers]);

  const handleClearSearch = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    setSearchQuery('');
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
          {/* Header with script "Muted" wordmark matching Screen 25 */}
          <View style={styles.header}>
            <BrandLogo variant="full" size={54} color={isDark ? '#FFFFFF' : '#0B2050'} />
          </View>

          {/* Search Bar matching Screen 9, 25 */}
          <View
            style={[
              styles.searchBarContainer,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: colors.border,
              },
            ]}
          >
            <Search size={18} color={isDark ? '#A1A1AA' : '#64748B'} style={styles.searchIcon} />
            <TextInput
              placeholder="Search for wallpapers"
              placeholderTextColor={isDark ? '#71717A' : '#94A3B8'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                <X size={16} color={isDark ? '#A1A1AA' : '#64748B'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter Pills horizontal row matching Screen 9 & 25 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillRow}
          >
            {EXPLORE_TAGS.map((tag) => (
              <CategoryPill
                key={tag}
                label={tag}
                isActive={activeExploreTag === tag}
                onPress={() => setActiveExploreTag(tag)}
              />
            ))}
          </ScrollView>

          {/* Results Count / Empty state */}
          {filteredWallpapers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No wallpapers found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Try searching for something else or pick a different category
              </Text>
            </View>
          ) : (
            /* Masonry Dual Column Grid */
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
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  pillRow: {
    paddingBottom: 18,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
