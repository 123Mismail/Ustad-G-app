import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import NotificationItem from '../components/NotificationItem';
import PageHeader from '../components/PageHeader';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const { language } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader 
        title={t('notifications_title', language)} 
        showBack={true}
        rightElement={
          <TouchableOpacity>
            <Text style={[styles.clearAll, getStyle('body', language)]}>{t('clear_all', language)}</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem notification={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  clearAll: {
    color: Colors.accent,
  },
  list: {
    paddingBottom: 20,
  }
});
