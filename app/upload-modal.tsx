import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { X, Upload, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useWallpaperStore } from '../store/useWallpaperStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { CATEGORIES } from '../constants/categories';

export default function UploadModal() {
  const router = useRouter();
  const { addWallpaper } = useWallpaperStore();
  const { user } = useAuthStore();
  const { colors, isDark } = useThemeStore();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('minimal');
  const [sampleIndex, setSampleIndex] = useState(0);

  // High-res preview presets for creator submission demonstration
  const sampleUploads = [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&q=85',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1080&q=85',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1080&q=85',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1080&q=85',
  ];

  const activeImageUrl = sampleUploads[sampleIndex];

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please provide a title for your wallpaper.');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}

    addWallpaper({
      id: `user_wp_${Date.now()}`,
      title: title.trim(),
      author: user?.name || 'Community Artist',
      authorAvatar:
        user?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      url: activeImageUrl,
      category: selectedCategory,
      tags: [selectedCategory, 'Community', 'New'],
      likesCount: 1,
      downloadCount: 0,
      heightRatio: 1.6,
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F8FAFC' }]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={[styles.heading, { color: colors.text }]}>Creator Upload</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Image Picker / Preview area */}
          <View
            style={[
              styles.previewBox,
              { backgroundColor: isDark ? '#18181B' : '#E2E8F0', borderColor: colors.border },
            ]}
          >
            <Image source={{ uri: activeImageUrl }} style={styles.previewImage} contentFit="cover" />
            <TouchableOpacity
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (_) {}
                setSampleIndex((prev) => (prev + 1) % sampleUploads.length);
              }}
              style={styles.changeImageBadge}
            >
              <Upload size={16} color="#FFFFFF" />
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <Text style={[styles.label, { color: colors.text }]}>Wallpaper Title</Text>
          <TextInput
            placeholder="e.g. Neon Horizon 4K"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
          />

          {/* Category Picker */}
          <Text style={[styles.label, { color: colors.text, marginTop: 18 }]}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch (_) {}
                    setSelectedCategory(c.id);
                  }}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : isDark
                        ? '#27272A'
                        : '#E2E8F0',
                    },
                  ]}
                >
                  {isSelected && <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: isSelected ? '#FFFFFF' : isDark ? '#D4D4D8' : '#334155' },
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Publish Button */}
          <TouchableOpacity
            onPress={handlePublish}
            activeOpacity={0.85}
            style={[styles.publishBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.publishBtnText}>Publish to Community</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  scroll: {
    padding: 20,
  },
  previewBox: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 20,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeImageBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 15,
  },
  categoriesRow: {
    paddingBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  publishBtn: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
