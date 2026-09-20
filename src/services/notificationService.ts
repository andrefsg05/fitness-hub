import { Habit } from '@/types';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification presentation for foreground
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Returns today's date in local YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Requests permissions from the user and configures Android notification channel
 */
export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Habit & Workout Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      });
    }

    return true;
  } catch (error) {
    console.warn('Error setting up notifications:', error);
    return false;
  }
}

/**
 * Schedules or cancels notification for a single habit based on its state and time
 */
export async function scheduleHabitReminder(habit: Habit): Promise<void> {
  if (Platform.OS === 'web') return;

  const identifier = `habit-reminder-${habit.id}`;

  // Always cancel any existing scheduled notification for this habit first
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (err) {
    // Ignore if not found
  }

  // If not active or no reminder time specified, we don't schedule
  if (!habit.is_active || !habit.reminder_time) {
    return;
  }

  const [hoursStr, minutesStr] = habit.reminder_time.split(':');
  const hour = parseInt(hoursStr, 10);
  const minute = parseInt(minutesStr, 10);

  if (isNaN(hour) || isNaN(minute)) {
    return;
  }

  const todayStr = getTodayDateString();
  const isCompletedToday = habit.last_checked === todayStr;

  const now = new Date();
  const scheduledTimeToday = new Date();
  scheduledTimeToday.setHours(hour, minute, 0, 0);

  // If the user already completed the habit today AND the reminder time for today hasn't passed yet,
  // we don't want it to fire today. We can schedule the daily trigger starting from tomorrow.
  try {
    if (isCompletedToday && now < scheduledTimeToday) {
      // Schedule to trigger starting tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hour, minute, 0, 0);

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: '⏰ Daily Fitness Reminder',
          body: `${habit.name}`,
          data: { habitId: habit.id, type: 'habit_reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: tomorrow,
          channelId: 'reminders',
        },
      });
    } else {
      // Schedule daily recurring reminder
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: '⏰ Daily Fitness Reminder',
          body: `${habit.name}`,
          data: { habitId: habit.id, type: 'habit_reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'reminders',
        },
      });
    }
  } catch (err) {
    console.warn(`Failed to schedule notification for habit ${habit.id}:`, err);
  }
}

/**
 * Cancels scheduled notification for a habit
 */
export async function cancelHabitReminder(habitId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`habit-reminder-${habitId}`);
  } catch (err) {
    console.warn(`Failed to cancel notification for habit ${habitId}:`, err);
  }
}

/**
 * Syncs notifications for all active habits
 */
export async function syncAllHabitsNotifications(habits: Habit[]): Promise<void> {
  if (Platform.OS === 'web') return;

  for (const habit of habits) {
    if (habit.is_active && habit.reminder_time) {
      await scheduleHabitReminder(habit);
    } else {
      await cancelHabitReminder(habit.id);
    }
  }
}
