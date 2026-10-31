import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCards, toggleCardSharing } from '../api/cards';
import { getCircle, getSharingCards } from '../api/circle';
import ActiveOrderBanner from '../components/ActiveOrderBanner';
import CardCarousel from '../components/CardCarousel';
import CircleCardViewer from '../components/CircleCardViewer';
import CircleStart from '../components/CircleStart';
import CreateOrderCard from '../components/CreateOrderCard';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import LoadingState from '../components/LoadingState';
import ScreenShell from '../components/ScreenShell';
import TabHeader from '../components/TabHeader';
import theme from '../constants/theme';
import { useRoleMode } from '../context/RoleMode';
import { useSession } from '../context/SessionContext';
import { openCircle, openRequests, openScreen } from '../navigation/openScreen';
import { queryClient } from '../queries/client';
import { useRequestInbox } from '../queries/inbox';
import { useScreenQuery } from '../queries/useScreenQuery';
import { asList, sharingOn } from '../utils/format';
import { itemsForMode, sortBannerItems } from '../utils/orderBanner';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { sessionId, user } = useSession();
  const { mode } = useRoleMode();
  const inbox = useRequestInbox();
  const [actionError, setActionError] = useState('');

  const circle = useScreenQuery(
    ['circle', user?.id],
    async ({ signal }) => asList(await getCircle(sessionId, user.id, { signal }))
  );
  const members = circle.data || [];
  const inCircle = members.some((member) => member.c_status === 'accepted');
  const showWelcome = Boolean(circle.data) && !inCircle;

  const sharing = useScreenQuery(
    ['circle-cards', user?.id],
    async ({ signal }) => asList(await getSharingCards(sessionId, user.id, { signal })),
    inCircle && mode === 'requester'
  );

  const cardsQuery = useScreenQuery(
    ['cards', user?.id],
    async ({ signal }) => asList(await getCards(sessionId, user.id, { signal })),
    inCircle && mode === 'holder'
  );

  const bannerItems = sortBannerItems(itemsForMode(inbox.items, mode));
  const cards = cardsQuery.data || [];
  const people = sharing.data || [];

  const onRefresh = () => {
    circle.refetch();
    inbox.refresh();
    if (mode === 'requester') sharing.refetch();
    if (mode === 'holder') cardsQuery.refetch();
  };

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

  const openItem = (item) => openScreen(navigation, item.nav.screen, item.nav.params);

  return (
    <ScreenShell onRefresh={onRefresh} refreshing={circle.refreshing || inbox.refreshing}>
      <TabHeader />
      {circle.showLoading ? (
        <LoadingState />
      ) : showWelcome ? (
        <CircleStart
          members={members}
          onAdd={() => openScreen(navigation, 'add-circle')}
          onOpenCircle={() => openCircle(navigation, { pending: true })}
        />
      ) : (
        <>
          {circle.isError && !circle.data ? (
            <View style={styles.pad}>
              <ErrorBanner message={circle.errorMessage || 'Could not load your circle.'} onRetry={onRefresh} />
            </View>
          ) : null}
          <ActiveOrderBanner
            items={bannerItems}
            onOpen={openItem}
            onSeeAll={() => openRequests(navigation)}
          />
          {mode === 'requester' ? (
            <>
              <CreateOrderCard onPress={() => openScreen(navigation, 'create-request')} />
              <Text style={styles.section}>Circle cards</Text>
              {sharing.showLoading ? (
                <LoadingState />
              ) : (
                <CircleCardViewer people={people} />
              )}
              <View style={styles.pad}>
                <ErrorBanner message={sharing.errorMessage} onRetry={() => sharing.refetch()} />
              </View>
            </>
          ) : (
            <>
              {!bannerItems.length ? (
                <Text style={styles.caught}>Nothing waiting. Your shared cards are visible to your circle.</Text>
              ) : null}
              <Text style={styles.section}>Your cards</Text>
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
                  showRemove={false}
                />
              )}
              <View style={styles.pad}>
                <ErrorBanner message={actionError || cardsQuery.errorMessage} onRetry={() => cardsQuery.refetch()} />
              </View>
            </>
          )}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  section: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.small,
    color: theme.colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.section,
    paddingHorizontal: theme.layout.screenPadding,
  },
  caught: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.body,
    lineHeight: 22,
    color: theme.colors.text2,
    paddingHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.lg,
  },
  pad: {
    paddingHorizontal: theme.layout.screenPadding,
  },
});
