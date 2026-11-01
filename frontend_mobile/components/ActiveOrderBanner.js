import { Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { bannerParts, bannerText } from '../utils/orderBanner';

// "See all" sits above the banner, on the right. The banner is the first item.
export default function ActiveOrderBanner({ items, mode, onOpen, onSeeAll }) {
  if (!items.length) return null;
  const first = items[0];
  const extra = items.length - 1;
  const noun = mode === 'holder' ? 'orders' : 'requests';
  const { head, detail } = bannerParts(first);

  return (
    <View>
      <View style={styles.top}>
        <Pressable
          onPress={onSeeAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`See all ${noun}`}
        >
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() => onOpen(first)}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={bannerText(first)}
      >
        <View style={styles.dot} />
        <View style={styles.copy}>
          <Text style={styles.head} numberOfLines={2}>{head}</Text>
          <Text style={styles.detail} numberOfLines={2}>{detail}</Text>
          {extra > 0 ? <Text style={styles.more}>+{extra} more active {noun}</Text> : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingBottom: 7,
  },
  seeAll: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    color: theme.colors.green,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: 13,
    backgroundColor: theme.colors.bg3,
    borderWidth: 1,
    borderColor: theme.colors.border2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.green,
    marginTop: 5,
    marginHorizontal: 4,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  head: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    color: theme.colors.text,
  },
  detail: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    color: theme.colors.text2,
  },
  more: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    color: theme.colors.text3,
  },
});
