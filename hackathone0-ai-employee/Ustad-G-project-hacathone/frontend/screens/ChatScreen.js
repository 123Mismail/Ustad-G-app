import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, Text, Animated, KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import HeroBanner from '../components/HeroBanner';
import AIChatCard from '../components/AIChatCard';
import CategoryGrid from '../components/CategoryGrid';
import ServiceSlider from '../components/ServiceSlider';
import TrustStats from '../components/TrustStats';
import { useLanguage } from '../context/LanguageContext';
import { useGlobalNotification } from '../context/NotificationContext';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import TypingIndicator from '../components/TypingIndicator';
import { getMyBookings } from '../services/bookings.service';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import { triggerLocalNotification, scheduleLocalReminder } from '../utils/notifications';
import { mapBookingsToNotifications } from '../utils/notificationHelpers';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const [chatText, setChatText] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const { 
    showNotificationAlert, 
    scheduleForegroundAlert,
    readIds = [],
    clearedIds = []
  } = useGlobalNotification();
  const { messages, sendMessage, clearChat, isLoading, error } = useChat();
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(2);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      (async () => {
        try {
          const bookings = await getMyBookings();
          if (!isMounted) return;

          // Map bookings to dynamic alerts
          const dynamicAlerts = mapBookingsToNotifications(bookings, language);

          // Filter out cleared alerts
          const visibleAlerts = dynamicAlerts.filter(n => !clearedIds.includes(n.id));

          let actualUnreadCount = 0;

          if (dynamicAlerts.length > 0) {
            // Count unread dynamic alerts
            actualUnreadCount = visibleAlerts.filter(n => !readIds.includes(n.id)).length;
          } else {
            // Count unread mock alerts that are not cleared
            const visibleMocks = MOCK_NOTIFICATIONS.filter(n => !clearedIds.includes(n.id));
            actualUnreadCount = visibleMocks.filter(n => {
              if (readIds.includes(n.id)) return false;
              return !n.isRead;
            }).length;
          }

          setUnreadCount(actualUnreadCount);
        } catch (err) {
          console.warn('[ChatScreen] Failed to fetch unread count:', err);
        }
      })();
      return () => {
        isMounted = false;
      };
    }, [readIds, clearedIds, language])
  );

  const isChatActive = messages.length > 0;

  useEffect(() => {
    if (isChatActive) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [messages, isChatActive, fadeAnim]);

  // Handle incoming deep links or cross-screen actions (like from MapScreen)
  useEffect(() => {
    if (route.params?.prefillText) {
      setChatText(route.params.prefillText);
      // Clear the param so it doesn't keep populating on subsequent tab visits
      navigation.setParams({ prefillText: undefined });
      // Scroll to top so they see the populated input
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    }
  }, [route.params?.prefillText]);

  const handleSend = async () => {
    if (!chatText.trim()) return;
    const textToSend = chatText;
    setChatText('');
    Keyboard.dismiss();
    
    const response = await sendMessage(textToSend);

    // ── Real-Time Local Notification Interceptor ──
    const replyText = response?.reply || '';
    const ugkMatch = replyText.match(/UGK-\d{4}-\d{4}/i);
    if (ugkMatch) {
      const confirmationId = ugkMatch[0];

      const notifTitle = language === 'ur' ? '✅ بکنگ کنفرم ہو گئی' : '✅ Booking Confirmed!';
      const notifBody = language === 'ur'
        ? `بکنگ نمبر ${confirmationId} کامیابی سے ریکارڈ ہو گئی ہے۔`
        : `Your booking ${confirmationId} has been successfully recorded.`;

      // Trigger direct in-app celebration and sliding banner!
      showNotificationAlert(notifTitle, notifBody);

      // Trigger native OS push alert in background!
      triggerLocalNotification(notifTitle, notifBody);

      // Increment badge count instantly in real-time!
      setUnreadCount(prev => prev + 1);

      // Schedule the 1-minute departing reminder!
      try {
        let providerName = 'Selected Provider';
        const providerMatch = replyText.match(/(?:with|for)\s+([A-Za-z0-9\s]+Plumber|[A-Za-z0-9\s]+Electrician|[A-Za-z0-9\s]+Services)/i);
        if (providerMatch) {
          providerName = providerMatch[1].trim();
        }

        let scheduledDate = new Date();
        const timeMatch = replyText.match(/(\d{1,2})[\s:-](\d{2})\s*(AM|PM)?/i) || textToSend.match(/(\d{1,2})[\s:-](\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3];
          if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) {
            hours += 12;
          } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
          }
          scheduledDate.setHours(hours, minutes, 0, 0);
          
          if (scheduledDate.getTime() < Date.now() - 300000) {
            scheduledDate.setDate(scheduledDate.getDate() + 1);
          }
        }

        const reminderTitle = language === 'ur' ? '⏰ آپ کے استاد روانہ ہو چکے ہیں!' : '⏰ Your Ustad is departing soon!';
        const reminderBody = language === 'ur'
          ? `${providerName} آپ کی طرف آ رہے ہیں۔`
          : `${providerName} is heading your way.`;

        scheduleLocalReminder(reminderTitle, reminderBody, scheduledDate);
        scheduleForegroundAlert(reminderTitle, reminderBody, scheduledDate);
      } catch (reminderErr) {
        console.warn('[ChatScreen] Failed to schedule reminder notification:', reminderErr);
      }
    }
    
    if (response?.providers && response.providers.length > 0) {
      // Wait a moment for the user to read the message, then navigate
      setTimeout(() => {
        navigation.navigate('Results', { 
          providers: response.providers,
          query: textToSend 
        });
      }, 2000);
    }
  };

  const handleQuickSelect = (categoryText) => {
    setChatText(categoryText);
    // Scroll back to the top so the user sees the filled chat input
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // ── RENDER ACTIVE CHAT STATE (Pinned Input + Scrollable Messages) ──
  if (isChatActive) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Chat Header */}
          <View style={[styles.activeChatHeader, { paddingTop: Math.max(insets.top, 14) }]}>
            <View style={styles.activeChatHeaderLeft}>
              <TouchableOpacity 
                onPress={clearChat} 
                style={{ marginRight: 8, padding: 4 }}
                activeOpacity={0.7}
                accessibilityLabel="Go back to Home"
                accessibilityRole="button"
              >
                <Feather name="arrow-left" size={22} color={Colors.textDark} />
              </TouchableOpacity>
              <View style={styles.avatarContainer}>
                <Feather name="zap" size={16} color={Colors.cardBg} />
              </View>
              <View>
                <Text style={styles.activeChatTitle}>UstadG AI</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Online Assistant</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={clearChat}
              accessibilityLabel="Clear chat session"
              accessibilityRole="button"
            >
              <Feather name="trash-2" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          {/* Dedicated scrollable message container */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatScrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <View 
                  key={msg.id || index.toString()} 
                  style={[
                    styles.messageBubble, 
                    isUser ? styles.userBubble : styles.agentBubble
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.agentText
                  ]}>
                    {msg.text}
                  </Text>
                </View>
              );
            })}
            
            {isLoading && (
              <View style={[styles.messageBubble, styles.agentBubble, styles.loadingBubble]}>
                <TypingIndicator />
              </View>
            )}
            
            {error && (
              <View style={[styles.messageBubble, styles.errorBubble]}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Pinned Input Area at bottom */}
          <View style={styles.pinnedInputContainer}>
            <AIChatCard 
              value={chatText} 
              onChangeText={setChatText} 
              onSend={handleSend}
              isLoading={isLoading}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── RENDER WELCOME STATE (Scrollable Grid + Hero) ──
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Banner only shown when no chat */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <HeroBanner 
              onBellPress={() => navigation.navigate('Notifications')} 
              unreadCount={unreadCount}
            />
          </Animated.View>

          {/* AI Chat Card */}
          <AIChatCard 
            value={chatText} 
            onChangeText={setChatText} 
            onSend={handleSend}
            isLoading={isLoading}
          />

          {/* Quick Discovery Area */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <CategoryGrid onCategorySelect={handleQuickSelect} />
            <ServiceSlider onServiceSelect={handleQuickSelect} />
            <TrustStats />
          </Animated.View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // ── Active Chat Header ──
  activeChatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    backgroundColor: Colors.bgPrimary,
  },
  activeChatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeChatTitle: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 5,
  },
  statusText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3B3012',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Scrollable Message List ──
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1.5,
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.accent,
    borderTopRightRadius: 4,
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 4,
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBubble: {
    alignSelf: 'center',
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    maxWidth: '90%',
  },
  messageText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.textDark,
    fontWeight: '500',
  },
  agentText: {
    color: Colors.textDark,
  },
  errorText: {
    color: '#D32F2F',
    fontFamily: Typography.caption.fontFamily,
    textAlign: 'center',
  },

  // ── Pinned Bottom Input ──
  pinnedInputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
  },
});
