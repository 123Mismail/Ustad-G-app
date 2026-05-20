/**
 * RegisterScreen.js — New user registration screen.
 * FIXED: Field component defined OUTSIDE to prevent re-mount on every keystroke.
 */
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
import { useAuth } from '../context/AuthContext';

// ── Field component defined OUTSIDE the screen to avoid remount on every keystroke ──
const Field = ({ icon, label, placeholder, value, onChangeText, keyboardType, secure, showPass, onTogglePass, autoCapitalize, error, onBlur, autoComplete, textContentType }) => (
  <View>
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
        secureTextEntry={secure && !showPass}
        autoCapitalize={autoCapitalize || 'none'}
        onBlur={onBlur}
        autoComplete={autoComplete}
        textContentType={textContentType}
      />
      {secure && (
        <TouchableOpacity 
          onPress={onTogglePass} 
          style={fieldStyles.eyeBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name={showPass ? 'eye-off' : 'eye'} size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
    {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
  </View>
);

const fieldStyles = StyleSheet.create({
  label: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
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
  eyeBtn: { padding: 4 },
  inputRowError: {
    borderColor: '#FF4D4D',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Typography.body.fontFamily,
  },
});

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();

  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [email,    setEmail]    = useState('');
  const [city,     setCity]     = useState('Karachi');
  const [area,     setArea]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [nameError,     setNameError]     = useState('');
  const [phoneError,    setPhoneError]    = useState('');
  const [emailError,    setEmailError]    = useState('');
  const [areaError,     setAreaError]     = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError,      setApiError]      = useState('');

  const btnScale = useRef(new Animated.Value(1)).current;
  function onPressIn()  { Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: Platform.OS !== 'web' }).start(); }
  function onPressOut() { Animated.spring(btnScale, { toValue: 1,    useNativeDriver: Platform.OS !== 'web' }).start(); }

  const formatPakistanPhone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      return cleaned;
    }
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 11)}`;
  };

  const validateName = (text) => {
    if (!text.trim()) {
      setNameError('Name is required');
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
      setPhoneError('Enter a valid 11-digit phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateEmail = (text) => {
    if (text.trim() && !/\S+@\S+\.\S+/.test(text.trim())) {
      setEmailError('Enter a valid email address');
      return false;
    }
    setEmailError('');
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

  const validatePassword = (text) => {
    if (!text) {
      setPasswordError('Password is required');
      return false;
    }
    if (text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  async function handleRegister() {
    setApiError('');
    const isNameValid = validateName(name);
    const isPhoneValid = validatePhone(phone);
    const isEmailValid = validateEmail(email);
    const isAreaValid = validateArea(area);
    const isPasswordValid = validatePassword(password);

    if (!isNameValid || !isPhoneValid || !isEmailValid || !isAreaValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        phone: phone.replace(/\D/g, ''), // Send clean number to backend
        email: email.trim(),
        city: city.trim(),
        area: area.trim(),
        password
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setApiError(msg);
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
        {/* ── Dark Hero Header ─────────────────────────────── */}
        <View style={styles.hero}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Create Account</Text>
          <Text style={styles.heroSubtitle}>Join UstadG — Pakistan's expert booking platform</Text>
        </View>

        {/* ── White Form Card ──────────────────────────────── */}
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {/* Progress dots */}
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>

          {apiError ? (
            <View style={styles.apiErrorBanner}>
              <Feather name="alert-circle" size={16} color="#FF4D4D" style={{ marginRight: 8 }} />
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          ) : null}

          <Field
            icon="user" label="Full Name"
            placeholder="e.g. Muhammad Ali"
            value={name} 
            onChangeText={(text) => {
              setApiError('');
              setName(text);
              if (nameError) validateName(text);
            }}
            onBlur={() => validateName(name)}
            error={nameError}
            autoCapitalize="words"
            autoComplete="name"
          />
          <Field
            icon="phone" label="Phone Number"
            placeholder="e.g. 0300-1234567"
            value={phone} 
            onChangeText={(text) => {
              setApiError('');
              const formatted = formatPakistanPhone(text);
              setPhone(formatted);
              if (phoneError) validatePhone(formatted);
            }}
            onBlur={() => validatePhone(phone)}
            error={phoneError}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <Field
            icon="mail" label="Email (optional)"
            placeholder="e.g. ali@example.com"
            value={email} 
            onChangeText={(text) => {
              setApiError('');
              setEmail(text);
              if (emailError) validateEmail(text);
            }}
            onBlur={() => validateEmail(email)}
            error={emailError}
            keyboardType="email-address"
            autoComplete="email"
          />

          {/* City + Area side by side */}
          <View style={styles.row}>
            <View style={styles.rowHalf}>
              <Field
                icon="map" label="City"
                placeholder="Karachi"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
                autoComplete="address-level2"
              />
            </View>
            <View style={styles.rowHalf}>
              <Field
                icon="map-pin" label="Area"
                placeholder="Gulshan"
                value={area}
                onChangeText={(text) => {
                  setApiError('');
                  setArea(text);
                  if (areaError) validateArea(text);
                }}
                onBlur={() => validateArea(area)}
                error={areaError}
                autoCapitalize="words"
                autoComplete="street-address"
              />
            </View>
          </View>

          <Field
            icon="lock" label="Password"
            placeholder="Min. 6 characters"
            value={password} 
            onChangeText={(text) => {
              setApiError('');
              setPassword(text);
              if (passwordError) validatePassword(text);
            }}
            onBlur={() => validatePassword(password)}
            error={passwordError}
            secure 
            showPass={showPass} 
            onTogglePass={() => setShowPass(p => !p)}
            autoComplete="new-password"
            textContentType="password"
          />

          {/* Submit */}
          <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 32 }}>
            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
              onPress={handleRegister}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}
              activeOpacity={1}
            >
              {loading
                ? (isSuccess
                  ? (
                    <View style={styles.registerBtnInner}>
                      <Text style={styles.registerBtnText}>Success! Redirecting...</Text>
                      <Feather name="check" size={18} color={Colors.cardBg} />
                    </View>
                  )
                  : <ActivityIndicator color={Colors.cardBg} />
                )
                : (
                  <View style={styles.registerBtnInner}>
                    <Text style={styles.registerBtnText}>Create Account</Text>
                    <Feather name="arrow-right" size={18} color={Colors.cardBg} />
                  </View>
                )
              }
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
              Already have an account?{'  '}
              <Text style={styles.loginHighlight}>Login →</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cardBg },
  flex: { flex: 1 },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: Colors.cardBg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontFamily: Typography.header.fontFamily,
    fontSize: 30, fontWeight: '800', color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13, color: '#FFFFFF60', marginTop: 6,
  },
  card: { flex: 1, backgroundColor: Colors.bgPrimary },
  cardContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 80 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
  stepDotActive: { width: 24, borderRadius: 4, backgroundColor: Colors.cardBg },
  stepLine: { flex: 1, height: 2, backgroundColor: '#EFEFEF', marginHorizontal: 4 },
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
  loginLink: { marginTop: 24, alignItems: 'center' },
  loginText: { fontFamily: Typography.body.fontFamily, fontSize: 14, color: Colors.textMuted },
  loginHighlight: { color: Colors.textDark, fontWeight: '700' },
  apiErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4D4D12',
    borderWidth: 1,
    borderColor: '#FF4D4D25',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  apiErrorText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: '#FF4D4D',
    flex: 1,
  },
});
