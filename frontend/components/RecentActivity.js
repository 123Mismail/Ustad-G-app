import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

const ACTIVITIES = [
  { id: '1', title: 'Electrician - Ali', status: 'Completed', amount: 'Rs. 500', icon: 'zap' },
  { id: '2', title: 'AC Repair - Usman', status: 'Pending', amount: 'Rs. 1200', icon: 'wind' },
];

export default function RecentActivity() {
  const { language } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('recent_activity', language)}</Text>
      {ACTIVITIES.map((item) => (
        <View key={item.id} style={styles.item}>
          <View style={styles.leftGroup}>
            <View style={styles.iconBox}>
              <Feather name={item.icon} size={20} color={Colors.textDark} />
            </View>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.amount}>{item.amount}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  heading: {
    fontFamily: Typography.subheader.fontFamily,
    fontSize: Typography.subheader.fontSize,
    fontWeight: Typography.subheader.fontWeight,
    color: Colors.textDark,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgSecondary,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  status: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginTop: 4,
  },
  amount: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.textDark,
  }
});
