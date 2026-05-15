import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { useLanguage } from '../App';
import { t } from '../utils/i18n';

const CategoryItem = ({ item, language, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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

  return (
    <Animated.View style={[styles.itemContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress && onPress(item.prompt)}
        style={styles.item}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} category`}
      >
        <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
          <Feather name={item.icon} size={22} color={item.color} />
        </View>
        <Text style={[styles.itemName, getStyle('caption', language)]}>{item.name}</Text>
      </Pressable>
    </Animated.View>
  );
};

export default function CategoryGrid({ onCategorySelect }) {
  const { language } = useLanguage();
  
  const localizedCategories = [
    { id: 1, name: t('cat_plumber', language), icon: 'droplet', color: '#3B82F6', prompt: 'I need a plumber for repair' },
    { id: 2, name: t('cat_electrician', language), icon: 'zap', color: '#F59E0B', prompt: 'I need an electrician for wiring' },
    { id: 3, name: t('cat_cleaner', language), icon: 'sun', color: '#10B981', prompt: 'I need a cleaner for my house' },
    { id: 4, name: t('cat_ac', language), icon: 'wind', color: '#EF4444', prompt: 'I need AC maintenance' },
    { id: 5, name: t('cat_painter', language), icon: 'edit-3', color: '#8B5CF6', prompt: 'I need a painter for my home' },
    { id: 6, name: t('cat_carpenter', language), icon: 'hammer', color: '#B45309', prompt: 'I need a carpenter for furniture' },
    { id: 7, name: t('cat_gardener', language), icon: 'feather', color: '#059669', prompt: 'I need a gardener for my lawn' },
    { id: 8, name: t('cat_more', language), icon: 'grid', color: '#6B7280', prompt: 'Show me all services' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, getStyle('subheader', language)]}>{t('explore_services', language)}</Text>
      <View style={styles.grid}>
        {localizedCategories.map(cat => (
          <CategoryItem 
            key={cat.id} 
            item={cat} 
            language={language} 
            onPress={onCategorySelect}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  heading: {
    color: Colors.textDark,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemContainer: {
    width: '22%', // 4 items per row with gap
  },
  item: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  itemName: {
    color: Colors.textDark,
    fontWeight: '700',
    textAlign: 'center',
  }
});
