import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export default function SettingsRow({ icon, title, color = Colors.textDark, rightWidget, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.title, { color }]}>{title}</Text>
      </View>
      
      <View style={styles.right}>
        {rightWidget ? (
          rightWidget
        ) : (
          <Feather name="chevron-right" size={20} color={Colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
