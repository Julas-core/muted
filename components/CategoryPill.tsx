import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../store/useThemeStore';

interface CategoryPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  isActive,
  onPress,
}) => {
  const { colors, isDark } = useThemeStore();

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={[
        styles.pill,
        {
          backgroundColor: isActive
            ? colors.pillActiveBg
            : isDark
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(0, 0, 0, 0.45)',
          borderColor: isActive ? colors.primary : 'rgba(255, 255, 255, 0.15)',
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isActive ? colors.pillActiveText : '#FFFFFF',
            fontWeight: isActive ? '700' : '600',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    marginRight: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
});
