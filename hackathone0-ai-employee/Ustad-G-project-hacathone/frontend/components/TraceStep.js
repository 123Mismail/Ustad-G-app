import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius } from '../theme/typography';

export default function TraceStep({ step, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.8}
    >
      {/* Collapsed Header */}
      <View style={styles.header}>
        <View style={styles.leftGroup}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{index + 1}</Text>
          </View>
          <View>
            <Text style={styles.agentName}>{step.name}</Text>
            <Text style={styles.timestamp}>{step.timestamp}</Text>
          </View>
        </View>
        <View style={styles.rightGroup}>
          <View style={[styles.statusDot, step.status === 'done' ? styles.statusDone : styles.statusPending]} />
          <Feather 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={Colors.textMuted} 
          />
        </View>
      </View>

      {/* Expanded Details */}
      {isExpanded && (
        <View style={styles.details}>
          <TraceSection label="Input" content={step.input} />
          <TraceSection label="Thinking" content={step.thinking} />
          <TraceSection label="Output" content={step.output} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function TraceSection({ label, content }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.codeBlock}>
        <Text style={styles.codeText}>{content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textDark,
  },
  agentName: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  timestamp: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusDone: {
    backgroundColor: Colors.accent,
  },
  statusPending: {
    backgroundColor: '#FFC107',
  },
  details: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  codeBlock: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 12,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: Colors.accent,
    lineHeight: 18,
  }
});
