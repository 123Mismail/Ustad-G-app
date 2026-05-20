import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useLanguage } from '../App';
import PageHeader from '../components/PageHeader';

const PAYMENT_METHODS = [
  {
    id: 'cod',
    icon: 'dollar-sign',
    titleEn: 'Cash on Delivery',
    titleUr: 'نقد ادائیگی (گھر پر)',
    descEn: 'Pay directly to the service provider when work is completed.',
    descUr: 'کام مکمل ہونے پر فراہم کنندہ کو براہ راست نقد ادائیگی کریں۔',
    active: true,
  },
  {
    id: 'easypaisa',
    icon: 'smartphone',
    titleEn: 'Easypaisa',
    titleUr: 'ایزی پیسہ',
    descEn: 'Mobile wallet payment via Easypaisa. Coming soon!',
    descUr: 'ایزی پیسہ کے ذریعے موبائل ادائیگی — جلد آ رہا ہے!',
    active: false,
  },
  {
    id: 'jazzcash',
    icon: 'credit-card',
    titleEn: 'JazzCash',
    titleUr: 'جاز کیش',
    descEn: 'Mobile wallet payment via JazzCash. Coming soon!',
    descUr: 'جاز کیش کے ذریعے موبائل ادائیگی — جلد آ رہا ہے!',
    active: false,
  },
];

export default function PaymentMethodsScreen({ navigation }) {
  const { language } = useLanguage();
  const [selected, setSelected] = useState('cod');

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader
        title={language === 'ur' ? 'ادائیگی کے طریقے' : 'Payment Methods'}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.sectionHint}>
          {language === 'ur'
            ? 'اپنی پسندیدہ ادائیگی کا طریقہ منتخب کریں۔'
            : 'Select your preferred payment method.'}
        </Text>

        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.card,
              selected === method.id && styles.cardSelected,
              !method.active && styles.cardDisabled,
            ]}
            onPress={() => method.active && setSelected(method.id)}
            activeOpacity={method.active ? 0.8 : 1}
          >
            <View style={[styles.iconBox, selected === method.id && styles.iconBoxSelected]}>
              <Feather name={method.icon} size={22} color={selected === method.id ? Colors.textDark : Colors.accent} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodTitle, !method.active && styles.textDisabled]}>
                {language === 'ur' ? method.titleUr : method.titleEn}
              </Text>
              <Text style={styles.methodDesc}>
                {language === 'ur' ? method.descUr : method.descEn}
              </Text>
            </View>
            <View style={styles.radioOuter}>
              {method.active && selected === method.id && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Feather name="shield" size={16} color={Colors.accent} />
          <Text style={styles.infoText}>
            {language === 'ur'
              ? 'تمام لین دین محفوظ اور شفاف ہیں۔ کوئی پوشیدہ فیس نہیں۔'
              : 'All transactions are safe and transparent. No hidden charges.'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgPrimary },
  container: { padding: 20, paddingBottom: 48 },
  sectionHint: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#C1FF7208',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C1FF7215',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconBoxSelected: {
    backgroundColor: Colors.accent,
  },
  methodInfo: { flex: 1 },
  methodTitle: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  textDisabled: { color: Colors.textMuted },
  methodDesc: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: '#C1FF7210',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#C1FF7230',
  },
  infoText: {
    flex: 1,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
  },
});
