import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';

import { 
  NotoNastaliqUrdu_400Regular, 
  NotoNastaliqUrdu_700Bold 
} from '@expo-google-fonts/noto-nastaliq-urdu';

import AppNavigator from './navigation/AppNavigator';
import { Colors } from './theme/colors';
import { AuthProvider } from './context/AuthContext';
import InAppNotification from './components/InAppNotification';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

const READ_KEY = 'ustadg_read_notifications';
const CLEARED_KEY = 'ustadg_cleared_notifications';

async function getStoredIds(key) {
  try {
    const data = Platform.OS === 'web' ? localStorage.getItem(key) : await SecureStore.getItemAsync(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

async function saveStoredIds(key, ids) {
  try {
    const serialized = JSON.stringify(ids);
    if (Platform.OS === 'web') {
      localStorage.setItem(key, serialized);
    } else {
      await SecureStore.setItemAsync(key, serialized);
    }
  } catch (e) {
    console.warn('[App] Failed to save stored notification IDs:', e);
  }
}

import { LanguageContext, useLanguage } from './context/LanguageContext';
import { NotificationContext, useGlobalNotification } from './context/NotificationContext';
export { useLanguage, useGlobalNotification };

export default function App() {
  const [language, setLanguage] = useState('en');
  const notificationRef = useRef(null);
  const [readIds, setReadIds] = useState([]);
  const [clearedIds, setClearedIds] = useState([]);

  // Load read/cleared notification IDs from SecureStore/localStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedRead = await getStoredIds(READ_KEY);
        const storedCleared = await getStoredIds(CLEARED_KEY);
        setReadIds(storedRead);
        setClearedIds(storedCleared);
      } catch (err) {
        console.warn('[App] Failed to load read/cleared notification IDs:', err);
      }
    })();
  }, []);

  const markAsRead = React.useCallback(async (id) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveStoredIds(READ_KEY, next);
      return next;
    });
  }, []);

  const markAllAsRead = React.useCallback(async (ids) => {
    setReadIds((prev) => {
      const next = [...prev];
      let changed = false;
      ids.forEach((id) => {
        if (!next.includes(id)) {
          next.push(id);
          changed = true;
        }
      });
      if (changed) {
        saveStoredIds(READ_KEY, next);
        return next;
      }
      return prev;
    });
  }, []);

  const clearNotification = React.useCallback(async (id) => {
    setClearedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveStoredIds(CLEARED_KEY, next);
      return next;
    });
  }, []);

  const clearAllNotifications = React.useCallback(async (ids) => {
    setClearedIds((prev) => {
      const next = [...prev];
      let changed = false;
      ids.forEach((id) => {
        if (!next.includes(id)) {
          next.push(id);
          changed = true;
        }
      });
      if (changed) {
        saveStoredIds(CLEARED_KEY, next);
        return next;
      }
      return prev;
    });
  }, []);

  // Load custom fonts
  const [fontsLoaded, fontError] = useFonts({
    'Inter_400Regular': Inter_400Regular,
    'Inter_500Medium': Inter_500Medium,
    'Inter_600SemiBold': Inter_600SemiBold,
    'Inter_700Bold': Inter_700Bold,
    'Inter_800ExtraBold': Inter_700Bold, // Using 700 as fallback for 800
    'NotoNastaliqUrdu_400Regular': NotoNastaliqUrdu_400Regular,
    'NotoNastaliqUrdu_700Bold': NotoNastaliqUrdu_700Bold,
  });

  useEffect(() => {
    async function hideSplash() {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplash();
  }, [fontsLoaded, fontError]);

  const showNotificationAlert = React.useCallback((title, body) => {
    // 1. Show custom in-app banner popup
    if (notificationRef.current) {
      notificationRef.current.show(title, body);
    }
    
    // 2. Play a vibration / haptic feedback
    try {
      const { Vibration } = require('react-native');
      Vibration.vibrate([0, 150, 100, 150]);
    } catch (e) {
      console.warn('Vibration failed:', e);
    }
  }, []);

  const scheduledTimeoutsRef = useRef({});

  const scheduleForegroundAlert = React.useCallback((title, body, scheduledAtTime) => {
    try {
      const scheduledDate = new Date(scheduledAtTime);
      const now = new Date();
      
      // Calculate 1 minute before scheduled time
      const reminderTime = new Date(scheduledDate.getTime() - 60000);
      
      let msFromNow = reminderTime.getTime() - now.getTime();
      
      // If it is in the past, trigger in 60 seconds (60000 ms) for testing!
      if (msFromNow <= 0) {
        msFromNow = 60000;
      }

      console.log(`[App] Scheduling foreground JS reminder in ${msFromNow / 1000} seconds.`);

      const id = Math.random().toString(36).substring(7);

      const timeoutId = setTimeout(() => {
        showNotificationAlert(title, body);
        // Clean up from active timeouts list upon firing
        delete scheduledTimeoutsRef.current[id];
      }, msFromNow);

      scheduledTimeoutsRef.current[id] = timeoutId;
      return id;
    } catch (err) {
      console.warn('[App] Failed to schedule foreground alert:', err);
      return null;
    }
  }, [showNotificationAlert]);

  useEffect(() => {
    // Listen for incoming notifications when the app is in the foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { title, body } = notification.request.content;
      
      // PREVENT DOUBLE-BANNER: If this is an instant local notification trigger, 
      // ignore it as the screen has already explicitly triggered showNotificationAlert.
      const isConfirmation = title && (title.includes('Confirmed') || title.includes('تصدیق'));
      if (isConfirmation) {
        console.log('[App] Intercepted and ignored redundant foreground booking confirmation.');
        return;
      }

      showNotificationAlert(title || 'New Notification', body || '');
    });

    return () => {
      subscription.remove();
      // Clean up any pending timeouts on unmount
      Object.values(scheduledTimeoutsRef.current).forEach(clearTimeout);
    };
  }, [showNotificationAlert]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <LanguageContext.Provider value={{ language, setLanguage }}>
            <NotificationContext.Provider value={{ 
              showNotificationAlert, 
              scheduleForegroundAlert,
              readIds,
              clearedIds,
              markAsRead,
              markAllAsRead,
              clearNotification,
              clearAllNotifications
            }}>
              <StatusBar style="dark" backgroundColor={Colors.bgPrimary} />
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
              <InAppNotification ref={notificationRef} />
            </NotificationContext.Provider>
          </LanguageContext.Provider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
