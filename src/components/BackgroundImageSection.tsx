import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/colors';

interface BackgroundImageSectionProps {
  source: any;
}

export const BackgroundImageSection: React.FC<BackgroundImageSectionProps> = ({
  source,
}) => {
  return (
    <View style={styles.imageContainer}>
      <ImageBackground
        source={source}
        style={styles.backgroundImage}
        resizeMode="cover">
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.1)', colors.darkBrown]}
          locations={[0, 1]}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.gradientOverlay}
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 349,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

