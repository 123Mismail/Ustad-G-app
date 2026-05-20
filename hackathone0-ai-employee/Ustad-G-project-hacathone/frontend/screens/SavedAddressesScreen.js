import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useLanguage } from '../App';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

export default function SavedAddressesScreen({ navigation }) {
  const { language } = useLanguage();
  const { user, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [city, setCity] = useState(user?.city || '');
  const [area, setArea] = useState(user?.area || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!city.trim() || !area.trim()) {
      Alert.alert(
        language === 'ur' ? 'خطا' : 'Error',
        language === 'ur' ? 'شہر اور علاقہ لازمی ہے۔' : 'City and area are required.'
      );
      return;
    }
    setSaving(true);
    try {
      await updateUser({ city: city.trim(), area: area.trim() });
      setEditing(false);
    } catch (e) {
      Alert.alert(
        language === 'ur' ? 'خطا' : 'Error',
        language === 'ur' ? 'تبدیلی محفوظ نہ ہو سکی۔' : 'Could not save. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader
        title={language === 'ur' ? 'محفوظ پتے' : 'Saved Addresses'}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.card}>
          {/* Header row */}
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Feather name="map-pin" size={20} color={Colors.textDark} />
            </View>
            <Text style={styles.cardTitle}>
              {language === 'ur' ? 'گھر کا پتہ' : 'Home Address'}
            </Text>
            <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.editBtn}>
              <Feather name={editing ? 'x' : 'edit-2'} size={16} color={Colors.accent} />
            </TouchableOpacity>
          </View>

          {editing ? (
            // Edit mode
            <View style={styles.editFields}>
              <Text style={styles.fieldLabel}>{language === 'ur' ? 'شہر' : 'City'}</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder={language === 'ur' ? 'مثال: کراچی' : 'e.g. Karachi'}
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.fieldLabel}>{language === 'ur' ? 'علاقہ' : 'Area / Neighbourhood'}</Text>
              <TextInput
                style={styles.input}
                value={area}
                onChangeText={setArea}
                placeholder={language === 'ur' ? 'مثال: گلشن اقبال' : 'e.g. Gulshan-e-Iqbal'}
                placeholderTextColor={Colors.textMuted}
              />
              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving
                  ? <ActivityIndicator size="small" color={Colors.textDark} />
                  : <Text style={styles.saveButtonText}>{language === 'ur' ? 'محفوظ کریں' : 'Save Address'}</Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            // View mode
            <View style={styles.addressDisplay}>
              <Text style={styles.addressLine}>
                <Text style={styles.addressLabel}>{language === 'ur' ? 'علاقہ: ' : 'Area: '}</Text>
                {user?.area || '—'}
              </Text>
              <Text style={styles.addressLine}>
                <Text style={styles.addressLabel}>{language === 'ur' ? 'شہر: ' : 'City: '}</Text>
                {user?.city || '—'}
              </Text>
            </View>
          )}
        </View>

        {/* Info note */}
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color={Colors.accent} style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>
            {language === 'ur'
              ? 'یہ پتہ سروس بکنگ کے دوران خودکار استعمال ہوگا۔'
              : 'This address will be used automatically during service booking.'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgPrimary },
  container: { padding: 20, paddingBottom: 48 },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
  },
  editBtn: {
    padding: 8,
  },
  addressDisplay: { marginTop: 4 },
  addressLine: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    color: Colors.textDark,
    marginBottom: 6,
  },
  addressLabel: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  editFields: { marginTop: 4 },
  fieldLabel: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    color: Colors.textDark,
  },
  saveButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#C1FF7210',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C1FF7230',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
  },
});
