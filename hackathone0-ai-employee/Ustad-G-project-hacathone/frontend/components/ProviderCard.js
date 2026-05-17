import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { useLanguage } from '../App';

export default function ProviderCard({ provider, isSelected, onPress }) {
  const { language } = useLanguage();
  return (
    <TouchableOpacity 
      style={[styles.card, isSelected && styles.cardSelected]} 
      onPress={() => onPress(provider.id)}
    >
      <View style={styles.iconContainer}>
        <Feather name="user" size={24} color={Colors.textDark} />
      </View>
      <View style={styles.textContainer}>
        <Text 
          style={[styles.name, getStyle('body', language)]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {provider.name}
        </Text>
        <View style={styles.scoreBadge}>
          <Feather name="star" size={14} color={Colors.bgPrimary} />
          <Text style={[styles.scoreText, getStyle('caption', language)]}>{provider.totalScore}/100</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    padding: 16,
    marginRight: 12,
    width: 150, // Increased for Urdu
    height: 155, // Slightly taller for Urdu
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.textDark,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginTop: 8,
  },
  name: {
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  scoreText: {
    color: Colors.bgPrimary,
    marginLeft: 4,
  }
});
