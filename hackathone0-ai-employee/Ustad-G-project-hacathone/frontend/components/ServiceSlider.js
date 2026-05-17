import React, { useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { POPULAR_SERVICES } from '../data/popularServices';
import { useLanguage } from '../App';

const ServiceCard = ({ item, onServiceSelect, language }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const localizedTitle = t(item.titleKey, language);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable 
        style={styles.card} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onServiceSelect && onServiceSelect(item.prompt)}
        accessibilityRole="button"
        accessibilityLabel={`${localizedTitle} service`}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Feather name={item.icon} size={24} color={item.color} />
        </View>
        <View>
          <Text 
            style={[styles.title, getStyle('body', language)]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {localizedTitle}
          </Text>
          <Text style={[styles.price, getStyle('caption', language)]}>from Rs. {item.price}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function ServiceSlider({ onServiceSelect }) {
  const { language } = useLanguage();
  const scrollX = useRef(new Animated.Value(0)).current;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.heading, getStyle('subheader', language)]}>{t('popular_services', language)}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false} // Custom indicator below
        data={POPULAR_SERVICES}
        renderItem={({ item }) => (
          <ServiceCard 
            item={item} 
            onServiceSelect={onServiceSelect} 
            language={language} 
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        snapToInterval={162}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />

      {/* Custom Persistent Rounded Scrollbar */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorTrack}>
          <Animated.View 
            style={[
              styles.indicatorThumb,
              {
                transform: [{
                  translateX: scrollX.interpolate({
                    inputRange: [0, 162 * (POPULAR_SERVICES.length - 2)], // Adjust based on peeking
                    outputRange: [0, 40], // Track width (60) - Thumb width (20)
                    extrapolate: 'clamp'
                  })
                }]
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
    marginVertical: 16,
  },
  heading: {
    color: Colors.textDark,
    marginBottom: 12,
  },
  list: {
    paddingRight: 16,
  },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    padding: 16,
    marginRight: 12,
    width: 150, // Increased for Urdu support
    height: 160, // Slightly taller for Urdu
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  price: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  indicatorTrack: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicatorThumb: {
    width: 20,
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  }
});
