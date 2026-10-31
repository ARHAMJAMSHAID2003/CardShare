import { Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { bannerText } from '../utils/orderBanner';

export default function ActiveOrderBanner({ items, onOpen, onSeeAll }) {
  if (!items.length) return null;
  const first = items[0];
  const extra = items.length - 1;
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onOpen(first)}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={bannerText(first)}
      >
        <Text style={styles.text}>{bannerText(first)}</Text>
        <Text style={styles.action}>Open</Text>
      </Pressable>
      {extra > 0 ? (
        <Pressable
          onPress={onSeeAll}
          style={styles.more}
          accessibilityRole="button"
          accessibilityLabel={`${extra} more active requests. See all`}
        >
          <Text style={styles.moreText}>
            + {extra} more · See all
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.bg3,
    borderWidth: 0.5,
    borderColor: theme.colors.border2,
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  text: {
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.body,
    lineHeight: 20,
    color: theme.colors.text,
  },
  action: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.body,
    color: theme.colors.green,
  },
  more: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
  },
  moreText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.body,
    color: theme.colors.green,
  },
});
