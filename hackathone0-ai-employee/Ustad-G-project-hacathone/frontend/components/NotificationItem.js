import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, getStyle } from '../theme/typography';

import { t } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';

const TYPE_CONFIG = {
  success: { icon: 'check-circle', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)' },
  warning: { icon: 'alert-triangle', color: '#FFC107', bg: 'rgba(255, 193, 7, 0.1)' },
  info: { icon: 'info', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)' },
};

export default function NotificationItem({ notification, onClear }) {
  const { language } = useLanguage();
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;

  const displayTime = notification.timeKey 
    ? t(notification.timeKey, language) 
    : notification.time;

  return (
    <View style={[styles.container, !notification.isRead && styles.unread]}>
      <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
        <Feather name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, getStyle('body', language)]}>
            {notification.titleKey ? t(notification.titleKey, language) : notification.title}
          </Text>
          <Text style={[styles.time, getStyle('caption', language)]}>{displayTime}</Text>
        </View>
        <Text style={[styles.body, getStyle('caption', language)]} numberOfLines={3}>
          {notification.bodyKey ? t(notification.bodyKey, language) : notification.body}
        </Text>
      </View>
      
      <View style={styles.rightActions}>
        {!notification.isRead && <View style={styles.dot} />}
        <TouchableOpacity 
          onPress={onClear}
          style={styles.clearBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="x" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
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
    flex: 1,
    marginRight: 8,
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
  },
  rightActions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginLeft: 8,
  },
  clearBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
