import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, getStyle } from '../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PageHeader({ title, rightElement, showBack = false }) {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outerWrapper, { marginTop: Math.max(insets.top, 8) }]}>
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.leftGroup}>
            {showBack && (
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="arrow-left" size={24} color={Colors.accent} />
              </TouchableOpacity>
            )}
            <Text 
              style={[
                styles.title, 
                getStyle('header', language),
                { fontSize: language === 'ur' ? 18 : 20, lineHeight: language === 'ur' ? 26 : 24 },
                language === 'ur' && { paddingBottom: 2 }
              ]} 
              numberOfLines={1}
              ellipsizeMode="tail"
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {title}
            </Text>
          </View>

          {rightElement && (
            <View style={styles.rightGroup}>
              {rightElement}
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginHorizontal: 20,
    marginBottom: 4,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#C1FF7220',
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradient: {
    borderRadius: BorderRadius.card,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 48,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8, // Gap before right element
  },
  backBtn: {
    marginRight: 12,
  },
  title: {
    color: '#FFFFFF',
    flex: 1, // Allow text to take remaining space and then truncate
  },
  rightGroup: {
    flexShrink: 0, // Don't let the right element shrink
  }
});

