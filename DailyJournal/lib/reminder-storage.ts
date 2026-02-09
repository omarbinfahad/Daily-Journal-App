import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReminderSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
  notificationId: string | null;
};

const REMINDER_KEY = 'dailyjournal.reminder-settings';

export async function getReminderSettings(): Promise<ReminderSettings> {
  const stored = await AsyncStorage.getItem(REMINDER_KEY);
  if (!stored) {
    return {
      enabled: false,
      hour: 20,
      minute: 0,
      notificationId: null,
    };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ReminderSettings>;
    return {
      enabled: parsed.enabled ?? false,
      hour: typeof parsed.hour === 'number' ? parsed.hour : 20,
      minute: typeof parsed.minute === 'number' ? parsed.minute : 0,
      notificationId: parsed.notificationId ?? null,
    };
  } catch {
    return {
      enabled: false,
      hour: 20,
      minute: 0,
      notificationId: null,
    };
  }
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
}
