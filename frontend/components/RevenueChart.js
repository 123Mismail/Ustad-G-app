import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

export default function RevenueChart({ data }) {
  const { language } = useLanguage();
  
  if (!data || data.length === 0) return null;

  // Find max value to calculate proportional heights
  const maxVal = Math.max(...data.map(d => d.value));
  
  // Create Y-axis labels (max, half, zero)
  const yAxisLabels = [
    (maxVal / 1000).toFixed(0) + 'k',
    (maxVal / 2000).toFixed(0) + 'k',
    '0'
  ];

  return (
    <View style={styles.outerWrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>Revenue This Week</Text>
        
        <View style={styles.chartArea}>
          {/* Y-Axis */}
          <View style={styles.yAxis}>
            {yAxisLabels.map((label, idx) => (
              <Text key={idx} style={styles.axisLabel}>{label}</Text>
            ))}
          </View>

          {/* Bars Container */}
          <View style={styles.barsContainer}>
            {/* Background Grid Lines (Dashed) */}
            <View style={[styles.gridLine, { top: 0 }]} />
            <View style={[styles.gridLine, { top: '50%' }]} />
            <View style={[styles.gridLine, { bottom: 0 }]} />

            {/* Render Bars */}
            {data.map((item, index) => {
              const heightPercent = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
              const isHighest = item.value === maxVal;
              const formattedVal = (item.value / 1000).toFixed(1) + 'k';
              
              return (
                <View key={index} style={styles.barWrapper}>
                  {/* Floating Value Bubble */}
                  <View style={[styles.valueBubble, isHighest && styles.valueBubbleActive]}>
                    <Text style={[styles.valueText, isHighest && styles.valueTextActive]}>
                      {formattedVal}
                    </Text>
                  </View>

                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={[
                        isHighest ? Colors.accent : Colors.accent + '40',
                        isHighest ? Colors.accent + '20' : 'transparent'
                      ]}
                      style={[
                        styles.barFill, 
                        { height: `${heightPercent}%` }
                      ]}
                    />
                  </View>
                  <Text style={[styles.xLabel, isHighest && styles.xLabelActive]}>
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.card,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  card: {
    padding: 20,
  },
  title: {
    fontFamily: Typography.subheader.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 32,
  },
  chartArea: {
    flexDirection: 'row',
    height: 180,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 12,
    paddingBottom: 24,
  },
  axisLabel: {
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 24,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
    borderStyle: 'dashed',
  },
  barWrapper: {
    alignItems: 'center',
    width: 32,
    height: '100%',
    justifyContent: 'flex-end',
  },
  valueBubble: {
    position: 'absolute',
    top: -20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  valueBubbleActive: {
    backgroundColor: '#000000',
  },
  valueText: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  valueTextActive: {
    color: Colors.accent,
    fontWeight: '900',
  },
  barTrack: {
    flex: 1,
    width: 12,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 20,
  },
  xLabel: {
    position: 'absolute',
    bottom: -24,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  xLabelActive: {
    color: Colors.textDark,
    fontWeight: '800',
  }
});

