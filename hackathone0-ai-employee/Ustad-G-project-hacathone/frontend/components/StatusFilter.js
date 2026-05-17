import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

const FILTERS = ['all', 'active', 'completed', 'cancelled'];

export default function StatusFilter({ activeFilter, onFilterChange }) {
  const { language } = useLanguage();
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

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        renderItem={renderItem}
        keyExtractor={item => item}
        contentContainerStyle={styles.list}
      />
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
  }
});
