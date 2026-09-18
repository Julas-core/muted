import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Search, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CATEGORIES } from '../../constants/categories';
import { useWallpaperStore } from '../../store/useWallpaperStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_WIDTH = (SCREEN_WIDTH - 56) / 3;

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useThemeStore();
  const { setTastes } = useWallpaperStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'minimal',
    'cars',
    'dark',
    'abstract',
    'comic',
    'animals',
    'anime',
    'sport',
  ]);
  const [customSearch, setCustomSearch] = useState('');
  const [step, setStep] = useState<'pick' | 'preview'>('pick');

  const toggleCategory = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}

    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const { setOnboardingComplete, updateProfileData } = useAuthStore();

  const handleNext = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}

    if (step === 'pick') {
      const finalTastes = [...selectedCategories];
      if (customSearch.trim()) {
        finalTastes.push(customSearch.trim().toLowerCase());
      }
      setTastes(finalTastes);
      updateProfileData({ categories: finalTastes });
      setStep('preview');
    } else {
      await setOnboardingComplete(true);
      router.replace('/(tabs)');
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
        {step === 'pick' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Title */}
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0B2050' }]}>
              What are you{'\n'}looking for
            </Text>

            {/* Category Grid */}
            <View style={styles.grid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.8}
                    onPress={() => toggleCategory(cat.id)}
                    style={[
                      styles.tile,
                      isSelected && {
                        borderColor: colors.primary,
                        borderWidth: 2,
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: cat.image }}
                      style={styles.tileImage}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.tileOverlay} />

                    <View style={styles.tileContent}>
                      <Text style={styles.tileName} numberOfLines={1}>
                        {cat.name}
                      </Text>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Search Fallback */}
            <View style={styles.fallbackSection}>
              <Text style={[styles.fallbackTitle, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>
                Not your taste huh...
              </Text>
              <View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.45)',
                    borderColor: colors.border,
                  },
                ]}
              >
                <TextInput
                  placeholder="search for what you like then"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={customSearch}
                  onChangeText={setCustomSearch}
                  style={styles.searchInput}
                />
                <Search size={18} color="#FFFFFF" />
              </View>
            </View>
          </ScrollView>
        ) : (
          /* Step 2: "Nice you have some options" (Screen 6) */
          <View style={styles.previewContainer}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0B2050', marginBottom: 24 }]}>
              Nice you have{'\n'}some options
            </Text>

            <View style={styles.previewGrid}>
              {CATEGORIES.slice(0, 4).map((cat) => (
                <View key={cat.id} style={styles.previewCard}>
                  <Image source={{ uri: cat.image }} style={styles.previewImage} contentFit="cover" />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Fixed Bottom Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNext}
            style={[styles.nextButton, { backgroundColor: isDark ? '#000000' : '#000000' }]}
          >
            <Text style={styles.nextButtonText}>
              {step === 'pick' ? 'Next' : 'Explore Feed'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  title: {
    fontSize: 36,
    fontFamily: 'SourGummy-Black',
    letterSpacing: -1,
    lineHeight: 44,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_WIDTH * 1.15,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  tileImage: {
    ...StyleSheet.absoluteFill,
  },
  tileOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  tileContent: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileName: {
    color: '#FFFFFF',
    fontFamily: 'SourGummy-Bold',
    fontSize: 13,
    flex: 1,
    marginRight: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  fallbackSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  fallbackTitle: {
    fontSize: 18,
    fontFamily: 'SourGummy-Bold',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'SourGummy-Medium',
    fontSize: 15,
  },
  previewContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  previewCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    height: (SCREEN_WIDTH - 56) * 0.75,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  nextButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontFamily: 'SourGummy-Bold',
    fontSize: 18,
  },
});
