import React, { useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import HeroBanner from '../components/HeroBanner';
import AIChatCard from '../components/AIChatCard';
import CategoryGrid from '../components/CategoryGrid';
import ServiceSlider from '../components/ServiceSlider';
import TrustStats from '../components/TrustStats';
import { useLanguage } from '../App';

export default function ChatScreen() {
  const [chatText, setChatText] = useState('');
  const navigation = useNavigation();
  const { language } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <HeroBanner onBellPress={() => navigation.navigate('Notifications')} />

        {/* AI Chat Card */}
        <AIChatCard value={chatText} onChangeText={setChatText} />

        {/* Quick Discovery Grid */}
        <CategoryGrid onCategorySelect={setChatText} />

        {/* Popular Services Slider */}
        <ServiceSlider onServiceSelect={setChatText} />

        {/* Trust Indicators */}
        <TrustStats />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
});
