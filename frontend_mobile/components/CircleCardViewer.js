import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import EmptyState from './EmptyState';
import VirtualCard from './VirtualCard';

function personLabel(person) {
  return person.contact_name || person.display_name || person.phone || 'Someone';
}

export default function CircleCardViewer({ people }) {
  const [bank, setBank] = useState('');
  const [index, setIndex] = useState(0);

  const banks = useMemo(() => {
    const names = new Set();
    people.forEach((person) => {
      (person.cards || []).forEach((card) => {
        if (card.bank_name) names.add(card.bank_name);
      });
    });
    return [...names].sort();
  }, [people]);

  const cards = useMemo(() => {
    const rows = [];
    people.forEach((person) => {
      const name = personLabel(person);
      (person.cards || []).forEach((card) => {
        if (bank && card.bank_name !== bank) return;
        rows.push({ ...card, displayName: name });
      });
    });
    return rows;
  }, [people, bank]);

  const page = Math.min(index, Math.max(0, cards.length - 1));
  const card = cards[page];

  const onBank = (name) => {
    setBank(name);
    setIndex(0);
  };

  if (!people.length) {
    return (
      <View style={styles.empty}>
        <EmptyState message="No one in your circle is sharing a card yet." />
      </View>
    );
  }

  return (
    <View>
      {banks.length > 1 ? (
        <View style={styles.filters}>
          <Pressable
            onPress={() => onBank('')}
            style={[styles.chip, !bank && styles.chipOn]}
            accessibilityRole="button"
            accessibilityLabel="All banks"
          >
            <Text style={[styles.chipText, !bank && styles.chipTextOn]}>All</Text>
          </Pressable>
          {banks.map((name) => (
            <Pressable
              key={name}
              onPress={() => onBank(name)}
              style={[styles.chip, bank === name && styles.chipOn]}
              accessibilityRole="button"
              accessibilityLabel={name}
            >
              <Text style={[styles.chipText, bank === name && styles.chipTextOn]}>{name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {card ? (
        <View style={styles.shell}>
          <VirtualCard
            bankName={card.bank_name}
            cardTier={card.card_tier}
            displayName={card.displayName}
          />
        </View>
      ) : (
        <View style={styles.empty}>
          <EmptyState message="No shared cards for that bank." />
        </View>
      )}
      {cards.length > 1 ? (
        <View style={styles.controls}>
          <Pressable
            style={[styles.arrow, page === 0 && styles.arrowOff]}
            onPress={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={page === 0}
            accessibilityLabel="Previous card"
          >
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <Text style={styles.counter}>{page + 1} / {cards.length}</Text>
          <Pressable
            style={[styles.arrow, page >= cards.length - 1 && styles.arrowOff]}
            onPress={() => setIndex((current) => Math.min(cards.length - 1, current + 1))}
            disabled={page >= cards.length - 1}
            accessibilityLabel="Next card"
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.md,
  },
  chip: {
    backgroundColor: theme.colors.bg3,
    borderRadius: theme.radius.pill,
    borderWidth: 0.5,
    borderColor: theme.colors.border2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipOn: {
    backgroundColor: theme.colors.greenDim,
    borderColor: theme.colors.green,
  },
  chipText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.body,
    color: theme.colors.text2,
  },
  chipTextOn: {
    color: theme.colors.green,
  },
  empty: {
    paddingHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.lg,
  },
  shell: {
    marginHorizontal: theme.layout.screenPadding,
    backgroundColor: theme.colors.bg2,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  arrow: {
    width: theme.layout.carouselArrow,
    height: theme.layout.carouselArrow,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.bg3,
    borderWidth: 0.5,
    borderColor: theme.colors.border2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowOff: {
    opacity: 0.35,
  },
  arrowText: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize.carouselArrow,
    color: theme.colors.text,
    lineHeight: theme.fontSize.carouselArrow,
    marginTop: -2,
  },
  counter: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.body,
    color: theme.colors.text2,
    minWidth: theme.layout.carouselCounterMinWidth,
    textAlign: 'center',
  },
});
