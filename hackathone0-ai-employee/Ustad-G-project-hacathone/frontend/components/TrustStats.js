import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius } from '../theme/typography';
import { useLanguage } from '../App';
import { t } from '../utils/i18n';

const StatItem = ({ icon, value, label }) => (
  <View style={styles.statItem}>
    <View style={styles.iconCircle}>
      <Feather name={icon} size={22} color={Colors.accent} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function TrustStats() {
  const { language } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('trust_guarantee', language)}</Text>
      <View style={styles.card}>
        <View style={styles.statsRow}>
          <StatItem icon="shield" value="100%" label={t('certified_ustads', language)} />
          <StatItem icon="lock" value="Secure" label={t('secure_payment', language)} />
          <StatItem icon="headphones" value="24/7" label={t('support_247', language)} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('tagline', language)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  heading: {
    fontFamily: Typography.subheader.fontFamily,
    fontSize: Typography.subheader.fontSize,
    fontWeight: Typography.subheader.fontWeight,
    color: Colors.textDark,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  statLabel: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginTop: 2,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
