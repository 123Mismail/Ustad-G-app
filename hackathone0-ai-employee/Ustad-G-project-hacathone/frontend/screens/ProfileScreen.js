import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import ProfileHeader from '../components/ProfileHeader';
import SettingsRow from '../components/SettingsRow';
import PageHeader from '../components/PageHeader';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const NOTIFICATIONS_KEY = 'ustadg_notifications_enabled';

export default function ProfileScreen() {
  const { language, setLanguage } = useLanguage();
  const { logout, isAdmin } = useAuth();
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const loadNotifPref = async () => {
    try {
      const val = Platform.OS === 'web'
        ? localStorage.getItem(NOTIFICATIONS_KEY)
        : await SecureStore.getItemAsync(NOTIFICATIONS_KEY);
      if (val !== null) setNotificationsEnabled(val === 'true');
    } catch (_) {}
  };

  // Load notification preference on mount
  useEffect(() => { loadNotifPref(); }, []);

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(NOTIFICATIONS_KEY, String(value));
      } else {
        await SecureStore.setItemAsync(NOTIFICATIONS_KEY, String(value));
      }
    } catch (_) {}
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Are you sure you want to log out?');
      if (confirmLogout) logout();
      return;
    }
    Alert.alert(
      t('log_out', language),
      t('logout_confirm', language),
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => {
            try { await logout(); } catch (e) { Alert.alert('Error', 'Failed to log out.'); }
          }
        }
      ]
    );
  };

  // Language toggle widget
  const LanguageToggle = () => (
    <View style={styles.langToggle}>
      {['en', 'ur', 'roman_ur'].map(l => (
        <TouchableOpacity
          key={l}
          style={[styles.langBtn, language === l && styles.langBtnActive]}
          onPress={() => setLanguage(l)}
        >
          <Text style={[styles.langText, language === l && styles.langTextActive]}>
            {l === 'roman_ur' ? 'RU' : l.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Notifications toggle widget
  const NotificationsToggle = () => (
    <Switch
      value={notificationsEnabled}
      onValueChange={toggleNotifications}
      trackColor={{ false: Colors.bgSecondary, true: `${Colors.accent}80` }}
      thumbColor={notificationsEnabled ? Colors.accent : Colors.textMuted}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader
        title={t('profile_title', language)}
        rightElement={
          <TouchableOpacity style={styles.headerIconBox} onPress={() => navigation.navigate('EditProfile')}>
            <Feather name="settings" size={18} color={Colors.accent} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Tappable profile card → Edit Profile */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('EditProfile')}>
          <ProfileHeader />
          <View style={styles.editHint}>
            <Feather name="edit-2" size={12} color={Colors.textMuted} />
            <Text style={styles.editHintText}>
              {language === 'ur' ? 'ترمیم کے لیے ٹیپ کریں' : 'Tap to edit profile'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Section: Account */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{language === 'ur' ? 'اکاؤنٹ' : 'ACCOUNT'}</Text>
          <View style={styles.section}>
            <SettingsRow
              icon="map-pin"
              title={t('saved_addresses', language)}
              onPress={() => navigation.navigate('SavedAddresses')}
            />
            <SettingsRow
              icon="credit-card"
              title={t('payment_methods', language)}
              onPress={() => navigation.navigate('PaymentMethods')}
            />
          </View>
        </View>

        {/* Section: Preferences */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{language === 'ur' ? 'ترجیحات' : 'PREFERENCES'}</Text>
          <View style={styles.section}>
            <SettingsRow
              icon="globe"
              title={t('language', language)}
              rightWidget={<LanguageToggle />}
            />
            <SettingsRow
              icon="bell"
              title={t('notifications', language)}
              rightWidget={<NotificationsToggle />}
            />
          </View>
        </View>

        {/* Developer Settings - Only visible to admins */}
        {isAdmin && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>{t('dev_settings', language)}</Text>
            <View style={styles.section}>
              <SettingsRow icon="shield" title="Admin Access Enabled" />
              <SettingsRow 
                icon="user-plus" 
                title="Register New Provider" 
                onPress={() => navigation.navigate('AdminProviderRegistration')} 
              />
            </View>
          </View>
        )}

        {/* Section: Support */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{language === 'ur' ? 'سپورٹ' : 'SUPPORT'}</Text>
          <View style={styles.section}>
            <SettingsRow
              icon="help-circle"
              title={t('help_center', language)}
              onPress={() => navigation.navigate('HelpCenter')}
            />
            <SettingsRow
              icon="shield"
              title={t('privacy_policy', language)}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
          </View>
        </View>

        {/* Section: Logout */}
        <View style={styles.section}>
          <SettingsRow
            icon="log-out"
            title={t('log_out', language)}
            color="#F44336"
            onPress={handleLogout}
          />
        </View>

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
    paddingBottom: 40,
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
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  editHintText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    color: Colors.textMuted,
  },
  sectionBlock: {
    marginTop: 24,
  },
  sectionLabel: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  section: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bgPrimary,
    borderRadius: 8,
    padding: 3,
  },
  langBtn: {
    minWidth: 46,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: Colors.textDark,
  },
  langText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  langTextActive: {
    color: Colors.accent,
  },
});

