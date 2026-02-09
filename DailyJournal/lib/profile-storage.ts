import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  name: string;
  bio: string;
  avatarUri: string | null;
};

const PROFILE_KEY = 'dailyjournal.profile';

export async function getProfile(): Promise<UserProfile> {
  const stored = await AsyncStorage.getItem(PROFILE_KEY);
  if (!stored) {
    return { name: '', bio: '', avatarUri: null };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<UserProfile>;
    return {
      name: parsed.name ?? '',
      bio: parsed.bio ?? '',
      avatarUri: parsed.avatarUri ?? null,
    };
  } catch {
    return { name: '', bio: '', avatarUri: null };
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
