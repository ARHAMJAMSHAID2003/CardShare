import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCards, toggleCardSharing } from '../api/cards';
import { getCircle, getSharingCards } from '../api/circle';
import ActiveOrderBanner from '../components/ActiveOrderBanner';
import CardPager from '../components/CardPager';
import CircleCardViewer from '../components/CircleCardViewer';
import CircleStart from '../components/CircleStart';
import CreateOrderCard from '../components/CreateOrderCard';
import ErrorBanner from '../components/ErrorBanner';
import { CircleEmpty, HomeIntro, PrivacyNote, SectionHeading } from '../components/HomeParts';
import LoadingState from '../components/LoadingState';
import OwnedCardItem from '../components/OwnedCardItem';
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

const INTRO = {
  requester: {
    eyebrow: 'YOUR TRUSTED CIRCLE',
    title: 'Find the right card\nfor your next order.',
    text: 'Browse cards your friends and family have chosen to share.',
  },
  requesterNew: {
    eyebrow: 'WELCOME TO CARDSHARE',
    title: 'Save on your\nnext order.',
    text: 'Add someone you trust. Their card can lower the price of what you buy.',
  },
  holder: {
    eyebrow: 'YOUR CARDHOLDER DASHBOARD',
    title: 'Your cards.\nYour circle. Your rewards.',
    text: 'Review incoming requests and manage which cards your circle can access.',
  },
  holderNew: {
    eyebrow: 'YOUR CARDHOLDER DASHBOARD',
    title: 'Earn when you\nplace orders.',
    text: 'Add a card and share it with your circle. You earn an incentive on every order you place for them.',
  },
};

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
  const accepted = members.filter((member) => member.c_status === 'accepted');
  const inCircle = accepted.length > 0;

  const sharing = useScreenQuery(
    ['circle-cards', user?.id],
    async ({ signal }) => asList(await getSharingCards(sessionId, user.id, { signal })),
    inCircle && mode === 'requester'
  );

  const cardsQuery = useScreenQuery(
    ['cards', user?.id],
    async ({ signal }) => asList(await getCards(sessionId, user.id, { signal })),
    mode === 'holder'
  );

  const bannerItems = sortBannerItems(itemsForMode(inbox.items, mode));
  const cards = cardsQuery.data || [];
  const people = sharing.data || [];

  const holder = mode === 'holder';
  const loading = holder ? cardsQuery.showLoading : circle.showLoading;
  const newRequester = !holder && Boolean(circle.data) && !inCircle;
  const newHolder = holder && Boolean(cardsQuery.data) && cards.length === 0;
  const intro = holder
    ? (newHolder ? INTRO.holderNew : INTRO.holder)
    : (newRequester ? INTRO.requesterNew : INTRO.requester);

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

  const requestCard = (person, card) => {
    openScreen(navigation, 'create-request', {
      bank: card.bank_name,
      tier: card.card_tier,
      holderId: person.id,
      cardId: card.id,
    });
  };

  return (
    <ScreenShell onRefresh={onRefresh} refreshing={circle.refreshing || inbox.refreshing}>
      <TabHeader />
      <HomeIntro eyebrow={intro.eyebrow} title={intro.title} text={intro.text} />
      {loading ? (
        <LoadingState />
      ) : newRequester ? (
        <CircleStart
          members={members}
          onAdd={() => openScreen(navigation, 'add-circle')}
          onOpenCircle={() => openCircle(navigation, { pending: true })}
        />
      ) : newHolder ? (
        <>
          <ActiveOrderBanner
            items={bannerItems}
            mode={mode}
            onOpen={openItem}
            onSeeAll={() => openRequests(navigation)}
          />
          <CircleEmpty
            icon="card"
            title="No cards yet"
            text="Add a card and choose when to share it. Your circle never sees the full number."
            button="Add a card"
            onPress={() => openScreen(navigation, 'add-card')}
          />
          <View style={styles.pad}>
            <ErrorBanner message={actionError || cardsQuery.errorMessage} onRetry={() => cardsQuery.refetch()} />
          </View>
        </>
      ) : (
        <>
          {circle.isError && !circle.data ? (
            <View style={styles.pad}>
              <ErrorBanner message={circle.errorMessage || 'Could not load your circle.'} onRetry={onRefresh} />
            </View>
          ) : null}
          <ActiveOrderBanner
            items={bannerItems}
            mode={mode}
            onOpen={openItem}
            onSeeAll={() => openRequests(navigation)}
          />
          {mode === 'requester' ? (
            <>
              <CreateOrderCard onPress={() => openScreen(navigation, 'create-request')} />
              <SectionHeading
                eyebrow="CARDS YOU CAN ACCESS"
                title="Your Circle"
                count={`${accepted.length} ${accepted.length === 1 ? 'member' : 'members'}`}
              />
              {sharing.showLoading ? (
                <LoadingState />
              ) : (
                <CircleCardViewer people={people} onRequest={requestCard} />
              )}
              <View style={styles.pad}>
                <ErrorBanner message={sharing.errorMessage} onRetry={() => sharing.refetch()} />
              </View>
              <PrivacyNote>Card details are protected. Full card numbers are never shown.</PrivacyNote>
            </>
          ) : (
            <>
              <SectionHeading
                eyebrow="YOUR REGISTERED CARDS"
                title="Your Cards"
                count={`${cards.length} ${cards.length === 1 ? 'card' : 'cards'}`}
              />
              <View style={styles.pad}>
                <CardPager
                  items={cards}
                  dotsLabel="Card"
                  renderItem={(card) => (
                    <OwnedCardItem
                      card={card}
                      displayName={user.display_name}
                      onToggleSharing={toggleSharing}
                    />
                  )}
                  extraBelow={(
                    <Pressable
                      style={styles.manage}
                      onPress={() => openScreen(navigation, 'my-cards')}
                      accessibilityRole="button"
                      accessibilityLabel="Manage cards"
                    >
                      <Text style={styles.manageText}>Manage cards ›</Text>
                    </Pressable>
                  )}
                />
              </View>
              <View style={styles.pad}>
                <ErrorBanner message={actionError || cardsQuery.errorMessage} onRetry={() => cardsQuery.refetch()} />
              </View>
              <PrivacyNote>Your full card details are never shared with your circle.</PrivacyNote>
            </>
          )}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: theme.layout.screenPadding,
  },
  manage: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  manageText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    color: theme.colors.green,
  },
});
