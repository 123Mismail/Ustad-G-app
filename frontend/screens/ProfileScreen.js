import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import ProfileHeader from '../components/ProfileHeader';
import SettingsRow from '../components/SettingsRow';
import PageHeader from '../components/PageHeader';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { language, setLanguage, userRole, setUserRole } = useLanguage();

  const handleMockPress = (feature) => {
    Alert.alert(
      t(feature, language),
      t('feature_coming_soon', language),
      [{ text: 'OK' }]
    );
  };

  const toggleDeveloperMode = () => {
    const newRole = userRole === 'admin' ? 'user' : 'admin';
    setUserRole(newRole);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader 
        title={t('profile_title', language)} 
        rightElement={
          <TouchableOpacity style={styles.headerIconBox}>
            <Feather name="settings" size={18} color={Colors.accent} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        
        <ProfileHeader />

        <View style={styles.section}>
          <SettingsRow 
            icon="map-pin" 
            title={t('saved_addresses', language)} 
            onPress={() => handleMockPress('saved_addresses')}
          />
          <SettingsRow 
            icon="credit-card" 
            title={t('payment_methods', language)} 
            onPress={() => handleMockPress('payment_methods')}
          />
        </View>

        <View style={styles.section}>
          <SettingsRow 
            icon="globe" 
            title={t('language', language)} 
            rightWidget={<LanguageToggle />} 
          />
          <SettingsRow 
            icon="bell" 
            title={t('notifications', language)} 
            onPress={() => handleMockPress('notifications')}
          />
        </View>

        {/* Developer Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dev_settings', language)}</Text>
          <SettingsRow 
            icon="code" 
            title={t('developer_mode', language)} 
            rightWidget={
              <Switch 
                value={userRole === 'admin'} 
                onValueChange={toggleDeveloperMode}
                trackColor={{ false: Colors.bgSecondary, true: Colors.accent }}
                thumbColor={userRole === 'admin' ? Colors.textDark : '#f4f3f4'}
              />
            } 
          />
        </View>

        <View style={styles.section}>
          <SettingsRow 
            icon="help-circle" 
            title={t('help_center', language)} 
            onPress={() => handleMockPress('help_center')}
          />
          <SettingsRow 
            icon="shield" 
            title={t('privacy_policy', language)} 
            onPress={() => handleMockPress('privacy_policy')}
          />
        </View>

        <View style={styles.section}>
          <SettingsRow 
            icon="log-out" 
            title={t('log_out', language)} 
            color="#F44336" 
            onPress={() => Alert.alert(t('log_out', language), t('logout_confirm', language))}
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 8,
    padding: 4,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: Colors.textDark,
  },
  langText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  langTextActive: {
    color: Colors.accent,
  }
});
