import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';
import TraceStep from '../components/TraceStep';
import PageHeader from '../components/PageHeader';
import { Feather } from '@expo/vector-icons';

const MOCK_TRACE = [
  {
    name: 'Intent Agent',
    status: 'done',
    timestamp: '12:01:03 PM',
    input: '"Muje bijli wala chahiye, Clifton mein, aaj 2 baje"',
    thinking: 'Detected language: Roman Urdu\nParsing intent...\n→ Service: Electrician (bijli wala)\n→ Location: Clifton, Karachi\n→ Time: Today, 2:00 PM',
    output: '{ service: "electrician", location: "Clifton, Karachi", time: "Today, 2:00 PM" }',
  },
  {
    name: 'Discovery Agent',
    status: 'done',
    timestamp: '12:01:05 PM',
    input: '{ service: "electrician", location: "Clifton, Karachi", radius: "10km" }',
    thinking: 'Querying Google Maps Places API...\nSearch: "electrician near Clifton Karachi"\nRadius: 10km\nFound 3 results within range.',
    output: '[\n  { name: "Ali Electrician", distance: 2.1km, rating: 4.5 },\n  { name: "Usman Fixers", distance: 4.8km, rating: 4.3 },\n  { name: "Karachi Wiring", distance: 1.2km, rating: 3.5 }\n]',
  },
  {
    name: 'Ranking Agent',
    status: 'done',
    timestamp: '12:01:06 PM',
    input: '3 providers found in Clifton area',
    thinking: 'Applying 40/40/20 formula:\n\nAli Electrician:\n  Distance (40%): 38/40\n  Rating (40%): 36/40\n  Availability (20%): 18/20\n  Total: 92/100\n\nUsman Fixers: 85/100\nKarachi Wiring: 78/100\n\nRanked by total score descending.',
    output: '[\n  { rank: 1, name: "Ali Electrician", score: 92 },\n  { rank: 2, name: "Usman Fixers", score: 85 },\n  { rank: 3, name: "Karachi Wiring", score: 78 }\n]',
  },
  {
    name: 'Booking Agent',
    status: 'done',
    timestamp: '12:01:10 PM',
    input: '{ provider: "Ali Electrician", time: "Today, 2:00 PM" }',
    thinking: 'Generating Booking ID...\nFormat: UGK-YYYY-XXXX\nWriting to Google Sheets via MCP...\nSheet ID: 1a2b3c4d\nRow appended successfully.',
    output: '{ booking_id: "UGK-2026-1234", status: "confirmed", sheet_row: 47 }',
  },
  {
    name: 'Follow-up Agent',
    status: 'done',
    timestamp: '12:01:11 PM',
    input: '{ booking_id: "UGK-2026-1234", time: "Today, 2:00 PM" }',
    thinking: 'Scheduling reminder for 1 hour before appointment.\nReminder time: 1:00 PM\nNotification channel: Push notification (simulated)',
    output: '{ reminder_set: true, reminder_time: "1:00 PM", method: "push_notification" }',
  },
];

export default function AgentTraceScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader 
        title="Agent Trace Log" 
        rightElement={
          <View style={styles.headerIconBox}>
            <Feather name="cpu" size={18} color={Colors.accent} />
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        {MOCK_TRACE.map((step, index) => (
          <TraceStep key={index} step={step} index={index} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF12',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
