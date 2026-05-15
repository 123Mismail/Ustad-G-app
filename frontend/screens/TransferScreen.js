import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import StatusFilter from '../components/StatusFilter';
import BookingHistoryCard from '../components/BookingHistoryCard';
import PageHeader from '../components/PageHeader';
import { MOCK_BOOKINGS } from '../data/mockBookings';

export default function TransferScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { language } = useLanguage();

  const filteredBookings = MOCK_BOOKINGS.filter(b => {
    if (activeFilter === 'all') return true;
    return b.status.toLowerCase() === activeFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader 
        title={t('booking_history', language)} 
        rightElement={
          <View style={styles.countBadge}>
            <Text style={[styles.countText, getStyle('caption', language)]}>{filteredBookings.length}</Text>
          </View>
        }
      />

      <StatusFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <BookingHistoryCard booking={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('no_bookings', language)}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  countBadge: {
    backgroundColor: '#FFFFFF12',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: Colors.accent,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    color: Colors.textMuted,
  }
});
