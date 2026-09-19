import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useWallpaperStore } from '../../store/useWallpaperStore';
import { useThemeStore } from '../../store/useThemeStore';
import { WallpaperCard } from '../../components/WallpaperCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 100) / 2;

export default function HomeFeedScreen() {
  const { colors, isDark } = useThemeStore();
  const { getCuratedFeed } = useWallpaperStore();
  const [refreshing, setRefreshing] = useState(false);

  const curatedWallpapers = useMemo(() => getCuratedFeed(), [getCuratedFeed]);

  // Distribute wallpapers into two balanced columns for masonry layout
  const { colLeft, colRight } = useMemo(() => {
    const left: typeof curatedWallpapers = [];
    const right: typeof curatedWallpapers = [];
    let leftHeight = 0;
    let rightHeight = 0;

    curatedWallpapers.forEach((item) => {
      const h = COLUMN_WIDTH * item.heightRatio;
      if (leftHeight <= rightHeight) {
        left.push(item);
        leftHeight += h;
      } else {
        right.push(item);
        rightHeight += h;
      }
    });

    return { colLeft: left, colRight: right };
  }, [curatedWallpapers]);

  const onRefresh = () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? colors.backgroundGradient : ['#1973F0', '#64A0F1', '#E2F0FF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#FFFFFF' : colors.primary}
            />
          }
        >
          <View style={styles.header}>
            <Text style={[styles.mainTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Discover</Text>
            <Text style={[styles.subTitle, { color: isDark ? '#D4D4D8' : '#334155' }]}>
              Curated wallpapers to match your mood.
            </Text>
          </View>

          {/* Masonry Dual Column Grid */}
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
    paddingHorizontal: 30,
    paddingTop: 0,
    paddingBottom: 110, // padding for floating tab bar
  },
  header: {
    marginBottom: 40,
    marginTop: 0,
  },
  mainTitle: {
    fontSize: 68,
    lineHeight: 78,
    fontFamily: 'SourGummy-Black',
    letterSpacing: -2,
  },
  subTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'SourGummy-SemiBold',
    marginTop: 5,
    marginLeft: 6,
    letterSpacing: -0.35,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
  },
});
