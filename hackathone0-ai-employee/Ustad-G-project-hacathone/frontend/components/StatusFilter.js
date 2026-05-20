import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

const FILTERS = ['all', 'active', 'completed', 'cancelled'];

export default function StatusFilter({ activeFilter, onFilterChange }) {
  const { language } = useLanguage();
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item }) => {
    const isActive = activeFilter === item;
    return (
      <TouchableOpacity 
        style={[styles.chip, isActive && styles.chipActive]} 
        onPress={() => onFilterChange(item)}
      >
        <Text style={[styles.text, getStyle('body', language), isActive && styles.textActive]}>
          {t(item, language)}
        </Text>
      </TouchableOpacity>
    );
  };

  // Scroll indicator width calculation
  // Track width = full container minus horizontal padding
  const TRACK_WIDTH = 80;
  const INDICATOR_WIDTH = TRACK_WIDTH / FILTERS.length;

  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, 150], // approximate max scroll offset for 4 chips
    outputRange: [0, TRACK_WIDTH - INDICATOR_WIDTH],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        renderItem={renderItem}
        keyExtractor={item => item}
        contentContainerStyle={styles.list}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
      {/* Scroll Indicator */}
      <View style={styles.indicatorContainer}>
        <View style={[styles.indicatorTrack, { width: TRACK_WIDTH }]}>
          <Animated.View 
            style={[
              styles.indicatorThumb, 
              { 
                width: INDICATOR_WIDTH, 
                transform: [{ translateX: indicatorTranslateX }] 
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  list: {
    paddingHorizontal: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.bgSecondary,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.textDark,
  },
  text: {
    color: Colors.textMuted,
  },
  textActive: {
    color: Colors.textDark,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  indicatorTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF15',
  },
  indicatorThumb: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
});
