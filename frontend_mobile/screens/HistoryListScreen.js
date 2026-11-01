import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getHolderHistory } from '../api/holder';
import { getRequesterHistory } from '../api/requester';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import ListCard from '../components/ListCard';
import LoadingState from '../components/LoadingState';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import theme from '../constants/theme';
import { useSession } from '../context/SessionContext';
import { openScreen } from '../navigation/openScreen';
import { useScreenQuery } from '../queries/useScreenQuery';
import { asList } from '../utils/format';
import { historyRow } from '../utils/history';

export default function HistoryListScreen() {
  const navigation = useNavigation();
  const { role } = useRoute().params;
  const { sessionId, user } = useSession();
  const holder = role === 'holder';
  const list = useScreenQuery(
    ['history-list', user?.id, role],
    async ({ signal }) => {
      const rows = holder
        ? await getHolderHistory(sessionId, user.id, { signal })
        : await getRequesterHistory(sessionId, user.id, { signal });
      return asList(rows);
    }
  );
  const items = list.data || [];
  const error = list.errorMessage;

  return (
    <ScreenShell onRefresh={() => list.refetch()} refreshing={list.refreshing}>
      <TopBar title={holder ? 'Past orders' : 'Past requests'} onBack={() => navigation.goBack()} />
      {list.showLoading ? (
        <LoadingState />
      ) : items.length === 0 && !error ? (
        <View style={{ paddingHorizontal: theme.layout.screenPadding }}>
          <EmptyState message="Nothing here yet." />
        </View>
      ) : (
        items.map((txn) => {
          const row = historyRow(txn, role);
          return (
            <ListCard
              key={row.id}
              title={row.title}
              subtitle={row.subtitle}
              badgeLabel={row.badgeLabel}
              badgeVariant={row.badgeVariant}
              onPress={() => openScreen(navigation, row.nav.screen, row.nav.params)}
            />
          );
        })
      )}
      <View style={{ paddingHorizontal: theme.layout.screenPadding }}>
        <ErrorBanner message={error} onRetry={() => list.refetch()} />
      </View>
    </ScreenShell>
  );
}
