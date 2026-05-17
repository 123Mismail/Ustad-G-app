import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import { POPULAR_SERVICES } from '../data/popularServices';

// ─── Greeting helper ────────────────────────────────────────────────────────
function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return 'good_morning';
  if (hour < 17) return 'good_afternoon';
  return 'good_evening';
}

function getGreetingEmoji() {
  const hour = new Date().getHours();
  if (hour < 12) return '☀️';
  if (hour < 17) return '🌤️';
  return '🌙';
}

// ─── StatPill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, language }) {
  return (
    <View style={styles.pill}>
      <Feather name={icon} size={12} color={Colors.accent} style={styles.pillIcon} />
      <Text style={[styles.pillText, getStyle('caption', language)]}>{label}</Text>
    </View>
  );
}

// ─── HeroBanner ──────────────────────────────────────────────────────────────
export default function HeroBanner({ onBellPress }) {
  const { language } = useLanguage();

  const greetingText = `${getGreetingEmoji()}  ${t(getGreetingKey(), language)}`;
  const appName = t('welcome_to', language).replace('%{app}', t('app_name', language));
  const cityLabel = t('city', language);
  const providerCount = POPULAR_SERVICES.length;
  const providerLabel = t('providers_found', language).replace('%{count}', providerCount);

  return (
    // Outer wrapper carries the neon glow shadow (iOS) / elevation (Android)
    <View style={styles.outerWrapper}>
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* ── Zone 1: Top Row ─────────────────────────────────────────── */}
        <View style={styles.topRow}>
          <View style={styles.greetingBlock}>
            <Text style={[styles.greetingText, getStyle('caption', language)]}>{greetingText}</Text>
            <Text style={[styles.appNameText, getStyle('header', language)]}>{appName}</Text>
          </View>

          {/* Bell — min 44×44 touch target for mobile */}
          <TouchableOpacity
            onPress={onBellPress}
            style={styles.bellBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="bell" size={20} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* ── Zone 2: Divider ──────────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Zone 3: Stats Pills Row ──────────────────────────────────── */}
        <View style={styles.pillsRow}>
          <StatPill icon="map-pin" label={cityLabel} language={language} />
          <StatPill icon="zap" label={providerLabel} language={language} />
        </View>
      </LinearGradient>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerWrapper: {
    borderRadius: BorderRadius.card,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C1FF7225',
    // iOS glow
    ...Platform.select({
      ios: {
        shadowColor: '#C1FF72',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      // Android elevation (no color support, but adds depth)
      android: {
        elevation: 8,
      },
    }),
  },
  gradient: {
    borderRadius: BorderRadius.card,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },

  // Top Row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingBlock: {
    flex: 1,
    marginRight: 12,
  },
  greetingText: {
    color: '#AAAAAA',
    marginBottom: 0, // Removed for Nastaliq
  },
  appNameText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Bell button — 44×44 min touch target
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF12',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF15',
    marginVertical: 16,
  },

  // Pills Row
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF12',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillIcon: {
    marginRight: 6,
  },
  pillText: {
    color: '#FFFFFF',
  },
});
