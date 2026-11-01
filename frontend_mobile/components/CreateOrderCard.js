import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import theme from '../constants/theme';

export default function CreateOrderCard({ onPress }) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Start new order"
    >
      <View style={styles.iconContainer}>
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <Path d="M12 5v14M5 12h14" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Start New Order</Text>
        <Text style={styles.subtitle}>Choose an item and find a card discount</Text>
      </View>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 18l6-6-6-6"
          stroke={theme.colors.green}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.layout.screenPadding,
    marginBottom: 23,
    backgroundColor: theme.colors.greenDim,
    borderRadius: theme.radius.card,
    borderWidth: 1.5,
    borderColor: theme.colors.green,
    padding: 13,
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: 17,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.text2,
    marginTop: 2,
  },
});
