import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Platform, Animated, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

export default function AIChatCard({ value, onChangeText }) {
  const [isFocused, setIsFocused] = useState(false);
  const navigation = useNavigation();
  const { language } = useLanguage();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleSend = () => {
    navigation.navigate('Results');
    if (onChangeText) onChangeText('');
  };

  return (
    <View style={[
      styles.card, 
      isFocused && styles.cardFocused
    ]}>
      <TextInput
        style={[styles.input, getStyle('body', language)]}
        placeholder={t('chat_hint', language)}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel="Chat input"
        {...(Platform.OS === 'web' && { outlineStyle: 'none' })}
      />
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable 
          style={styles.sendBtn} 
          onPress={handleSend}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Feather name="arrow-right" size={24} color={Colors.textDark} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 120,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardFocused: {
    borderColor: Colors.accent + '80',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    height: 40,
    marginRight: 12,
    textAlignVertical: 'center',
    verticalAlign: 'middle',
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendBtn: {
    backgroundColor: Colors.accent,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
