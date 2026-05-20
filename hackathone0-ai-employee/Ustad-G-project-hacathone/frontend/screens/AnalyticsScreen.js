import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import StatCard from '../components/StatCard';
import RevenueChart from '../components/RevenueChart';
import PageHeader from '../components/PageHeader';
import { Feather } from '@expo/vector-icons';
import { getAdminStats } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsScreen() {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('[AnalyticsScreen] Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadStats();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PageHeader title={t('analytics', language)} />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <Text style={{ color: Colors.textMuted }}>Admin access required.</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      
      {loading ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : stats ? (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <StatCard 
            title="Total Bookings" 
            value={stats.total_bookings.toString()} 
            icon="calendar" 
            color="#FF9800" 
            isTrendUp={true} 
            trendValue={`${stats.confirmed_bookings} confirmed`} 
          />
          
          <StatCard 
            title="Active Providers" 
            value={stats.active_providers.toString()} 
            icon="users" 
            color="#2196F3" 
            isTrendUp={true} 
            trendValue="Platform wide" 
          />
          
          <StatCard 
            title="Estimated Revenue" 
            value={`Rs ${stats.estimated_revenue_pkr.toLocaleString()}`} 
            icon="dollar-sign" 
            color={Colors.accent} 
            isTrendUp={true} 
            trendValue="Based on base prices" 
          />

          <View style={{ marginTop: 24 }}>
            <Text style={styles.chartTitle}>Top Services Demand</Text>
            <RevenueChart 
              data={stats.top_services.map(s => ({
                label: s.service.substring(0, 3).toUpperCase(),
                value: s.count
              }))} 
            />
          </View>
        </ScrollView>
      ) : (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <Text style={{ color: Colors.textMuted }}>Failed to load stats.</Text>
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
  },
  chartTitle: {
    fontFamily: Typography.subheader.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 16,
  }
});
