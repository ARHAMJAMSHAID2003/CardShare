import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ErrorBanner from '../components/ErrorBanner';
import ListCard from '../components/ListCard';
import LoadingState from '../components/LoadingState';
import ScreenShell from '../components/ScreenShell';
import TabHeader from '../components/TabHeader';
import theme from '../constants/theme';
import { useRoleMode } from '../context/RoleMode';
import { useRequestInbox } from '../context/RequestInbox';
import { openScreen } from '../navigation/openScreen';
import { isYourTurn } from '../utils/requestInbox';
import { itemsForMode } from '../utils/orderBanner';

const COPY = {
  requester: {
    title: 'Requests',
    desc: 'Orders you have asked your circle to place.',
    empty: 'No requests yet. Add someone to your circle, then start your first order.',
  },
  holder: {
    title: 'Orders',
    desc: 'Orders your circle has asked you to place on your cards.',
    empty: 'No orders yet. They show up here when someone in your circle asks you to place one.',
  },
};

function Row({ item, navigation }) {
  return (
    <ListCard
      title={item.title}
      subtitle={item.subtitle}
      badgeLabel={item.badge}
      badgeVariant={item.badgeVariant}
      unreadCount={item.unreadCount}
      yourTurn={isYourTurn(item)}
      onPress={() => openScreen(navigation, item.nav.screen, item.nav.params)}
    />
  );
}

export default function RequestsScreen() {
  const navigation = useNavigation();
  const { mode } = useRoleMode();
  const { items, loading, refreshing, error, refresh } = useRequestInbox();
  const visible = itemsForMode(items, mode);
  const need = visible.filter(isYourTurn);
  const wait = visible.filter((item) => !isYourTurn(item));
  const copy = COPY[mode === 'holder' ? 'holder' : 'requester'];

  return (
    <ScreenShell onRefresh={refresh} refreshing={refreshing}>
      <TabHeader />
      <View style={styles.intro}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.desc}>{copy.desc}</Text>
      </View>
      {loading ? (
        <LoadingState />
      ) : visible.length === 0 && !error ? (
        <Text style={styles.blank}>{copy.empty}</Text>
      ) : (
        <>
          <Text style={styles.group}>Needs you</Text>
          {need.length ? (
            need.map((item) => <Row key={item.key} item={item} navigation={navigation} />)
          ) : (
            <Text style={styles.note}>Nothing needs you right now.</Text>
          )}
          {wait.length ? (
            <>
              <Text style={styles.group}>Waiting on others</Text>
              {wait.map((item) => <Row key={item.key} item={item} navigation={navigation} />)}
            </>
          ) : null}
        </>
      )}
      <View style={styles.pad}>
        <ErrorBanner message={error} onRetry={refresh} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: theme.layout.screenPadding,
  },
  intro: {
    paddingTop: 5,
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    marginTop: 5,
    fontFamily: theme.fonts.display,
    fontSize: 22,
    lineHeight: 26,
    color: theme.colors.text,
  },
  desc: {
    marginTop: 6,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.text2,
  },
  group: {
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: 10,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.small,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.text3,
  },
  note: {
    marginHorizontal: theme.layout.screenPadding,
    marginBottom: 12,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.text2,
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
