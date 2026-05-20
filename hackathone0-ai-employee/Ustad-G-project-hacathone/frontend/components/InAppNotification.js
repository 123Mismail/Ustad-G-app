import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const InAppNotification = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState({ title: '', body: '' });
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    show: (title, body) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setNotification({ title, body });
      setVisible(true);

      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 4 seconds
      timerRef.current = setTimeout(() => {
        hide();
      }, 4000);
    },
    hide,
  }));

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const hide = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={hide}
        activeOpacity={0.9}
      >
        <View style={styles.iconBox}>
          <Feather name="bell" size={18} color={Colors.cardBg} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{notification.body}</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={hide}>
          <Feather name="x" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  body: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
  },
});

export default InAppNotification;
