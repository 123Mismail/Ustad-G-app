import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import ResultsScreen from '../screens/ResultsScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import AgentTraceScreen from '../screens/AgentTraceScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { Colors } from '../theme/colors';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.bgPrimary,
          elevation: 0, // for Android
          shadowOpacity: 0, // for iOS
        },
        headerTintColor: Colors.textDark,
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={BottomTabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="AgentTrace" component={AgentTraceScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
