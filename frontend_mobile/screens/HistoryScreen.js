import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserStats } from '../api/profile';
import ErrorBanner from '../components/ErrorBanner';
import { CircleEmpty } from '../components/HomeParts';
import ListCard from '../components/ListCard';
import LoadingState from '../components/LoadingState';
import ScreenShell from '../components/ScreenShell';
import StatsSlider from '../components/StatsSlider';
import TopBar from '../components/TopBar';
import theme from '../constants/theme';
import { useSession } from '../context/SessionContext';
import { openScreen } from '../navigation/openScreen';
import { loadHistory } from '../queries/history';
import { useScreenQuery } from '../queries/useScreenQuery';
import { historyRow } from '../utils/history';

function Section({ title, rows, role, navigation }) {
  if (!rows.length) return null;
  return (
    <>
      <View style={styles.sectionRow}>
        <Text style={styles.section}>{title}</Text>
        {rows.length > 3 ? (
          <Pressable
            onPress={() => openScreen(navigation, 'history-list', { role })}
            accessibilityRole="button"
            accessibilityLabel={`See all ${title.toLowerCase()}`}
          >
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        ) : null}
      </View>
      {rows.slice(0, 3).map((txn) => {
        const row = historyRow(txn, role);
        return (
          <ListCard
            key={`${role}-${row.id}`}
            title={row.title}
            subtitle={row.subtitle}
            badgeLabel={row.badgeLabel}
            badgeVariant={row.badgeVariant}
            onPress={() => openScreen(navigation, row.nav.screen, row.nav.params)}
          />
        );
      })}
    </>
  );
}

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { sessionId, user } = useSession();
  const history = useScreenQuery(
    ['history', user?.id],
    ({ signal, client }) => loadHistory(sessionId, user.id, { signal, client })
  );
  const stats = useScreenQuery(
    ['user-stats', user?.id],
    ({ signal }) => getUserStats(sessionId, user.id, { signal })
  );
  const asRequester = history.data?.asRequester || [];
  const asHolder = history.data?.asHolder || [];
  const error = history.isError ? history.errorMessage : (history.data?.error || '');
  const empty = !history.showLoading && asRequester.length === 0 && asHolder.length === 0;

  const refresh = () => {
    history.refetch();
    stats.refetch();
  };

  return (
    <ScreenShell onRefresh={refresh} refreshing={history.refreshing}>
      <TopBar title="History" onBack={() => navigation.goBack()} />
      {history.showLoading ? (
        <LoadingState />
      ) : empty && !error ? (
        <CircleEmpty
          icon="history"
          title="No history yet"
          text="Paid and cancelled orders will show up here, along with how much you saved and earned."
        />
      ) : (
        <>
          {stats.data ? <StatsSlider stats={stats.data} /> : null}
          <Section title="Past requests" rows={asRequester} role="requester" navigation={navigation} />
          <Section title="Past orders" rows={asHolder} role="holder" navigation={navigation} />
        </>
      )}
      <View style={styles.pad}>
        <ErrorBanner message={error} onRetry={refresh} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: theme.layout.screenPadding,
  },
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
  seeAll: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSize.body,
    color: theme.colors.green,
  },
  pad: {
    paddingHorizontal: theme.layout.screenPadding,
  },
});
