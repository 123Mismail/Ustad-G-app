import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, LayoutAnimation
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useLanguage } from '../App';
import PageHeader from '../components/PageHeader';

const FAQS = [
  {
    id: 'q1',
    qEn: 'How do I book a service?',
    qUr: 'سروس کیسے بک کریں؟',
    aEn: 'Go to the Chat tab, describe the service you need (e.g., "I need a plumber"), and our AI agent will find nearby providers, negotiate a price, and confirm the booking for you.',
    aUr: 'چیٹ ٹیب میں جائیں، اپنی ضرورت بتائیں (مثلاً "مجھے پلمبر چاہیے")، ہمارا AI ایجنٹ قریبی فراہم کنندہ ڈھونڈے گا، قیمت طے کرے گا، اور بکنگ کی تصدیق کرے گا۔',
  },
  {
    id: 'q2',
    qEn: 'How does pricing work?',
    qUr: 'قیمت کیسے طے ہوتی ہے؟',
    aEn: 'Our AI agent negotiates the best possible price directly with the provider before confirming the booking. You will always see the agreed price before your booking is confirmed.',
    aUr: 'ہمارا AI ایجنٹ بکنگ کی تصدیق سے پہلے فراہم کنندہ کے ساتھ بہترین قیمت پر بات کرتا ہے۔ بکنگ کی تصدیق سے پہلے آپ کو متفقہ قیمت دکھائی جائے گی۔',
  },
  {
    id: 'q3',
    qEn: 'Can I cancel a booking?',
    qUr: 'کیا میں بکنگ منسوخ کر سکتا ہوں؟',
    aEn: 'Yes, you can cancel by contacting the provider directly via their phone number shown in your Booking History. Future versions will include in-app cancellation.',
    aUr: 'ہاں، آپ بکنگ ہسٹری میں فراہم کنندہ کے فون نمبر پر براہ راست رابطہ کر کے منسوخ کر سکتے ہیں۔ آنے والے ورژن میں ان ایپ منسوخی کا آپشن شامل ہوگا۔',
  },
  {
    id: 'q4',
    qEn: 'How do I pay for services?',
    qUr: 'سروس کی ادائیگی کیسے کریں؟',
    aEn: 'Currently we support Cash on Delivery — you pay the provider directly when the work is done. Easypaisa and JazzCash support is coming soon.',
    aUr: 'فی الحال ہم نقد ادائیگی (گھر پر) کی سہولت دیتے ہیں — آپ کام مکمل ہونے پر فراہم کنندہ کو براہ راست ادائیگی کرتے ہیں۔ ایزی پیسہ اور جاز کیش جلد آ رہے ہیں۔',
  },
  {
    id: 'q5',
    qEn: 'Can I search in Urdu?',
    qUr: 'کیا میں اردو میں تلاش کر سکتا ہوں؟',
    aEn: 'Yes! Our AI understands both English and Urdu. You can type "پلمبر" or "بجلی والا" and the system will find the right providers automatically.',
    aUr: 'جی ہاں! ہمارا AI انگریزی اور اردو دونوں سمجھتا ہے۔ آپ "پلمبر" یا "بجلی والا" لکھ سکتے ہیں، سسٹم خود بخود صحیح فراہم کنندہ ڈھونڈ لے گا۔',
  },
  {
    id: 'q6',
    qEn: 'How do I update my profile?',
    qUr: 'میں اپنی پروفائل کیسے تبدیل کروں؟',
    aEn: 'Go to the Profile tab and tap the pencil (edit) icon next to your name, or tap "Saved Addresses" to update your city and area.',
    aUr: 'پروفائل ٹیب میں جائیں اور اپنے نام کے پاس پنسل (ترمیم) آئیکن پر ٹیپ کریں، یا "محفوظ پتے" پر ٹیپ کریں۔',
  },
];

export default function HelpCenterScreen({ navigation }) {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => prev === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader
        title={language === 'ur' ? 'مدد مرکز' : 'Help Center'}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.container}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Feather name="help-circle" size={28} color={Colors.accent} />
          </View>
          <Text style={styles.heroTitle}>
            {language === 'ur' ? 'اکثر پوچھے گئے سوالات' : 'Frequently Asked Questions'}
          </Text>
          <Text style={styles.heroSub}>
            {language === 'ur'
              ? 'اگر آپ کا سوال یہاں نہیں ہے تو نیچے سے رابطہ کریں۔'
              : "Can't find your answer? Contact us below."}
          </Text>
        </View>

        {/* FAQ List */}
        {FAQS.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqCard}
            onPress={() => toggle(faq.id)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ}>
                {language === 'ur' ? faq.qUr : faq.qEn}
              </Text>
              <Feather
                name={expanded === faq.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.accent}
              />
            </View>
            {expanded === faq.id && (
              <Text style={styles.faqA}>
                {language === 'ur' ? faq.aUr : faq.aEn}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contact Banner */}
        <View style={styles.contactBanner}>
          <Feather name="phone" size={18} color={Colors.accent} />
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>
              {language === 'ur' ? 'مزید مدد چاہیے؟' : 'Still need help?'}
            </Text>
            <Text style={styles.contactSub}>
              {language === 'ur'
                ? 'ہمیں واٹس ایپ پر میسج کریں: +92 355 2525252'
                : 'WhatsApp us: +92 355 2525252'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgPrimary },
  container: { padding: 20, paddingBottom: 48 },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 8,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#C1FF7215',
    borderWidth: 1,
    borderColor: '#C1FF7230',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: Typography.header.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  faqCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQ: {
    flex: 1,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginRight: 12,
    lineHeight: 22,
  },
  faqA: {
    marginTop: 12,
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 12,
  },
  contactBanner: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#C1FF7210',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#C1FF7230',
  },
  contactText: { flex: 1 },
  contactTitle: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  contactSub: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
  },
});
