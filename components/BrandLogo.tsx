import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BrandLogoProps {
  variant?: 'full' | 'letter';
  size?: number;
  color?: string;
  outlineColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 48,
  color = '#FFFFFF',
  outlineColor = '#000000',
}) => {
  if (variant === 'letter') {
    return (
      <View style={[styles.letterContainer, { width: size * 1.4, height: size * 1.6 }]}>
        {/* Outline shadow layer for authentic Figma look */}
        <Text
          style={[
            styles.letterLogo,
            {
              fontSize: size * 1.4,
              color: outlineColor,
              position: 'absolute',
              textShadowColor: outlineColor,
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            },
          ]}
        >
          M
        </Text>
        <Text
          style={[
            styles.letterLogo,
            {
              fontSize: size * 1.4,
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
      {/* Background outline layers for crisp stroke */}
      <Text
        style={[
          styles.fullLogo,
          {
            fontSize: size,
            color: outlineColor,
            position: 'absolute',
            textShadowColor: outlineColor,
            textShadowOffset: { width: 1.5, height: 1.5 },
            textShadowRadius: 1,
          },
        ]}
      >
        Muted
      </Text>
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
    position: 'relative',
  },
  letterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fullLogo: {
    fontFamily: 'MV-Boli',
    letterSpacing: -1,
  },
  letterLogo: {
    fontFamily: 'MV-Boli',
    letterSpacing: -1,
  },
});
