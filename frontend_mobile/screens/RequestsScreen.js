import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EmptyState from '../components/EmptyState';
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

export default function RequestsScreen() {
  const navigation = useNavigation();
  const { mode } = useRoleMode();
  const { items, loading, refreshing, error, refresh } = useRequestInbox();
  const visible = itemsForMode(items, mode);

  return (
    <ScreenShell onRefresh={refresh} refreshing={refreshing}>
      <TabHeader />
      {loading ? (
        <LoadingState />
      ) : visible.length === 0 && !error ? (
        <View style={styles.pad}>
          <EmptyState
            message={mode === 'holder' ? 'No live requests on your cards.' : 'No live requests.'}
          />
        </View>
      ) : (
        visible.map((item) => (
          <ListCard
            key={item.key}
            title={item.title}
            subtitle={item.subtitle}
            badgeLabel={item.badge}
            badgeVariant={item.badgeVariant}
            unreadCount={item.unreadCount}
            yourTurn={isYourTurn(item)}
            onPress={() => openScreen(navigation, item.nav.screen, item.nav.params)}
          />
        ))
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
});
