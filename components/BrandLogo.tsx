import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BrandLogoProps {
  variant?: 'full' | 'letter';
  size?: number;
  color?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 48,
  color = '#FFFFFF',
}) => {
  if (variant === 'letter') {
    return (
      <View style={[styles.letterContainer, { width: size * 1.3, height: size * 1.5 }]}>
        <Text
          style={[
            styles.letterLogo,
            {
              fontSize: size * 1.3,
              color,
            },
          ]}
        >
          M
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <Text
        style={[
          styles.fullLogo,
          {
            fontSize: size,
            color,
          },
        ]}
      >
        Muted
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullLogo: {
    fontFamily: 'System',
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  letterLogo: {
    fontFamily: 'System',
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
});
