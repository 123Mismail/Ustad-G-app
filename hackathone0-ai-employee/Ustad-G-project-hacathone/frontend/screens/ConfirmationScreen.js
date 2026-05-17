import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

export default function ConfirmationScreen() {
  const navigation = useNavigation();
  const { language } = useLanguage();

  // Mock booking data
  const booking = {
    id: 'UGK-2026-1234',
    providerName: 'Ali Electrician',
    serviceType: 'Wiring & Repair',
    dateTime: 'Today, 2:00 PM',
    location: 'Clifton, Karachi'
  };

  const handleReturnHome = () => {
    // Reset stack to Dashboard safely
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Success Header */}
        <View style={styles.headerBox}>
          <View style={styles.iconCircle}>
            <Feather name="check" size={48} color={Colors.bgPrimary} />
          </View>
          <Text style={[styles.successTitle, getStyle('header', language)]}>{t('booking_confirmed', language)}</Text>
        </View>

        {/* Booking ID Card */}
        <View style={styles.idCard}>
          <Text style={[styles.idLabel, getStyle('caption', language)]}>{t('booking_id', language)}</Text>
          <Text style={[styles.idValue, getStyle('header', language)]}>{booking.id}</Text>
        </View>

        {/* Service Summary */}
        <View style={styles.summaryBox}>
          <SummaryRow icon="user" label={t('provider', language)} value={booking.providerName} language={language} />
          <SummaryRow icon="tool" label={t('service', language)} value={booking.serviceType} language={language} />
          <SummaryRow icon="calendar" label={t('date_time', language)} value={booking.dateTime} language={language} />
          <SummaryRow icon="map-pin" label={t('location', language)} value={booking.location} language={language} />
        </View>

        {/* Return Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.homeButton} onPress={handleReturnHome}>
            <Text style={[styles.homeButtonText, getStyle('body', language)]}>{t('return_home', language)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ icon, label, value, language }) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryLeft}>
        <Feather name={icon} size={20} color={Colors.textMuted} />
        <Text style={[styles.summaryLabel, getStyle('body', language)]}>{label}</Text>
      </View>
      <Text style={[styles.summaryValue, getStyle('body', language)]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerBox: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: Colors.textDark,
  },
  idCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  idLabel: {
    color: Colors.textMuted,
    marginBottom: 8,
  },
  idValue: {
    color: Colors.accent,
    letterSpacing: 1,
  },
  summaryBox: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    color: Colors.textMuted,
    marginLeft: 12,
  },
  summaryValue: {
    color: Colors.textDark,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 20,
  },
  homeButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.button,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontWeight: '700',
    color: Colors.textDark,
  }
});
