import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = 'dailyjournal.pin';

export async function getPin(): Promise<string | null> {
  const stored = await AsyncStorage.getItem(PIN_KEY);
  if (!stored) {
    return null;
  }
  return stored;
}

export async function setPin(pin: string): Promise<void> {
  await AsyncStorage.setItem(PIN_KEY, pin);
}

export async function clearPin(): Promise<void> {
  await AsyncStorage.removeItem(PIN_KEY);
}
