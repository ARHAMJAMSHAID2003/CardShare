import AsyncStorage from '@react-native-async-storage/async-storage';

// What the phone remembers about received invites, kept per signed-in account.
//   on       the person's choice to check new invites against their contacts
//   results  invite phone -> the name saved in their contacts, or null when the
//            number is not in their contacts. A number with no entry is unchecked.
// None of this goes to the server. Only the name of an invite the person accepts is sent,
// when they accept it.

const PREFIX = 'cardshare_contact_check_';

const empty = () => ({ on: false, results: {} });

export async function readContactCheck(userId) {
  if (!userId) return empty();
  try {
    const raw = await AsyncStorage.getItem(PREFIX + userId);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    const results = parsed && typeof parsed.results === 'object' && parsed.results ? parsed.results : {};
    return { on: parsed?.on === true, results };
  } catch {
    return empty();
  }
}

export async function writeContactCheck(userId, state) {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(PREFIX + userId, JSON.stringify({ on: state.on === true, results: state.results || {} }));
  } catch {
    // The check still works for this session if the phone cannot save it.
  }
}

// Logout: forget every account's saved results on this phone.
export async function clearContactCheck() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mine = keys.filter((key) => key.startsWith(PREFIX));
    if (mine.length) await AsyncStorage.removeMany(mine);
  } catch {
    // Nothing else to do.
  }
}

// Drop results for numbers that are no longer pending invites.
export function pruneResults(results, phones) {
  const keep = new Set(phones);
  const next = {};
  let changed = false;
  Object.keys(results).forEach((phone) => {
    if (keep.has(phone)) next[phone] = results[phone];
    else changed = true;
  });
  return changed ? next : results;
}
