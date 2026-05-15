import React, { useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

export default function BookingHistoryCard({ booking }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { language } = useLanguage();

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return '#000000';
      case 'Active': return '#000000';
      case 'Cancelled': return '#FFFFFF';
      default: return Colors.textDark;
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'Completed': return Colors.accent;
      case 'Active': return '#FFD700';
      case 'Cancelled': return '#FF5252';
      default: return Colors.bgSecondary;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return Colors.accent;
    if (score >= 50) return '#FFC107';
    return '#FF5252';
  };

  const isActive = booking.status === 'Active';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.outerWrapper, isActive && styles.activeGlow]}
        accessibilityRole="button"
        accessibilityLabel={`${booking.service} booking, status ${booking.status}`}
      >
        <View style={styles.card}>
          {/* Header: Service First */}
          <View style={styles.header}>
            <View style={styles.mainInfo}>
              <Text style={[styles.serviceTitle, getStyle('subheader', language)]}>{booking.service}</Text>
              <View style={styles.providerRow}>
                <Feather name="user" size={12} color={Colors.textMuted} />
                <Text style={[styles.providerName, getStyle('caption', language)]}>{booking.providerName}</Text>
              </View>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusBg(booking.status) }]}>
              {isActive && <View style={styles.pulseDot} />}
              <Text style={[styles.statusText, getStyle('caption', language), { color: getStatusColor(booking.status) }]}>
                {t(booking.status.toLowerCase(), language) || booking.status}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Content Body */}
          <View style={styles.body}>
            <View style={styles.detailRow}>
              <View style={styles.iconBox}>
                <Feather name="calendar" size={14} color={Colors.accent} />
              </View>
              <Text style={[styles.detailText, getStyle('body', language)]}>{booking.dateTime}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconBox}>
                <Feather name="map-pin" size={14} color={Colors.accent} />
              </View>
              <Text style={[styles.detailText, getStyle('body', language)]}>{booking.location || 'Karachi, Pakistan'}</Text>
            </View>
          </View>

          {/* Footer: Score & ID */}
          <View style={styles.footer}>
            <View style={styles.scoreContainer}>
              <View style={styles.scoreHeader}>
                <Text style={[styles.scoreLabel, getStyle('caption', language)]}>{t('performance_score', language)}</Text>
                <Text style={[styles.scoreValue, getStyle('caption', language)]}>{booking.score}/100</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[
                  styles.progressBarFill, 
                  { width: `${booking.score}%`, backgroundColor: getScoreColor(booking.score) }
                ]} />
              </View>
            </View>
            <Text style={styles.idText}>{booking.id}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    marginBottom: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  activeGlow: {
    borderColor: Colors.accent,
    backgroundColor: '#FFFFFF',
  },
  card: {
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  mainInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerName: {
    color: Colors.textMuted,
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
    marginRight: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 16,
  },
  body: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailText: {
    color: '#444444',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  scoreContainer: {
    flex: 1,
    marginRight: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreLabel: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  scoreValue: {
    fontWeight: '800',
    color: Colors.textDark,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  idText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#CCCCCC',
  }
});

