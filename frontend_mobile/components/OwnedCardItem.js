import { Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { sharingOn } from '../utils/format';
import SharingSwitch from './SharingSwitch';
import VirtualCard from './VirtualCard';

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// One of your own cards: the card, its sharing switch, and on Manage cards
// the stats and a remove link. stats is { earned, orders, avg_discount }.
export default function OwnedCardItem({ card, displayName, onToggleSharing, manage, stats, onRemove }) {
  const sharing = sharingOn(card.allow_sharing);
  const name = `${card.bank_name} ${card.card_tier}`;
  const orders = Number(stats?.orders) || 0;

  return (
    <View style={styles.item}>
      <VirtualCard bankName={card.bank_name} cardTier={card.card_tier} displayName={displayName} tall />
      <View style={styles.details}>
        <View style={styles.titles}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.kind}>Credit card</Text>
        </View>
        <Pressable
          style={styles.share}
          onPress={() => onToggleSharing?.(card)}
          accessibilityRole="switch"
          accessibilityState={{ checked: sharing }}
          accessibilityLabel={`Turn ${name} sharing ${sharing ? 'off' : 'on'}`}
        >
          <Text style={[styles.state, { color: sharing ? theme.colors.green : theme.colors.text2 }]}>
            {sharing ? 'Sharing ON' : 'Sharing OFF'}
          </Text>
          <SharingSwitch on={sharing} small />
        </Pressable>
      </View>
      <Text style={styles.hint}>
        {sharing ? 'Your circle can see this card and request orders.' : 'Your circle cannot see this card.'}
      </Text>
      {manage ? (
        <>
          {orders > 0 ? (
            <View style={styles.stats}>
              <Stat label="Earned (PKR)" value={Number(stats.earned || 0).toLocaleString('en-PK')} />
              <Stat label="Orders" value={String(orders)} />
              <Stat label="Avg. discount" value={`${Number(stats.avg_discount) || 0}%`} />
            </View>
          ) : (
            <View style={styles.statsEmpty}>
              <Text style={styles.statsEmptyText}>
                No orders yet. Stats show up after the first paid order on this card.
              </Text>
            </View>
          )}
          <Pressable
            style={styles.remove}
            onPress={() => onRemove?.(card)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${name}`}
          >
            <Text style={styles.removeText}>Remove card</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg2,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 14,
    paddingHorizontal: 1,
    paddingBottom: 2,
  },
  titles: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    color: theme.colors.text,
  },
  kind: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    color: theme.colors.text2,
  },
  share: {
    alignItems: 'flex-end',
    gap: 5,
  },
  state: {
    fontFamily: theme.fonts.body,
    fontSize: 9,
  },
  hint: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    color: theme.colors.text3,
    paddingTop: 9,
    paddingHorizontal: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },
  stat: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 11,
    gap: 5,
    backgroundColor: theme.colors.bg3,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    borderRadius: 12,
  },
  statLabel: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    color: theme.colors.text3,
  },
  statValue: {
    fontFamily: theme.fonts.display,
    fontSize: 16,
    color: theme.colors.text,
  },
  statsEmpty: {
    marginTop: 13,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border2,
  },
  statsEmptyText: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: theme.colors.text2,
  },
  remove: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeText: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.red,
  },
});
