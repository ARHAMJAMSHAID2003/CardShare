import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { deleteCard, getCards, toggleCardSharing } from '../api/cards';
import CardCarousel from '../components/CardCarousel';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import theme from '../constants/theme';
import { useSession } from '../context/SessionContext';
import { openScreen } from '../navigation/openScreen';
import { queryClient } from '../queries/client';
import { useScreenQuery } from '../queries/useScreenQuery';
import { asList, sharingOn } from '../utils/format';

export default function MyCardsScreen() {
  const navigation = useNavigation();
  const { sessionId, user } = useSession();
  const [cardToRemove, setCardToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [actionError, setActionError] = useState('');

  const cardsQuery = useScreenQuery(
    ['cards', user?.id],
    async ({ signal }) => asList(await getCards(sessionId, user.id, { signal }))
  );
  const cards = cardsQuery.data || [];
  const error = actionError || cardsQuery.errorMessage;

  const toggleSharing = async (card) => {
    const next = sharingOn(card.allow_sharing) ? 0 : 1;
    const patch = (allowSharing) => {
      queryClient.setQueryData(['cards', user.id], (current) => (
        asList(current).map((item) => (item.id === card.id ? { ...item, allow_sharing: allowSharing } : item))
      ));
    };
    patch(next);
    setActionError('');
    try {
      await toggleCardSharing(sessionId, user.id, card.id);
    } catch (err) {
      patch(card.allow_sharing);
      setActionError(err.message);
    }
  };

  const removeCard = async () => {
    if (!cardToRemove) return;
    setRemoving(true);
    setActionError('');
    try {
      await deleteCard(sessionId, user.id, cardToRemove.id);
      queryClient.setQueryData(['cards', user.id], (current) => (
        asList(current).filter((item) => item.id !== cardToRemove.id)
      ));
      setCardToRemove(null);
    } catch (err) {
      setActionError(err.message);
      setCardToRemove(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <ScreenShell onRefresh={() => cardsQuery.refetch()} refreshing={cardsQuery.refreshing}>
      <TopBar title="My cards" onBack={() => navigation.goBack()} />
      {cardsQuery.showLoading ? (
        <LoadingState />
      ) : cards.length === 0 ? (
        <View style={styles.pad}>
          <EmptyState message="No cards yet." />
        </View>
      ) : (
        <CardCarousel
          cards={cards}
          displayName={user.display_name}
          onToggleSharing={toggleSharing}
          onRemove={setCardToRemove}
        />
      )}
      <Pressable
        style={styles.ghost}
        onPress={() => openScreen(navigation, 'add-card')}
        accessibilityRole="button"
        accessibilityLabel="Add a card"
      >
        <Text style={styles.ghostText}>+ Add a card</Text>
      </Pressable>
      <View style={styles.pad}>
        <ErrorBanner message={error} onRetry={() => cardsQuery.refetch()} />
      </View>
      <ConfirmDialog
        visible={Boolean(cardToRemove)}
        title="Remove this card?"
        body="It leaves your list. Past orders keep the bank and tier. A card with a live order cannot be removed."
        confirmLabel="Remove card"
        danger
        loading={removing}
        onCancel={() => setCardToRemove(null)}
        onConfirm={removeCard}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: theme.layout.screenPadding,
  },
  ghost: {
    marginHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.bg3,
    borderWidth: 0.5,
    borderColor: theme.colors.border2,
    borderRadius: theme.radius.control,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  ghostText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
});
