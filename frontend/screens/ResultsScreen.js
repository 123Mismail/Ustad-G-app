import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import ProviderCard from '../components/ProviderCard';
import ScoreBreakdown from '../components/ScoreBreakdown';

const MOCK_PROVIDERS = [
  { id: 'p1', name: 'Ali Electrician', totalScore: 92, scores: { distance: 38, rating: 36, availability: 18 } },
  { id: 'p2', name: 'Usman Fixers', totalScore: 85, scores: { distance: 30, rating: 35, availability: 20 } },
  { id: 'p3', name: 'Karachi Wiring', totalScore: 78, scores: { distance: 40, rating: 28, availability: 10 } },
];

export default function ResultsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const [selectedId, setSelectedId] = useState(MOCK_PROVIDERS[0].id);
  const scrollX = useRef(new Animated.Value(0)).current;

  const selectedProvider = MOCK_PROVIDERS.find(p => p.id === selectedId);

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
        {/* Selection Area (Horizontal List) */}
        <View style={styles.listWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false} // Custom indicator below
            data={MOCK_PROVIDERS}
            keyExtractor={item => item.id}
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
          <View style={styles.indicatorContainer}>
            <View style={styles.indicatorTrack}>
              <Animated.View 
                style={[
                  styles.indicatorThumb,
                  {
                    transform: [{
                      translateX: scrollX.interpolate({
                        inputRange: [0, 162 * (MOCK_PROVIDERS.length - 2)],
                        outputRange: [0, 40],
                        extrapolate: 'clamp'
                      })
                    }]
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Action List (Score Breakdown) */}
        <ScoreBreakdown provider={selectedProvider} />
      </ScrollView>

      {/* Sticky Submit Button - Fixed at bottom with Bottom Safety */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('Confirmation')}
          activeOpacity={0.8}
        >
          <Text style={[styles.bookButtonText, getStyle('body', language)]}>{t('book_now', language)}</Text>
          <Feather name="check" size={20} color={Colors.textDark} style={{marginLeft: 8}} />
        </TouchableOpacity>
      </View>
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
    height: 195, // Explicit height for stable ScrollView measurement
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
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
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
