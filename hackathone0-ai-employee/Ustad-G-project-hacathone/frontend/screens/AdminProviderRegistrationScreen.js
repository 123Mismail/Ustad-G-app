import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView, Animated, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { createProvider } from '../services/admin.service';
import PageHeader from '../components/PageHeader';

const Field = ({ icon, label, placeholder, value, onChangeText, keyboardType, autoCapitalize, error, onBlur }) => (
  <View style={fieldStyles.container}>
    <Text style={fieldStyles.label}>{label}</Text>
    <View style={[fieldStyles.inputRow, error ? fieldStyles.inputRowError : null]}>
      <Feather name={icon} size={18} color={Colors.textMuted} style={fieldStyles.inputIcon} />
      <TextInput
        style={fieldStyles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'none'}
        onBlur={onBlur}
      />
    </View>
    {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
  </View>
);

const fieldStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: Typography.body.fontFamily,
    fontSize: 15,
    color: Colors.textDark,
  },
  inputRowError: {
    borderColor: '#FF4D4D',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Typography.body.fontFamily,
  },
});

export default function AdminProviderRegistrationScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [city, setCity] = useState('Karachi');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('1000');

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serviceError, setServiceError] = useState('');
  const [cityError, setCityError] = useState('');
  const [areaError, setAreaError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [priceError, setPriceError] = useState('');

  const btnScale = useRef(new Animated.Value(1)).current;
  function onPressIn() { Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: Platform.OS !== 'web' }).start(); }
  function onPressOut() { Animated.spring(btnScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start(); }

  const formatPakistanPhone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      return cleaned;
    }
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 11)}`;
  };

  const validateName = (text) => {
    if (!text.trim()) {
      setNameError('Provider name is required');
      return false;
    }
    setNameError('');
    return true;
  };

  const validatePhone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (cleaned.length < 11) {
      setPhoneError('Enter a valid 11-digit number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateEmail = (text) => {
    if (text.trim() && !/\S+@\S+\.\S+/.test(text.trim())) {
      setEmailError('Enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateService = (text) => {
    if (!text.trim()) {
      setServiceError('Service type is required');
      return false;
    }
    setServiceError('');
    return true;
  };

  const validateCity = (text) => {
    if (!text.trim()) {
      setCityError('City is required');
      return false;
    }
    setCityError('');
    return true;
  };

  const validateArea = (text) => {
    if (!text.trim()) {
      setAreaError('Area is required');
      return false;
    }
    setAreaError('');
    return true;
  };

  const validateAddress = (text) => {
    if (!text.trim()) {
      setAddressError('Address is required');
      return false;
    }
    setAddressError('');
    return true;
  };

  const validatePrice = (text) => {
    if (!text.trim()) {
      setPriceError('Price is required');
      return false;
    }
    if (isNaN(text) || parseInt(text, 10) <= 0) {
      setPriceError('Enter a valid price');
      return false;
    }
    setPriceError('');
    return true;
  };

  async function handleRegister() {
    const isNameValid = validateName(name);
    const isPhoneValid = validatePhone(phone);
    const isEmailValid = validateEmail(email);
    const isServiceValid = validateService(serviceType);
    const isCityValid = validateCity(city);
    const isAreaValid = validateArea(area);
    const isAddressValid = validateAddress(address);
    const isPriceValid = validatePrice(price);

    if (!isNameValid || !isPhoneValid || !isEmailValid || !isServiceValid || !isCityValid || !isAreaValid || !isAddressValid || !isPriceValid) {
      return;
    }

    setLoading(true);
    try {
      await createProvider({
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim() || undefined,
        service_type: serviceType.trim().toLowerCase(),
        city: city.trim(),
        area: area.trim(),
        address: address.trim(),
        price: parseInt(price, 10),
      });

      setIsSuccess(true);
      Alert.alert('Success', 'Provider registered successfully!');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', msg);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.cardBg} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <PageHeader title="Register Provider" showBack={true} />

        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {/* Section 1: Basic Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="user" size={16} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>
            <Field
              icon="user" label="Provider Name" placeholder="e.g. Ustad Ali"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) validateName(text);
              }}
              onBlur={() => validateName(name)}
              error={nameError}
              autoCapitalize="words"
            />
            <Field
              icon="phone" label="Phone Number" placeholder="e.g. 0300-1234567"
              value={phone}
              onChangeText={(text) => {
                const formatted = formatPakistanPhone(text);
                setPhone(formatted);
                if (phoneError) validatePhone(formatted);
              }}
              onBlur={() => validatePhone(phone)}
              error={phoneError}
              keyboardType="phone-pad"
            />
            <Field
              icon="mail" label="Email (Optional)" placeholder="e.g. ali@provider.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              onBlur={() => validateEmail(email)}
              error={emailError}
              keyboardType="email-address"
            />
          </View>

          {/* Section 2: Service & Pricing */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="tool" size={16} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Service & Pricing</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.rowHalf}>
                <Field
                  icon="tag" label="Service Type" placeholder="e.g. plumber"
                  value={serviceType}
                  onChangeText={(text) => {
                    setServiceType(text);
                    if (serviceError) validateService(text);
                  }}
                  onBlur={() => validateService(serviceType)}
                  error={serviceError}
                />
              </View>
              <View style={styles.rowHalf}>
                <Field
                  icon="dollar-sign" label="Base Price (PKR)" placeholder="1000"
                  value={price}
                  onChangeText={(text) => {
                    setPrice(text);
                    if (priceError) validatePrice(text);
                  }}
                  onBlur={() => validatePrice(price)}
                  error={priceError}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Section 3: Location Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="map-pin" size={16} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Location Details</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.rowHalf}>
                <Field
                  icon="map" label="City" placeholder="Karachi"
                  value={city}
                  onChangeText={(text) => {
                    setCity(text);
                    if (cityError) validateCity(text);
                  }}
                  onBlur={() => validateCity(city)}
                  error={cityError}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.rowHalf}>
                <Field
                  icon="map-pin" label="Area" placeholder="e.g. Gulshan"
                  value={area}
                  onChangeText={(text) => {
                    setArea(text);
                    if (areaError) validateArea(text);
                  }}
                  onBlur={() => validateArea(area)}
                  error={areaError}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <Field
              icon="home" label="Full Address" placeholder="e.g. Shop 42, Block 13-C"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (addressError) validateAddress(text);
              }}
              onBlur={() => validateAddress(address)}
              error={addressError}
              autoCapitalize="words"
            />
          </View>

          <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 24 }}>
            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
              onPress={handleRegister}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading || isSuccess}
              activeOpacity={1}
            >
              {loading
                ? (isSuccess
                  ? (
                    <View style={styles.registerBtnInner}>
                      <Text style={styles.registerBtnText}>Provider Created!</Text>
                      <Feather name="check" size={18} color={Colors.cardBg} />
                    </View>
                  )
                  : <ActivityIndicator color={Colors.cardBg} />
                )
                : (
                  <View style={styles.registerBtnInner}>
                    <Text style={styles.registerBtnText}>Register Provider</Text>
                    <Feather name="user-plus" size={18} color={Colors.cardBg} />
                  </View>
                )
              }
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  flex: { flex: 1 },
  card: { flex: 1, backgroundColor: Colors.bgPrimary },
  cardContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 80 },
  row: { flexDirection: 'row', gap: 12 },
  rowHalf: { flex: 1 },
  registerBtn: {
    backgroundColor: Colors.accent, borderRadius: 16, height: 58,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  registerBtnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  registerBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  registerBtnText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: '700', fontSize: 17, color: Colors.cardBg,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Typography.header.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
});
