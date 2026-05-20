/**
 * AIChatCard.js — Premium AI chat input component.
 * Features: dark card, multi-line input, animated send button, agent status indicator.
 */
import React, { useState, useRef } from 'react';
import {
  View, TextInput, StyleSheet, Platform, Animated,
  Pressable, ActivityIndicator, Text, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, getStyle } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

export default function AIChatCard({ value, onChangeText, onSend, isLoading }) {
  const [isFocused, setIsFocused] = useState(false);
  const { language } = useLanguage();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const hasText = value && value.trim().length > 0;

  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();

  return (
    <View style={styles.wrapper}>
      {/* Agent status pill */}
      <View style={styles.agentPill}>
        <View style={styles.agentDot} />
        <Text style={styles.agentLabel}>UstadG AI • Online</Text>
      </View>

      {/* Main input card */}
      <View style={[styles.card, isFocused && styles.cardFocused]}>
        <View style={styles.inputArea}>
          {/* AI icon */}
          <View style={styles.aiIcon}>
            <Feather name="zap" size={16} color={Colors.accent} />
          </View>

          <TextInput
            style={[styles.input, getStyle && getStyle('body', language)]}
            placeholder={t('chat_hint', language) || 'Describe the service you need...'}
            placeholderTextColor={'#666'}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={500}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            accessibilityLabel="Chat input"
            {...(Platform.OS === 'web' && { outlineStyle: 'none' })}
          />
        </View>

        {/* Bottom bar: char count + send button */}
        <View style={styles.bottomBar}>
          <Text style={styles.hint}>
            {isLoading ? 'Agent is thinking...' : 'Press → to search providers'}
          </Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              style={[styles.sendBtn, (!hasText || isLoading) && styles.sendBtnDisabled]}
              onPress={onSend}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={!hasText || isLoading}
            >
              {isLoading
                ? <ActivityIndicator color={Colors.cardBg} size="small" />
                : <Feather name="arrow-right" size={20} color={Colors.cardBg} />
              }
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },

  // ── Agent Pill ────────────────────────────────────────
  agentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    gap: 6,
  },
  agentDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  agentLabel: {
    fontFamily: Typography.caption?.fontFamily || 'System',
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Card ──────────────────────────────────────────────
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardFocused: {
    borderColor: Colors.accent + '60',
  },

  // ── Input Area ────────────────────────────────────────
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: Typography.body?.fontFamily || 'System',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: 0,
  },

  // ── Bottom Bar ────────────────────────────────────────
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF10',
  },
  hint: {
    fontFamily: Typography.caption?.fontFamily || 'System',
    fontSize: 11,
    color: '#FFFFFF40',
    letterSpacing: 0.3,
  },
  sendBtn: {
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  sendBtnDisabled: {
    backgroundColor: '#444',
    shadowOpacity: 0,
    elevation: 0,
  },
});
