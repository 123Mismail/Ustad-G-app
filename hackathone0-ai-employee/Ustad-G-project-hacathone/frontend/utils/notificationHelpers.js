/**
 * notificationHelpers.js — Shared helpers for notifications mapping.
 */

/**
 * Robust custom date-time formatter that is 100% immune to React Native Hermes engine
 * limitations regarding locales. Manually handles English and Urdu representations.
 *
 * @param {string|Date} dateInput - date representation
 * @param {string} language - 'ur' or 'en'
 * @returns {string} formatted time string
 */
export const formatNotificationTime = (dateInput, language) => {
  try {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    const monthsEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsUR = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];

    const monthIndex = date.getMonth();
    const day = date.getDate();
    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const ampmUR = hours >= 12 ? 'شام' : 'صبح';

    hours = hours % 12 || 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    return language === 'ur'
      ? `${day} ${monthsUR[monthIndex]} ${hours}:${minutesStr} ${ampmUR}`
      : `${monthsEN[monthIndex]} ${day}, ${hours}:${minutesStr} ${ampm}`;
  } catch (e) {
    console.warn('[notificationHelpers] Failed to format date:', e);
    return String(dateInput);
  }
};

/**
 * Maps database booking records into visual notification object formats.
 * Matches localizations for Urdu and English seamlessly.
 *
 * @param {Array} bookings - list of booking records
 * @param {string} language - 'ur' or 'en'
 * @returns {Array} mapped alerts list
 */
export const mapBookingsToNotifications = (bookings, language) => {
  const alerts = [];
  
  if (!bookings || !Array.isArray(bookings)) return alerts;

  bookings.forEach((b) => {
    if (!b || !b.confirmation_id) return;

    const isCancelled = b.status === 'Cancelled';
    const formattedTime = formatNotificationTime(b.created_at || b.scheduled_at, language);

    // 1. Confirmed / Cancelled Notification (starts as unread: isRead = false)
    alerts.push({
      id: `${b.confirmation_id}_confirmed`,
      title: isCancelled 
        ? (language === 'ur' ? '❌ بکنگ منسوخ کر دی گئی' : '❌ Booking Cancelled')
        : (language === 'ur' ? '✅ بکنگ کی تصدیق ہو گئی' : '✅ Booking Confirmed!'),
      body: language === 'ur' 
        ? `تصدیقی نمبر: ${b.confirmation_id} - ${b.provider_id} برائے ${b.service} سروس۔`
        : `Booking ${b.confirmation_id} confirmed with ${b.provider_id} for ${b.service} services.`,
      time: formattedTime,
      type: isCancelled ? 'warning' : 'success',
      isRead: false, // Default to false so they start as unread
    });

    // 2. Departing/Reminder Notification (if current time is past or within 1 minute of scheduled time)
    if (b.scheduled_at) {
      const scheduledDate = new Date(b.scheduled_at);
      const reminderTime = new Date(scheduledDate.getTime() - 60000); // 1 min before
      const now = new Date();

      if (now >= reminderTime) {
        const formattedReminderTime = formatNotificationTime(reminderTime, language);

        alerts.push({
          id: `${b.confirmation_id}_departing`,
          title: language === 'ur' ? '⏰ آپ کے استاد روانہ ہو چکے ہیں!' : '⏰ Your Ustad is departing soon!',
          body: language === 'ur'
            ? `${b.provider_id} آپ کی طرف آ رہے ہیں۔`
            : `${b.provider_id} is heading your way.`,
          time: formattedReminderTime,
          type: 'info',
          isRead: false,
        });
      }
    }
  });

  return alerts;
};

