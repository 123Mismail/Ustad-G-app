import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

export default function ScoreBreakdown({ provider }) {
  const { language } = useLanguage();
  if (!provider) return null;

  const breakdowns = [
    { id: 'distance', label: t('distance_score', language), score: provider.scores.distance, max: 40, icon: 'map-pin' },
    { id: 'rating', label: t('rating_score', language), score: provider.scores.rating, max: 40, icon: 'star' },
    { id: 'availability', label: t('availability_score', language), score: provider.scores.availability, max: 20, icon: 'clock' },
  ];

  return (
    <View style={styles.container}>
      {breakdowns.map((item) => (
        <View key={item.id} style={styles.item}>
          <View style={styles.leftGroup}>
            <View style={styles.iconBox}>
              <Feather name={item.icon} size={20} color={Colors.textDark} />
            </View>
            <View>
              <Text style={[styles.label, getStyle('body', language)]}>{item.label}</Text>
              <Text style={[styles.subtitle, getStyle('caption', language)]}>
                {t('max_points', language).replace('%{count}', item.max)}
              </Text>
            </View>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, getStyle('body', language)]}>{item.score}</Text>
          </View>
        </View>
      ))}
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, getStyle('subheader', language)]}>{t('total_match_score', language)}</Text>
        <Text style={[styles.totalScore, getStyle('subheader', language)]}>{provider.totalScore} / 100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    padding: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  subtitle: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scoreContainer: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  score: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: Colors.textDark,
  },
  totalLabel: {
    fontFamily: Typography.subheader.fontFamily,
    fontSize: Typography.subheader.fontSize,
    fontWeight: Typography.subheader.fontWeight,
    color: Colors.textDark,
  },
  totalScore: {
    fontFamily: Typography.header.fontFamily,
    fontSize: Typography.subheader.fontSize,
    fontWeight: '800',
    color: Colors.textDark,
  }
});
