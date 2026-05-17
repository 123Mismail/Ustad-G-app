import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, getStyle } from '../theme/typography';

import { t } from '../utils/i18n';
import { useLanguage } from '../App';

const TYPE_CONFIG = {
  success: { icon: 'check-circle', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)' },
  warning: { icon: 'alert-triangle', color: '#FFC107', bg: 'rgba(255, 193, 7, 0.1)' },
  info: { icon: 'info', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)' },
};

export default function NotificationItem({ notification }) {
  const { language } = useLanguage();
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;

  const displayTime = notification.timeKey 
    ? t(notification.timeKey, language) 
    : notification.time;

  return (
    <TouchableOpacity style={[styles.container, !notification.isRead && styles.unread]}>
      <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
        <Feather name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, getStyle('body', language)]}>{t(notification.titleKey, language)}</Text>
          <Text style={[styles.time, getStyle('caption', language)]}>{displayTime}</Text>
        </View>
        <Text style={[styles.body, getStyle('caption', language)]} numberOfLines={2}>
          {t(notification.bodyKey, language)}
        </Text>
      </View>
      {!notification.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: Colors.bgPrimary,
  },
  unread: {
    backgroundColor: 'rgba(193, 255, 114, 0.05)', // Subtle accent tint
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: Colors.textDark,
  },
  time: {
    color: Colors.textMuted,
  },
  body: {
    color: Colors.textMuted,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginLeft: 8,
  }
});
