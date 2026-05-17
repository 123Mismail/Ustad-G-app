import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius } from '../theme/typography';
import { Feather } from '@expo/vector-icons';

export default function StatCard({ title, value, icon, color = Colors.accent, isTrendUp = true, trendValue = '' }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Feather name={icon} size={20} color={color} />
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.value}>{value}</Text>
        {trendValue ? (
          <View style={styles.trendContainer}>
            <Feather 
              name={isTrendUp ? 'trending-up' : 'trending-down'} 
              size={14} 
              color={isTrendUp ? '#4CAF50' : '#F44336'} 
            />
            <Text style={[styles.trendText, { color: isTrendUp ? '#4CAF50' : '#F44336' }]}>
              {trendValue}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontFamily: Typography.header.fontFamily,
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textDark,
    marginRight: 12,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    marginLeft: 4,
  }
});
