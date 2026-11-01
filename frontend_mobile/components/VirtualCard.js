import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';
import { cardholderNameLine } from '../utils/initials';

// The card face shown in Home, Manage cards and the circle viewer.
// Bank on the left, chip on the right, holder name and tier along the bottom.
export default function VirtualCard({ bankName, cardTier, displayName, tall }) {
  return (
    <LinearGradient
      colors={['#153c2b', '#0c2119', '#122e22']}
      locations={[0, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.8 }}
      style={[styles.card, tall && styles.tall]}
    >
      <View style={styles.orb} pointerEvents="none" />
      <Text style={styles.brand} numberOfLines={1}>{bankName}</Text>
      <View style={styles.chip} pointerEvents="none">
        <View style={styles.chipRow} />
        <View style={styles.chipCol} />
      </View>
      <Text style={styles.number}>••••   ••••   ••••   ••••</Text>
      <View style={styles.bottom}>
        <Text style={styles.bottomText} numberOfLines={1}>{cardholderNameLine(displayName).toUpperCase()}</Text>
        <Text style={styles.bottomText}>{String(cardTier || '').toUpperCase()}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 158,
    borderRadius: 14,
    paddingTop: 15,
    paddingBottom: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  tall: {
    minHeight: 176,
    paddingTop: 17,
    paddingBottom: 14,
    paddingHorizontal: 18,
  },
  orb: {
    position: 'absolute',
    width: 170,
    height: 170,
    right: -65,
    top: -85,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.13)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  brand: {
    fontFamily: theme.fonts.display,
    fontSize: 18,
    color: theme.colors.text,
    maxWidth: '70%',
  },
  chip: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 31,
    height: 23,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipRow: {
    position: 'absolute',
    top: 7,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  chipCol: {
    position: 'absolute',
    left: 10,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  number: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    letterSpacing: 1.3,
    color: theme.colors.text,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  bottomText: {
    fontFamily: theme.fonts.body,
    fontSize: 9,
    letterSpacing: 0.8,
    color: 'rgba(240, 242, 244, 0.8)',
    flexShrink: 1,
  },
});
