import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import ChatScreen from '../screens/ChatScreen';
import AgentTraceScreen from '../screens/AgentTraceScreen';
import MapScreen from '../screens/MapScreen';
import TransferScreen from '../screens/TransferScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import { Colors } from '../theme/colors';
import { View, Text, StyleSheet } from 'react-native';
import { t } from '../utils/i18n';
import { useLanguage } from '../App';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { language, userRole } = useLanguage();

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
            <View style={{ alignItems: 'center', width: 40 }}>
              <Feather name={iconName} size={focused ? size + 2 : size} color={color} />
              {focused && (
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.accent,
                  marginTop: 4,
                }} />
              )}
            </View>
          );
        },
        tabBarStyle: {
          backgroundColor: Colors.bgPrimary,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.05)',
          elevation: 0,
          height: 65,
          paddingBottom: 10,
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
      {userRole === 'admin' && (
        <Tab.Screen 
          name="Trace" 
          component={AgentTraceScreen} 
          options={{ tabBarLabel: t('agent_trace', language) }}
        />
      )}
      {userRole === 'admin' && (
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
