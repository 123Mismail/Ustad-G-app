import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  // Gracefully bypass web push notifications registration
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform detected. Skipping push token registration.');
    return null;
  }

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.warn('Project ID not found. Skipping getExpoPushTokenAsync to avoid error.');
        return null;
      }
      
      // Get Expo push token
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log('Expo Push Token:', token);
    } catch (e) {
      console.error('Error getting push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Instantly trigger a local native OS push notification alert.
 * Works perfectly on emulators and physical devices in real-time!
 * 
 * @param {string} title
 * @param {string} body
 */
export async function triggerLocalNotification(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Null means deliver instantly!
    });
  } catch (error) {
    console.warn('[Notifications] Failed to trigger local push alert:', error);
  }
}

/**
 * Schedules a local reminder notification 1 minute before the booking.
 * If the reminder time is in the past, it schedules it for 5 seconds in the future for testing.
 * 
 * @param {string} title
 * @param {string} body
 * @param {string|Date} scheduledAtTime - ISO string or Date object
 */
export async function scheduleLocalReminder(title, body, scheduledAtTime) {
  try {
    const scheduledDate = new Date(scheduledAtTime);
    const now = new Date();
    
    // Calculate 1 minute before scheduled time
    const reminderTime = new Date(scheduledDate.getTime() - 60000);
    
    let secondsFromNow = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);
    
    // If the reminder time is in the past, trigger in 60 seconds for testing!
    if (secondsFromNow <= 0) {
      secondsFromNow = 60;
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: secondsFromNow,
      },
    });
    console.log(`[Notifications] Local reminder scheduled to fire in ${secondsFromNow} seconds.`);
  } catch (error) {
    console.warn('[Notifications] Failed to schedule local reminder:', error);
  }
}
