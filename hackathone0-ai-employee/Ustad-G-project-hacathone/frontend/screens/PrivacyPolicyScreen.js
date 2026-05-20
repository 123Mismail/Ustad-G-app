import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useLanguage } from '../App';
import PageHeader from '../components/PageHeader';

const SECTIONS = [
  {
    id: 's1',
    icon: 'database',
    titleEn: '1. Information We Collect',
    titleUr: '۱. ہم کیا معلومات جمع کرتے ہیں',
    bodyEn: `We collect the information you provide when registering: your name, phone number, email address, city, and area. When you book services through the AI chat, we store the booking details including service type, provider information, and confirmation codes.`,
    bodyUr: `ہم وہ معلومات جمع کرتے ہیں جو آپ رجسٹریشن کے وقت فراہم کرتے ہیں: نام، فون نمبر، ای میل، شہر اور علاقہ۔ جب آپ AI چیٹ کے ذریعے بکنگ کرتے ہیں، تو ہم سروس کی قسم، فراہم کنندہ اور تصدیقی کوڈ محفوظ کرتے ہیں۔`,
  },
  {
    id: 's2',
    icon: 'cpu',
    titleEn: '2. How We Use Your Information',
    titleUr: '۲. ہم معلومات کیسے استعمال کرتے ہیں',
    bodyEn: `Your information is used to: process service bookings through our AI agent, match you with nearby service providers, send booking confirmations and push notifications, and improve our service recommendations over time.`,
    bodyUr: `آپ کی معلومات ان مقاصد کے لیے استعمال ہوتی ہے: AI ایجنٹ کے ذریعے بکنگ، قریبی فراہم کنندگان سے ملان، بکنگ تصدیق اور نوٹیفکیشن بھیجنا، اور سروس کے مشوروں کو بہتر بنانا۔`,
  },
  {
    id: 's3',
    icon: 'share-2',
    titleEn: '3. Third-Party Services',
    titleUr: '۳. تیسرے فریق کی خدمات',
    bodyEn: `UstadG uses Google Maps API for provider discovery, Google Calendar for appointment scheduling, and Google Sheets as a booking record backup. Your name and service request may be shared with your booked provider to complete your service. We do not sell your data to any third party.`,
    bodyUr: `UstadG گوگل میپس، گوگل کیلنڈر اور گوگل شیٹس استعمال کرتا ہے۔ آپ کا نام اور سروس کی درخواست بکنگ مکمل کرنے کے لیے فراہم کنندہ کو شیئر کی جا سکتی ہے۔ ہم کسی کو بھی آپ کا ڈیٹا فروخت نہیں کرتے۔`,
  },
  {
    id: 's4',
    icon: 'lock',
    titleEn: '4. Data Security',
    titleUr: '۴. ڈیٹا کی حفاظت',
    bodyEn: `Your password is stored as a hashed value using industry-standard bcrypt encryption. Your JWT access tokens are stored securely on your device. We use encrypted HTTPS connections for all API communications.`,
    bodyUr: `آپ کا پاس ورڈ bcrypt انکرپشن کے ذریعے محفوظ کیا جاتا ہے۔ JWT ٹوکن آپ کے ڈیوائس پر محفوظ طریقے سے رکھے جاتے ہیں۔ تمام API رابطے HTTPS پروٹوکول کے ذریعے انکرپٹڈ ہیں۔`,
  },
  {
    id: 's5',
    icon: 'trash-2',
    titleEn: '5. Your Rights',
    titleUr: '۵. آپ کے حقوق',
    bodyEn: `You can update your profile information at any time from the Profile screen. If you wish to delete your account and all associated data, please contact us at the support address below and we will process your request within 7 business days.`,
    bodyUr: `آپ پروفائل اسکرین سے کسی بھی وقت اپنی معلومات تازہ کر سکتے ہیں۔ اگر آپ اپنا اکاؤنٹ حذف کرنا چاہتے ہیں تو نیچے دیے گئے رابطے پر ہم سے رابطہ کریں۔`,
  },
  {
    id: 's6',
    icon: 'mail',
    titleEn: '6. Contact Us',
    titleUr: '۶. رابطہ',
    bodyEn: `For any privacy-related queries or data deletion requests, please contact: support@ustadg.pk or WhatsApp +92 355 2525252. Last updated: May 2026.`,
    bodyUr: `کسی بھی رازداری سے متعلق سوال یا ڈیٹا ڈیلیشن کی درخواست کے لیے رابطہ کریں: support@ustadg.pk یا واٹس ایپ +92 355 2525252۔ آخری اپڈیٹ: مئی ۲۰۲۶۔`,
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  const { language } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader
        title={language === 'ur' ? 'رازداری کی پالیسی' : 'Privacy Policy'}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.container}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Feather name="shield" size={28} color={Colors.accent} />
          </View>
          <Text style={styles.heroTitle}>
            {language === 'ur' ? 'UstadG رازداری پالیسی' : 'UstadG Privacy Policy'}
          </Text>
          <Text style={styles.heroSub}>
            {language === 'ur'
              ? 'آپ کی رازداری ہماری ترجیح ہے۔'
              : 'Your privacy is our priority.'}
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Feather name={section.icon} size={16} color={Colors.accent} />
              </View>
              <Text style={styles.sectionTitle}>
                {language === 'ur' ? section.titleUr : section.titleEn}
              </Text>
            </View>
            <Text style={styles.sectionBody}>
              {language === 'ur' ? section.bodyUr : section.bodyEn}
            </Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgPrimary },
  container: { padding: 20, paddingBottom: 56 },
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
  },
  section: {
    marginBottom: 20,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C1FF7215',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
  },
  sectionBody: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 21,
  },
});
