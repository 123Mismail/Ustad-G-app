import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Platform, Animated, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import ProviderCard from '../components/ProviderCard';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { getProviders, mapProviderToCard } from '../services/providers.service';

export default function ResultsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  
  const [providers, setProviders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadProviders() {
      try {
        let rawProviders = route.params?.providers;
        
        if (!rawProviders) {
          // If no providers passed from chat, fetch defaults (e.g. from a quick select)
          const query = route.params?.query || '';
          // We could parse query to service_type, but for now just fetch all or some
          rawProviders = await getProviders({ city: 'Karachi' });
        }
        
        // Map backend data to frontend card format
        // In a real app, we'd pass user location to mapProviderToCard
        const mapped = rawProviders.map(p => mapProviderToCard(p));
        setProviders(mapped);
        
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
        }
      } catch (err) {
        console.error('[ResultsScreen] Error loading providers:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadProviders();
  }, [route.params]);

  const selectedProvider = providers.find(p => p.id === selectedId);


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar - Fixed with Top Safety */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.title, getStyle('subheader', language)]}>{t('select_provider', language)}</Text>
        <View style={{ width: 40 }} /> {/* Spacer for centering */}
      </View>

      {/* Main Scrollable Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {providers.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: Colors.textMuted }}>
            No providers found for your request.
          </Text>
        ) : (
          <>
            {/* Selection Area (Horizontal List) */}
            <View style={styles.listWrapper}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false} // Custom indicator below
                data={providers}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <ProviderCard 
                    provider={item} 
                    isSelected={item.id === selectedId}
                    onPress={setSelectedId}
                  />
                )}
                contentContainerStyle={styles.horizontalList}
                snapToInterval={162} // Card (150) + Margin (12)
                snapToAlignment="start"
                decelerationRate="fast"
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
              />

              {/* Custom Persistent Rounded Scrollbar */}
              {providers.length > 1 && (
                <View style={styles.indicatorContainer}>
                  <View style={styles.indicatorTrack}>
                    <Animated.View 
                      style={[
                        styles.indicatorThumb,
                        {
                          transform: [{
                            translateX: scrollX.interpolate({
                              inputRange: [0, Math.max(1, 162 * (providers.length - 2))],
                              outputRange: [0, 40],
                              extrapolate: 'clamp'
                            })
                          }]
                        }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Action List (Score Breakdown) */}
            {selectedProvider && <ScoreBreakdown provider={selectedProvider} />}
          </>
        )}
      </ScrollView>

      {/* Footer Button for Dynamic Booking Paths */}
      {selectedProvider && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => {
              navigation.navigate('Home', { 
                prefillText: `I want to book ${selectedProvider.name} for ${selectedProvider.service || 'service'}` 
              });
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.bookButtonText, getStyle('body', language)]}>
              {language === 'ur' 
                ? 'اے آئی سے بک کرائیں' 
                : 'Ask AI to Book'}
            </Text>
            <Feather name="message-circle" size={18} color={Colors.textDark} style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* Direct booking button removed per user request */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 20,
  },
  title: {
    color: Colors.textDark,
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1, // Bounded by header and footer
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listWrapper: {
    marginVertical: 10,
    minHeight: 210, // Dynamic minimum height to avoid Urdu card vertical clipping
  },
  horizontalList: {
    paddingRight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: Colors.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  bookButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.button,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookButtonText: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  directBookButton: {
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: BorderRadius.button,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directBookButtonText: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
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
  }
});

