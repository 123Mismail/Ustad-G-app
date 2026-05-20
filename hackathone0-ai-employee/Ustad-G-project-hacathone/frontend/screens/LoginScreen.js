/**
 * LoginScreen.js — Phone + password login screen.
 * Matches the UstadG design system: dark hero top, white form body, lime accent.
 * Unified with RegisterScreen UI structure.
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
export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');

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

  const validatePassword = (text) => {
    if (!text) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  async function handleLogin() {
    setApiError('');
    const isPhoneValid = validatePhone(phone);
    const isPasswordValid = validatePassword(password);

    if (!isPhoneValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      await login(phone.replace(/\D/g, ''), password);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please try again.';
      setApiError(msg);
    } finally {
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
          <Text style={styles.heroTitle}>Welcome Back</Text>
          <Text style={styles.heroSubtitle}>UstadG — اپنا کام کروائیں — Book Your Expert</Text>
        </View>

        {/* ── White Form Card ──────────────────────────────── */}
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {apiError ? (
            <View style={styles.apiErrorBanner}>
              <Feather name="alert-circle" size={16} color="#FF4D4D" style={{ marginRight: 8 }} />
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          ) : null}

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
            icon="lock" label="Password"
            placeholder="Enter your password"
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
            autoComplete="current-password"
            textContentType="password"
          />

          {/* Login Button */}
          <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 32 }}>
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}
              activeOpacity={1}
            >
              {loading
                ? <ActivityIndicator color={Colors.cardBg} />
                : (
                  <View style={styles.loginBtnInner}>
                    <Text style={styles.loginBtnText}>Login</Text>
                    <Feather name="arrow-right" size={18} color={Colors.cardBg} />
                  </View>
                )
              }
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Link */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Don't have an account?{'  '}
              <Text style={styles.registerHighlight}>Register →</Text>
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
    paddingTop: 40,
    paddingBottom: 28,
    backgroundColor: Colors.cardBg,
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
  loginBtn: {
    backgroundColor: Colors.accent, borderRadius: 16, height: 58,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  loginBtnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  loginBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginBtnText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: '700', fontSize: 17, color: Colors.cardBg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EFEFEF' },
  dividerText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: Colors.textMuted,
  },
  registerLink: { marginTop: 24, alignItems: 'center' },
  registerText: { fontFamily: Typography.body.fontFamily, fontSize: 14, color: Colors.textMuted },
  registerHighlight: { color: Colors.textDark, fontWeight: '700' },
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
