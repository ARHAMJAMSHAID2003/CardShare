import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { deleteCard, getCardStats, getCards, toggleCardSharing } from '../api/cards';
import CardPager from '../components/CardPager';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorBanner from '../components/ErrorBanner';
import { CircleEmpty } from '../components/HomeParts';
import LoadingState from '../components/LoadingState';
import OwnedCardItem from '../components/OwnedCardItem';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import theme from '../constants/theme';
import { useSession } from '../context/SessionContext';
import { useToast } from '../context/ToastContext';
import { openScreen } from '../navigation/openScreen';
import { queryClient } from '../queries/client';
import { useScreenQuery } from '../queries/useScreenQuery';
import { asList, sharingOn } from '../utils/format';

export default function MyCardsScreen() {
  const navigation = useNavigation();
  const { sessionId, user } = useSession();
  const showToast = useToast();
  const [cardToRemove, setCardToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [actionError, setActionError] = useState('');

  const cardsQuery = useScreenQuery(
    ['cards', user?.id],
    async ({ signal }) => asList(await getCards(sessionId, user.id, { signal }))
  );
  const statsQuery = useScreenQuery(
    ['card-stats', user?.id],
    async ({ signal }) => asList(await getCardStats(sessionId, user.id, { signal }))
  );
  const cards = cardsQuery.data || [];
  const statsById = {};
  (statsQuery.data || []).forEach((row) => {
    statsById[row.card_id] = row;
  });
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
      showToast(`${card.bank_name} ${card.card_tier} sharing turned ${next ? 'on' : 'off'}`);
      queryClient.invalidateQueries({ queryKey: ['circle-cards'] });
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
      queryClient.invalidateQueries({ queryKey: ['card-stats', user.id] });
      queryClient.invalidateQueries({ queryKey: ['circle-cards'] });
      showToast('Card removed');
      setCardToRemove(null);
    } catch (err) {
      setActionError(err.message);
      setCardToRemove(null);
    } finally {
      setRemoving(false);
    }
  };

  const refresh = () => {
    cardsQuery.refetch();
    statsQuery.refetch();
  };
  const addCard = () => openScreen(navigation, 'add-card');
  const removeName = cardToRemove ? `${cardToRemove.bank_name} ${cardToRemove.card_tier}` : '';

  return (
    <ScreenShell onRefresh={refresh} refreshing={cardsQuery.refreshing}>
      <TopBar
        title="Manage Cards"
        onBack={() => navigation.goBack()}
        actionLabel={cards.length ? '+ Add' : undefined}
        onAction={cards.length ? addCard : undefined}
      />
      {cardsQuery.showLoading ? (
        <LoadingState />
      ) : cards.length === 0 ? (
        <CircleEmpty
          icon="card"
          title="No cards yet"
          text="Add the bank cards you own. Your full card number is never shown to your circle."
          button="Add a card"
          onPress={addCard}
        />
      ) : (
        <>
          <Text style={styles.blank}>
            Add and manage the bank cards you own. Your full card number is never shown to your circle.
          </Text>
          <View style={styles.pad}>
            <CardPager
              items={cards}
              dotsLabel="Card"
              renderItem={(card) => (
                <OwnedCardItem
                  card={card}
                  displayName={user.display_name}
                  onToggleSharing={toggleSharing}
                  manage
                  stats={statsById[card.id]}
                  onRemove={setCardToRemove}
                />
              )}
            />
          </View>
        </>
      )}
      <View style={styles.pad}>
        <ErrorBanner message={error} onRetry={refresh} />
      </View>
      <ConfirmDialog
        visible={Boolean(cardToRemove)}
        title={`Remove ${removeName}?`}
        body="Your circle will no longer see this card. Past orders stay in History. A card with a live order cannot be removed."
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
  blank: {
    marginHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.text2,
  },
});
