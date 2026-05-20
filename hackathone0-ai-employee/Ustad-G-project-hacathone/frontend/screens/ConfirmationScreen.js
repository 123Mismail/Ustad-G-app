import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';
import { useGlobalNotification } from '../context/NotificationContext';
import { createBooking } from '../services/bookings.service';
import { useAuth } from '../context/AuthContext';
import { triggerLocalNotification, scheduleLocalReminder } from '../utils/notifications';

export default function ConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { language } = useLanguage();
  const { showNotificationAlert, scheduleForegroundAlert } = useGlobalNotification();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [bookingResult, setBookingResult] = useState(null);

  const { provider, service, scheduledAt } = route.params || {};

  useEffect(() => {
    async function submitBooking() {
      if (!provider) {
        setLoading(false);
        return;
      }
      
      try {
        const result = await createBooking({
          provider_id: provider.id,
          session_id: null,
          service: service || provider.serviceKey || 'General',
          scheduled_at: scheduledAt || new Date().toISOString()
        });
        setBookingResult(result);

        // ── Real-Time Local Notification & Confetti Interceptor ──
        try {
          const providerName = provider?.name || 'Selected Provider';
          
          const notifTitle = language === 'ur' ? '✅ بکنگ کنفرم ہو گئی' : '✅ Booking Confirmed!';
          const notifBody = language === 'ur'
            ? `بکنگ نمبر ${result.confirmation_id} کامیابی سے ریکارڈ ہو گئی ہے۔`
            : `Your booking ${result.confirmation_id} has been successfully recorded.`;

          // Trigger direct in-app celebration and sliding banner!
          showNotificationAlert(notifTitle, notifBody);

          // Trigger native OS push alert in background!
          await triggerLocalNotification(notifTitle, notifBody);

          // Schedule 1-minute reminder
          const reminderTitle = language === 'ur' ? '⏰ آپ کے استاد روانہ ہو چکے ہیں!' : '⏰ Your Ustad is departing soon!';
          const reminderBody = language === 'ur'
            ? `${providerName} آپ کی طرف آ رہے ہیں۔`
            : `${providerName} is heading your way.`;

          await scheduleLocalReminder(reminderTitle, reminderBody, result.scheduled_at);
          scheduleForegroundAlert(reminderTitle, reminderBody, result.scheduled_at);
        } catch (notifErr) {
          console.warn('[ConfirmationScreen] Failed to trigger notifications:', notifErr);
        }
      } catch (error) {
        console.error('[ConfirmationScreen] Error creating booking:', error);
        Alert.alert(
          'Booking Failed',
          error.response?.data?.detail || 'Could not complete your booking. Please try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    }
    
    submitBooking();
  }, [provider, service, scheduledAt]);

  const handleReturnHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={{ marginTop: 16, color: Colors.textMuted }}>Confirming your booking...</Text>
      </SafeAreaView>
    );
  }

  if (!bookingResult) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textDark }}>No booking details available.</Text>
        <TouchableOpacity style={[styles.homeButton, { marginTop: 20, width: '80%' }]} onPress={handleReturnHome}>
          <Text style={styles.homeButtonText}>Return Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const displayDateTime = new Date(bookingResult.scheduled_at).toLocaleString();

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
          <Text style={[styles.idValue, getStyle('header', language)]}>{bookingResult.confirmation_id}</Text>
        </View>

        {/* Service Summary */}
        <View style={styles.summaryBox}>
          <SummaryRow icon="user" label={t('provider', language)} value={provider?.name || 'Assigned Provider'} language={language} />
          <SummaryRow icon="tool" label={t('service', language)} value={bookingResult.service} language={language} />
          <SummaryRow icon="calendar" label={t('date_time', language)} value={displayDateTime} language={language} />
          <SummaryRow icon="map-pin" label={t('location', language)} value={user?.city || 'Karachi'} language={language} />
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
