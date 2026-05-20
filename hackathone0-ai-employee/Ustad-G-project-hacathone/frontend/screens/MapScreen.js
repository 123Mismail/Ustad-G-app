import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Animated, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { KARACHI_CENTER } from '../data/mockProviders';
import MapView from '../components/MapView';
import ProviderMapCard from '../components/ProviderMapCard';
import PageHeader from '../components/PageHeader';
import { Feather } from '@expo/vector-icons';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import { getProviders, mapProviderToCard } from '../services/providers.service';

export default function MapScreen() {
  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentSkip, setCurrentSkip] = useState(0);
  
  const { language } = useLanguage();
  const scrollX = useRef(new Animated.Value(0)).current;

  // 1. Fetch dynamic providers from PostgreSQL DB (skip=0, limit=3)
  useFocusEffect(
    React.useCallback(() => {
      async function loadInitialProviders() {
        setLoading(true);
        try {
          const raw = await getProviders({ skip: 0, limit: 3 });
          const mapped = raw.map(p => {
            const mappedCard = mapProviderToCard(p, KARACHI_CENTER);
            mappedCard.availabilityKey = p.is_active ? 'providers_available' : 'busy';
            
            if (p.service_type === 'electrician') mappedCard.serviceKey = 'cat_electrician';
            else if (p.service_type === 'plumber') mappedCard.serviceKey = 'cat_plumber';
            else if (p.service_type === 'ac_repair') mappedCard.serviceKey = 'cat_ac';
            else if (p.service_type === 'cleaner') mappedCard.serviceKey = 'cat_cleaner';
            else mappedCard.serviceKey = 'cat_electrician'; // Default
            
            mappedCard.lat = p.lat;
            mappedCard.lng = p.lng;
            mappedCard.service = p.service_type ? (p.service_type.charAt(0).toUpperCase() + p.service_type.slice(1)) : 'Service';
            
            return mappedCard;
          });
          setProviders(mapped);
          setCurrentSkip(mapped.length);
          setHasMore(raw.length === 3);
          
          if (mapped.length > 0) {
            setSelectedId(mapped[0].id);
          }
        } catch (error) {
          console.error('[MapScreen] Error fetching providers:', error);
        } finally {
          setLoading(false);
        }
      }
      loadInitialProviders();
    }, [])
  );

  // 2. Fetch subsequent providers (skip=currentSkip, limit=3)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const raw = await getProviders({ skip: currentSkip, limit: 3 });
      const mapped = raw.map(p => {
        const mappedCard = mapProviderToCard(p, KARACHI_CENTER);
        mappedCard.availabilityKey = p.is_active ? 'providers_available' : 'busy';
        
        if (p.service_type === 'electrician') mappedCard.serviceKey = 'cat_electrician';
        else if (p.service_type === 'plumber') mappedCard.serviceKey = 'cat_plumber';
        else if (p.service_type === 'ac_repair') mappedCard.serviceKey = 'cat_ac';
        else if (p.service_type === 'cleaner') mappedCard.serviceKey = 'cat_cleaner';
        else mappedCard.serviceKey = 'cat_electrician';
        
        mappedCard.lat = p.lat;
        mappedCard.lng = p.lng;
        mappedCard.service = p.service_type ? (p.service_type.charAt(0).toUpperCase() + p.service_type.slice(1)) : 'Service';
        
        return mappedCard;
      });
      
      setProviders(prev => [...prev, ...mapped]);
      setCurrentSkip(prev => prev + mapped.length);
      setHasMore(raw.length === 3);
    } catch (error) {
      console.error('[MapScreen] Error loading more providers:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 3. Leaflet Map Popup Click Bridge Listener (Web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SELECT') {
          const numericId = Number(data.id);
          setSelectedId(isNaN(numericId) ? data.id : numericId);
        }
      } catch (e) {
        // Not a JSON message
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Incorporate dynamic load more dummy element into list data
  const flatListData = hasMore ? [...providers, { id: 'load-more', isLoadMoreCard: true }] : providers;

  const selectedProvider = providers.find(p => p.id === selectedId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader 
        title={t('nearby_providers', language)} 
        rightElement={
          <View style={styles.headerIconBox}>
            <Feather name="map" size={18} color={Colors.accent} />
          </View>
        }
      />

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <MapView
            providers={providers}
            selectedId={selectedId}
            onSelectProvider={setSelectedId}
            center={KARACHI_CENTER}
          />
        )}
      </View>

      {/* Provider Cards */}
      <View style={styles.listSection}>
        <Text style={styles.listTitle}>
          {t('providers_found', language).replace('%{count}', providers.length)}
        </Text>
        
        {loading ? (
          <View style={styles.cardsLoader}>
            <ActivityIndicator size="small" color={Colors.accent} />
          </View>
        ) : flatListData.length > 0 ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={flatListData}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              if (item.isLoadMoreCard) {
                return (
                  <TouchableOpacity
                    style={styles.loadMoreCard}
                    onPress={handleLoadMore}
                    disabled={loadingMore}
                    activeOpacity={0.8}
                  >
                    {loadingMore ? (
                      <ActivityIndicator size="small" color={Colors.accent} />
                    ) : (
                      <>
                        <View style={styles.loadMoreIconBox}>
                          <Feather name="plus" size={20} color={Colors.textDark} />
                        </View>
                        <Text style={styles.loadMoreText}>
                          {language === 'ur' ? 'مزید لوڈ ⬇️' : 'Load More ⬇️'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              }
              return (
                <ProviderMapCard
                  provider={item}
                  isSelected={item.id === selectedId}
                  onPress={setSelectedId}
                />
              );
            }}
            contentContainerStyle={styles.list}
            snapToInterval={182}
            snapToAlignment="start"
            decelerationRate="fast"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          />
        ) : (
          <Text style={styles.noProvidersText}>
            {language === 'ur' ? 'قریبی کوئی فراہم کنندہ نہیں ملا' : 'No nearby providers found'}
          </Text>
        )}

        {/* Custom Persistent Rounded Scrollbar */}
        {!loading && flatListData.length > 2 && (
          <View style={styles.indicatorContainer}>
            <View style={styles.indicatorTrack}>
              <Animated.View 
                style={[
                  styles.indicatorThumb,
                  {
                    transform: [{
                      translateX: scrollX.interpolate({
                        inputRange: [0, 182 * Math.max(1, flatListData.length - 2)], // Adjust for peeking
                        outputRange: [0, 40], // Track width (60) - Thumb width (20)
                        extrapolate: 'clamp'
                      })
                    }]
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Book via Chat & Direct Booking Integrations */}
        {selectedProvider && (
          <View style={{ marginTop: 16 }}>
            <TouchableOpacity 
              style={styles.chatBookButton}
              onPress={() => {
                navigation.navigate('Home', { 
                  prefillText: `I want to book ${selectedProvider.name} for ${selectedProvider.service || selectedProvider.serviceKey || 'service'}` 
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.chatBookText}>
                {language === 'ur' ? 'اے آئی سے بک کرائیں' : 'Ask AI to Book'}
              </Text>
              <Feather name="message-circle" size={18} color={Colors.textDark} style={{marginLeft: 8}} />
            </TouchableOpacity>

            {/* Direct booking button removed per user request */}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF12',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listSection: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20, // Constrained to match page margins
  },
  listTitle: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 12,
  },
  list: {
    paddingRight: 20, // Only right padding for the last card
  },
  indicatorContainer: {
    alignItems: 'center',
    marginTop: 16, // Synchronized with ServiceSlider
  },
  indicatorTrack: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicatorThumb: {
    width: 20,
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
  },
  cardsLoader: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProvidersText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    color: Colors.textMuted,
    textAlign: 'center',
    marginVertical: 20,
  },
  loadMoreCard: {
    backgroundColor: '#FFFFFF0B',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 170,
    borderWidth: 1.5,
    borderColor: '#FFFFFF15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadMoreText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    color: Colors.textDark,
    fontWeight: '700',
  },
  chatBookButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatBookText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
  },
  directBookButton: {
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  directBookText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
  },
});
