import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import theme from '../constants/theme';
import { useRoleMode } from '../context/RoleMode';
import { useSession } from '../context/SessionContext';
import { useAppActions } from '../navigation/AppActions';
import { useTopInset } from '../hooks/useTopInset';
import { initialsFor } from '../utils/initials';

function MenuGlyph() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7h16M4 12h16M4 17h16" stroke={theme.colors.text} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export default function TabHeader() {
  const topInset = useTopInset();
  const { openMenu } = useAppActions();
  const { user } = useSession();
  const { mode, setMode } = useRoleMode();
  const initials = initialsFor(user?.display_name);

  return (
    <View style={[styles.bar, { paddingTop: topInset }]}>
      <Pressable
        onPress={openMenu}
        style={styles.menuBtn}
        accessibilityRole="button"
        accessibilityLabel="Menu"
      >
        <MenuGlyph />
      </Pressable>
      <View style={styles.toggle} accessibilityRole="tablist">
        <Pressable
          onPress={() => setMode('requester')}
          style={[styles.tab, mode === 'requester' && styles.tabOn]}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === 'requester' }}
          accessibilityLabel="Requester"
        >
          <Text numberOfLines={1} style={[styles.tabText, mode === 'requester' && styles.tabTextOn]}>Requester</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('holder')}
          style={[styles.tab, mode === 'holder' && styles.tabOn]}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === 'holder' }}
          accessibilityLabel="Cardholder"
        >
          <Text numberOfLines={1} style={[styles.tabText, mode === 'holder' && styles.tabTextOn]}>Cardholder</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={openMenu}
        style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
        accessibilityRole="button"
        accessibilityLabel="Account"
      >
        <Text style={styles.avatarText}>{initials}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.bg,
    zIndex: 2,
  },
  menuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.bg3,
    borderRadius: theme.radius.pill,
    borderWidth: 0.5,
    borderColor: theme.colors.border2,
    padding: 3,
    minWidth: 0,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  tabOn: {
    backgroundColor: theme.colors.greenDim,
  },
  tabText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.body,
    color: theme.colors.text2,
  },
  tabTextOn: {
    color: theme.colors.green,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.greenDim,
    borderWidth: 1,
    borderColor: theme.colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPressed: {
    backgroundColor: 'rgba(0, 200, 122, 0.28)',
  },
  avatarText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.input,
    color: theme.colors.green,
  },
});
