import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

const SERVICE_ICONS = {
  cat_electrician: 'zap',
  cat_plumber: 'droplet',
  cat_ac: 'wind',
  cat_cleaner: 'sun',
};

export default function ProviderMapCard({ provider, isSelected, onPress }) {
  const { language } = useLanguage();
  const iconName = SERVICE_ICONS[provider.serviceKey] || 'tool';

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onPress(provider.id)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Feather name={iconName} size={18} color={Colors.textDark} />
        </View>
        <View style={styles.ratingBox}>
          <Feather name="star" size={12} color="#F5A623" />
          <Text style={[styles.ratingText, getStyle('caption', language)]}>{provider.rating}</Text>
        </View>
      </View>

      <Text 
        style={[styles.name, getStyle('body', language)]} 
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {provider.name}
      </Text>
      <Text style={[styles.service, getStyle('caption', language)]}>{t(provider.serviceKey, language)}</Text>

      <View style={styles.footer}>
        <View style={styles.detailRow}>
          <Feather name="map-pin" size={12} color={Colors.textMuted} />
          <Text style={[styles.detailText, getStyle('caption', language)]}>
            {t('km_away', language).replace('%{count}', provider.distanceVal)}
          </Text>
        </View>
        <View style={[
          styles.availBadge,
          provider.availabilityKey === 'providers_available' ? styles.availGreen : styles.availYellow
        ]}>
          <Text style={[styles.availText, getStyle('caption', language)]}>{t(provider.availabilityKey, language)}</Text>
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
    width: 170,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.textDark,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginLeft: 4,
  },
  name: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  service: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  availGreen: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  availYellow: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
  },
  availText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textDark,
  },
});
