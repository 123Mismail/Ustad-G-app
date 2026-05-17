import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export default function ProfileHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>UG</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>UstadG User</Text>
        <Text style={styles.phone}>+92 300 1234567</Text>
      </View>
      <View style={styles.editButton}>
        <Feather name="edit-2" size={18} color={Colors.textDark} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: Typography.header.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontFamily: Typography.header.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
  },
  phone: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    color: Colors.textMuted,
    marginTop: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
