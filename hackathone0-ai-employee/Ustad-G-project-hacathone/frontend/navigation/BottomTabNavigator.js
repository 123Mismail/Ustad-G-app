import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatScreen from '../screens/ChatScreen';
import AgentTraceScreen from '../screens/AgentTraceScreen';
import MapScreen from '../screens/MapScreen';
import TransferScreen from '../screens/TransferScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { t } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets();

  const isUrdu = language === 'ur';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.textDark,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Nearby') iconName = 'map-pin';
          else if (route.name === 'Bookings') iconName = 'calendar';
          else if (route.name === 'Trace') iconName = 'activity';
          else if (route.name === 'Analytics') iconName = 'bar-chart-2';
          else if (route.name === 'Account') iconName = 'user';
          
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: focused ? 'rgba(193, 255, 114, 0.22)' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <Feather name={iconName} size={20} color={focused ? Colors.textDark : Colors.textMuted} />
              </View>
            </View>
          );
        },
        tabBarStyle: {
          backgroundColor: Colors.bgPrimary,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.05)',
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: isUrdu ? 'NotoNastaliqUrdu_400Regular' : 'Inter_600SemiBold',
          fontSize: isUrdu ? 12 : 10,
          fontWeight: isUrdu ? 'normal' : '600',
          marginTop: isUrdu ? -10 : -4,
          marginBottom: insets.bottom > 0 ? 0 : 4,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={ChatScreen} 
        options={{ tabBarLabel: t('home', language) }}
      />
      <Tab.Screen 
        name="Nearby" 
        component={MapScreen} 
        options={{ tabBarLabel: t('map', language) }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={TransferScreen} 
        options={{ tabBarLabel: t('transfer', language) }}
      />
      {isAdmin && (
        <Tab.Screen 
          name="Trace" 
          component={AgentTraceScreen} 
          options={{ tabBarLabel: t('agent_trace', language) }}
        />
      )}
      {isAdmin && (
        <Tab.Screen 
          name="Analytics" 
          component={AnalyticsScreen} 
          options={{ tabBarLabel: t('analytics', language) }}
        />
      )}
      <Tab.Screen 
        name="Account" 
        component={ProfileScreen} 
        options={{ tabBarLabel: t('profile', language) }}
      />
    </Tab.Navigator>
  );
}
