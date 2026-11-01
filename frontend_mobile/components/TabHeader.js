import { Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { useRoleMode } from '../context/RoleMode';
import { useAppActions } from '../navigation/AppActions';
import { useTopInset } from '../hooks/useTopInset';
import { PanelIcon } from './NavIcons';

const OPTIONS = [
  ['requester', 'Requester'],
  ['holder', 'Cardholder'],
];

export default function TabHeader() {
  const topInset = useTopInset();
  const { openMenu } = useAppActions();
  const { mode, setMode } = useRoleMode();

  return (
    <View style={[styles.bar, { paddingTop: topInset }]}>
      <Pressable
        onPress={openMenu}
        style={styles.menuBtn}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <PanelIcon color={theme.colors.text} />
      </Pressable>
      <View style={styles.toggle} accessibilityRole="tablist">
        {OPTIONS.map(([id, label]) => {
          const selected = mode === id;
          return (
            <Pressable
              key={id}
              onPress={() => setMode(id)}
              style={[styles.tab, selected && styles.tabOn]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={label}
            >
              <Text numberOfLines={1} style={[styles.tabText, selected && styles.tabTextOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.bg,
    zIndex: 2,
  },
  menuBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
    padding: 4,
    backgroundColor: theme.colors.bg3,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border2,
    minWidth: 0,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
    paddingHorizontal: 5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabOn: {
    backgroundColor: theme.colors.green,
  },
  tabText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    color: theme.colors.text2,
  },
  tabTextOn: {
    color: theme.colors.black,
  },
});
