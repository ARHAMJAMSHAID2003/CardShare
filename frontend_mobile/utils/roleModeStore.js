import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'cardshare_role_mode';

export async function readRoleMode() {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return value === 'holder' ? 'holder' : 'requester';
  } catch {
    return 'requester';
  }
}

export async function writeRoleMode(mode) {
  await AsyncStorage.setItem(KEY, mode === 'holder' ? 'holder' : 'requester');
}
