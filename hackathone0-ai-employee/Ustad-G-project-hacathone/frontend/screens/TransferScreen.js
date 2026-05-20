import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import StatusFilter from '../components/StatusFilter';
import BookingHistoryCard from '../components/BookingHistoryCard';
import PageHeader from '../components/PageHeader';
import { getMyBookings } from '../services/bookings.service';
import { useAuth } from '../context/AuthContext';

export default function TransferScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentSkip, setCurrentSkip] = useState(0);
  
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const mapBooking = (b) => ({
    id: b.confirmation_id,
    providerName: `Provider (ID: ${b.provider_id})`,
    service: b.service || 'Service Request',
    status: b.status === 'Confirmed' ? 'Active' : b.status, // Map Confirmed to Active for UI
    dateTime: new Date(b.scheduled_at || b.created_at).toLocaleString(),
    location: 'Karachi, PK',
    score: 85, // Mock score for history
  });

  useFocusEffect(
    React.useCallback(() => {
      async function loadInitialBookings() {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
          // Fetch initial page: skip=0, limit=4
          const data = await getMyBookings({ skip: 0, limit: 4 });
          const mapped = data.map(mapBooking);
          setBookings(mapped);
          setCurrentSkip(mapped.length);
          // If we fetched exactly 4, there might be more
          setHasMore(data.length === 4);
        } catch (error) {
          console.error('[TransferScreen] Error fetching bookings:', error);
        } finally {
          setLoading(false);
        }
      }
      
      loadInitialBookings();
    }, [isAuthenticated])
  );

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      // Fetch next page: skip=currentSkip, limit=4
      const data = await getMyBookings({ skip: currentSkip, limit: 4 });
      const mapped = data.map(mapBooking);
      setBookings(prev => [...prev, ...mapped]);
      setCurrentSkip(prev => prev + mapped.length);
      // If we fetched exactly 4, there might be more
      setHasMore(data.length === 4);
    } catch (error) {
      console.error('[TransferScreen] Error loading more bookings:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeFilter === 'all') return true;
    return b.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerContainer}>
        {loadingMore ? (
          <ActivityIndicator size="small" color={Colors.accent} style={{ marginVertical: 8 }} />
        ) : (
          <TouchableOpacity 
            onPress={handleLoadMore} 
            style={styles.moreBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.moreBtnText, getStyle('body', language)]}>
              {language === 'ur' ? 'مزید لوڈ کریں ⬇️' : 'Load More ⬇️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <BookingHistoryCard booking={item} />}
          ListFooterComponent={renderFooter}
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
  },
  footerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtn: {
    backgroundColor: '#FFFFFF12',
    borderWidth: 1,
    borderColor: '#C1FF7230',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    minWidth: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBtnText: {
    color: Colors.accent,
    fontWeight: 'bold',
  },
});
