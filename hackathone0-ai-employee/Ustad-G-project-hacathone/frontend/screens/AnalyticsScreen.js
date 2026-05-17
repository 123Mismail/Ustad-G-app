import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import StatCard from '../components/StatCard';
import RevenueChart from '../components/RevenueChart';
import PageHeader from '../components/PageHeader';
import { Feather } from '@expo/vector-icons';

const MOCK_REVENUE_DATA = [
  { label: 'Mon', value: 12000 },
  { label: 'Tue', value: 15000 },
  { label: 'Wed', value: 9000 },
  { label: 'Thu', value: 18000 },
  { label: 'Fri', value: 24000 },
  { label: 'Sat', value: 30000 },
  { label: 'Sun', value: 28000 },
];

export default function AnalyticsScreen() {
  const { language } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader 
        title={t('analytics', language)} 
        rightElement={
          <View style={styles.headerIconBox}>
            <Feather name="activity" size={18} color={Colors.accent} />
          </View>
        }
      />
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <StatCard 
          title={t('orders_today', language)} 
          value="14" 
          icon="sun" 
          color="#FF9800" 
          isTrendUp={true} 
          trendValue="+2 from yesterday" 
        />
        
        <StatCard 
          title={t('orders_week', language)} 
          value="85" 
          icon="calendar" 
          color="#2196F3" 
          isTrendUp={false} 
          trendValue="-5 from last week" 
        />
        
        <StatCard 
          title={t('orders_month', language)} 
          value="342" 
          icon="pie-chart" 
          color={Colors.accent} 
          isTrendUp={true} 
          trendValue="+12% growth" 
        />

        <RevenueChart data={MOCK_REVENUE_DATA} />
      </ScrollView>
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
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  }
});
