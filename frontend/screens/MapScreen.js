import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Animated } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { MOCK_PROVIDERS, KARACHI_CENTER } from '../data/mockProviders';
import MapView from '../components/MapView';
import ProviderMapCard from '../components/ProviderMapCard';
import PageHeader from '../components/PageHeader';
import { Feather } from '@expo/vector-icons';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

export default function MapScreen() {
  const [selectedId, setSelectedId] = useState(null);
  const { language } = useLanguage();
  const scrollX = useRef(new Animated.Value(0)).current;

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

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          providers={MOCK_PROVIDERS}
          selectedId={selectedId}
          onSelectProvider={setSelectedId}
          center={KARACHI_CENTER}
        />
      </View>

      {/* Provider Cards */}
      <View style={styles.listSection}>
        <Text style={styles.listTitle}>
          {t('providers_found', language).replace('%{count}', MOCK_PROVIDERS.length)}
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false} // Custom indicator below
          data={MOCK_PROVIDERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProviderMapCard
              provider={item}
              isSelected={item.id === selectedId}
              onPress={setSelectedId}
            />
          )}
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

        {/* Custom Persistent Rounded Scrollbar */}
        <View style={styles.indicatorContainer}>
          <View style={styles.indicatorTrack}>
            <Animated.View 
              style={[
                styles.indicatorThumb,
                {
                  transform: [{
                    translateX: scrollX.interpolate({
                      inputRange: [0, 182 * (MOCK_PROVIDERS.length - 2)], // Adjust for peeking
                      outputRange: [0, 40], // Track width (60) - Thumb width (20)
                      extrapolate: 'clamp'
                    })
                  }]
                }
              ]} 
            />
          </View>
        </View>
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
  }
});
