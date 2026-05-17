import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ImageBackground } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius } from '../theme/typography';

export default function PromoBento() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Feather name="sparkles" size={24} color={Colors.accent} />
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Full Home Cleaning</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>-30%</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Professional deep cleaning for your home</Text>
        </View>

        <View style={styles.arrowBox}>
          <Feather name="chevron-right" size={20} color={Colors.textMuted} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  iconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginRight: 8,
  },
  tag: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
  subtitle: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  arrowBox: {
    marginLeft: 8,
  }
});
