import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.textSecondary,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const PropertyCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.propertyCard, { backgroundColor: colors.card }]}>
      <SkeletonLoader width="100%" height={180} borderRadius={16} />
      <View style={styles.propertyInfo}>
        <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="60%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="50%" height={16} />
      </View>
    </View>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.categoryCard, { backgroundColor: colors.card }]}>
      <SkeletonLoader width={60} height={60} borderRadius={30} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="80%" height={16} style={{ marginBottom: 6 }} />
      <SkeletonLoader width="100%" height={14} />
    </View>
  );
};

const styles = StyleSheet.create({
  propertyCard: {
    width: 175,
    marginRight: 26,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyInfo: {
    padding: 12,
  },
  categoryCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 140,
  },
});
