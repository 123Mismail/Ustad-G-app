import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

export default function EditProfileScreen({ navigation }) {
  const { language } = useLanguage();
  const { user, updateUser } = useAuth();

  const [name, setName]   = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity]   = useState(user?.city  || '');
  const [area, setArea]   = useState(user?.area  || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(
        language === 'ur' ? 'خطا' : 'Validation Error',
        language === 'ur' ? 'نام خالی نہیں ہو سکتا' : 'Name cannot be empty.'
      );
      return;
    }

    setSaving(true);
    try {
      await updateUser({ name: name.trim(), email: email.trim() || null, city: city.trim(), area: area.trim() });
      if (Platform.OS === 'web') {
        alert(language === 'ur' ? 'پروفائل کامیابی سے محفوظ ہو گئی!' : 'Profile saved successfully!');
        navigation.goBack();
      } else {
        Alert.alert(
          language === 'ur' ? '✅ کامیاب' : '✅ Success',
          language === 'ur' ? 'پروفائل کامیابی سے محفوظ ہو گئی!' : 'Profile updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (e) {
      Alert.alert(
        language === 'ur' ? 'خطا' : 'Error',
        e?.response?.data?.detail || (language === 'ur' ? 'تبدیلی محفوظ نہ ہو سکی۔' : 'Could not save changes. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };



  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader
        title={language === 'ur' ? 'پروفائل ترمیم' : 'Edit Profile'}
        showBack={true}
        rightElement={
          saving ? (
            <ActivityIndicator size="small" color={Colors.accent} />
          ) : (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveBtn}>{language === 'ur' ? 'محفوظ کریں' : 'Save'}</Text>
            </TouchableOpacity>
          )
        }
      />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Avatar area */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>
              {name ? name.substring(0, 2).toUpperCase() : 'UG'}
            </Text>
          </View>
          <Text style={styles.avatarHint}>
            {language === 'ur' ? 'آپ کا نام ابتداء سے تصویر بنتی ہے' : 'Avatar is generated from your name initials'}
          </Text>
        </View>

        {/* Fields */}
        <View style={styles.fieldsCard}>
          <Field
            label={language === 'ur' ? 'پورا نام' : 'Full Name'}
            value={name}
            onChangeText={setName}
            placeholder={language === 'ur' ? 'آپ کا نام درج کریں' : 'Enter your full name'}
          />
          <View style={styles.divider} />
          <Field
            label={language === 'ur' ? 'ای میل' : 'Email'}
            value={email}
            onChangeText={setEmail}
            placeholder={language === 'ur' ? 'آپ کی ای میل (اختیاری)' : 'Enter email (optional)'}
            keyboardType="email-address"
          />
          <View style={styles.divider} />
          <Field
            label={language === 'ur' ? 'شہر' : 'City'}
            value={city}
            onChangeText={setCity}
            placeholder={language === 'ur' ? 'مثال: کراچی' : 'e.g. Karachi'}
          />
          <View style={styles.divider} />
          <Field
            label={language === 'ur' ? 'علاقہ' : 'Area'}
            value={area}
            onChangeText={setArea}
            placeholder={language === 'ur' ? 'مثال: گلشن اقبال' : 'e.g. Gulshan-e-Iqbal'}
          />
        </View>

        <Text style={styles.note}>
          <Feather name="info" size={12} color={Colors.textMuted} />
          {' '}{language === 'ur' ? 'فون نمبر تبدیل نہیں کیا جا سکتا۔' : 'Phone number cannot be changed after registration.'}
        </Text>

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.textDark} />
          ) : (
            <Text style={styles.saveButtonText}>
              {language === 'ur' ? '✅ پروفائل محفوظ کریں' : '✅ Save Profile'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const Field = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgPrimary },
  container: { paddingBottom: 48 },
  saveBtn: {
    color: Colors.accent,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  initials: {
    fontFamily: Typography.header.fontFamily,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textDark,
  },
  avatarHint: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  fieldsCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  fieldContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  label: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  input: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    color: Colors.textDark,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 20,
  },
  note: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 16,
    marginHorizontal: 24,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: Colors.accent,
    marginHorizontal: 20,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
  },
});
