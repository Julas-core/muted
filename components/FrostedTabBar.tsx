import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Compass, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../store/useThemeStore';

export interface FrostedTabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  descriptors: Record<string, { options: any }>;
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

export const FrostedTabBar: React.FC<FrostedTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDark } = useThemeStore();

  const getIcon = (routeName: string, isFocused: boolean) => {
    const iconColor = isFocused ? colors.primary : isDark ? '#A1A1AA' : '#64748B';
    const size = 22;

    switch (routeName) {
      case 'index':
        return <Home size={size} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'explore':
        return <Compass size={size} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
      case 'profile':
        return <User size={size} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
      default:
        return <Home size={size} color={iconColor} strokeWidth={2} />;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'Home';
      case 'explore':
        return 'Explore';
      case 'profile':
        return 'Profile';
      default:
        return routeName;
    }
  };

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={[styles.pillContainer, { borderColor: colors.border }]}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 100}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurView}
        >
          <View style={[styles.innerRow, { backgroundColor: colors.tabBarBg }]}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (_) {}

                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  activeOpacity={0.7}
                  style={[
                    styles.tabButton,
                    isFocused && [
                      styles.tabButtonActive,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13, 93, 254, 0.12)' },
                    ],
                  ]}
                >
                  <View style={styles.iconWrapper}>
                    {getIcon(route.name, isFocused)}
                    {isFocused && (
                      <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused ? (isDark ? '#FFFFFF' : colors.primary) : isDark ? '#A1A1AA' : '#64748B',
                        fontWeight: isFocused ? '700' : '500',
                      },
                    ]}
                  >
                    {getLabel(route.name)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContainer: {
    width: '84%',
    maxWidth: 360,
    height: 66,
    borderRadius: 33,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  blurView: {
    flex: 1,
  },
  innerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabButtonActive: {},
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  activeDot: {
    position: 'absolute',
    top: -4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'SourGummy-Bold',
    marginTop: 2,
  },
});
