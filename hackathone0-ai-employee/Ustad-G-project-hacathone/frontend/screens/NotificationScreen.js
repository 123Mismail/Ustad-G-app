import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import NotificationItem from '../components/NotificationItem';
import PageHeader from '../components/PageHeader';
import { getMyBookings } from '../services/bookings.service';
import { useGlobalNotification } from '../context/NotificationContext';
import { mapBookingsToNotifications } from '../utils/notificationHelpers';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentSkip, setCurrentSkip] = useState(0);

  const {
    readIds = [],
    clearedIds = [],
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useGlobalNotification();

  const visibleNotifications = useMemo(() => {
    return notifications
      .filter((n) => !clearedIds.includes(n.id))
      .map((n) => ({
        ...n,
        isRead: readIds.includes(n.id) ? true : n.isRead,
      }));
  }, [notifications, clearedIds, readIds]);

  useEffect(() => {
    if (visibleNotifications.length > 0) {
      const unreadIds = visibleNotifications
        .filter((n) => !n.isRead)
        .map((n) => n.id);
      if (unreadIds.length > 0) {
        markAllAsRead(unreadIds);
      }
    }
  }, [visibleNotifications, markAllAsRead]);


  const loadInitialNotifications = async (showLoader = false) => {
    if (showLoader || notifications.length === 0) {
      setLoading(true);
    }
    try {
      // Fetch dynamic bookings: skip=0, limit=4
      const bookings = await getMyBookings({ skip: 0, limit: 4 });
      const dynamicAlerts = mapBookingsToNotifications(bookings, language);

      const initialAlerts = [...dynamicAlerts];
      // Append fallback mock items if no database items are found
      if (initialAlerts.length === 0) {
        initialAlerts.push(...MOCK_NOTIFICATIONS);
        setHasMore(false);
      } else {
        setHasMore(bookings.length === 4);
      }

      setNotifications(initialAlerts);
      setCurrentSkip(bookings.length);
    } catch (err) {
      console.warn('[NotificationScreen] Failed to load dynamic alerts:', err);
      if (notifications.length === 0) {
        setNotifications(MOCK_NOTIFICATIONS);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadInitialNotifications(false);
    }, [language])
  );

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      // Fetch next page: skip=currentSkip, limit=4
      const bookings = await getMyBookings({ skip: currentSkip, limit: 4 });
      const dynamicAlerts = mapBookingsToNotifications(bookings, language);

      setNotifications((prev) => [...prev, ...dynamicAlerts]);
      setCurrentSkip((prev) => prev + bookings.length);
      setHasMore(bookings.length === 4);
    } catch (err) {
      console.warn('[NotificationScreen] Failed to load more alerts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleClearAll = () => {
    const idsToClear = visibleNotifications.map((n) => n.id);
    clearAllNotifications(idsToClear);
    setNotifications([]);
    setHasMore(false);
  };

  const handleClearIndividual = (id) => {
    clearNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity 
        style={styles.loadMoreButton} 
        onPress={handleLoadMore}
        disabled={loadingMore}
        activeOpacity={0.8}
      >
        {loadingMore ? (
          <ActivityIndicator size="small" color={Colors.accent} />
        ) : (
          <Text style={[styles.loadMoreText, getStyle('body', language)]}>
            {language === 'ur' ? 'مزید لوڈ کریں ⬇️' : 'Load More ⬇️'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader 
        title={t('notifications_title', language)} 
        showBack={true}
        rightElement={
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={[styles.clearAll, getStyle('body', language)]}>{t('clear_all', language)}</Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text style={[styles.loadingText, getStyle('caption', language)]}>
            {language === 'ur' ? 'اطلاعات لوڈ ہو رہی ہیں...' : 'Loading notifications...'}
          </Text>
        </View>
      ) : visibleNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Feather name="bell-off" size={32} color={Colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, getStyle('body', language)]}>
            {language === 'ur' ? 'کوئی اطلاع نہیں ہے' : 'No Notifications'}
          </Text>
          <Text style={[styles.emptySubtitle, getStyle('caption', language)]}>
            {language === 'ur' 
              ? 'جب آپ کوئی بکنگ کریں گے، تو یہاں اطلاعات ظاہر ہوں گی۔' 
              : 'When you place bookings, your notifications will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem 
              notification={item} 
              onClear={() => handleClearIndividual(item.id)} 
            />
          )}
          contentContainerStyle={styles.list}
          ListFooterComponent={renderFooter}
        />
      )}
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textMuted,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60, // Slight visual lift
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF12',
    borderWidth: 1,
    borderColor: '#C1FF7220',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: Colors.textDark,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  list: {
    paddingBottom: 20,
  },
  loadMoreButton: {
    backgroundColor: '#FFFFFF0B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF15',
  },
  loadMoreText: {
    color: Colors.accent,
    fontWeight: '700',
  },
});
