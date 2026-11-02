import { Image, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import theme from '../constants/theme';

export default function StartScreen({ onGetStarted, onExistingAccount }) {
  return (
    <View style={styles.onboard}>
      <Image source={require('../assets/logo.png')} style={styles.mark} resizeMode="contain" accessibilityLabel="CardShare" />
      <Text style={styles.title}>
        Use their card discounts.{'\n'}
        <Text style={styles.titleAccent}>Make money from yours.</Text>
      </Text>
      <View style={styles.actions}>
        <PrimaryButton label="Get started" onPress={onGetStarted} />
        <SecondaryButton label="I already have an account" onPress={onExistingAccount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  onboard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.layout.screenPadding,
    paddingVertical: theme.spacing.xxl,
  },
  mark: {
    width: 260,
    height: 260,
    marginTop: -20,
    marginBottom: 8,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize.display,
    letterSpacing: -1,
    lineHeight: theme.lineHeight.display,
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: 36,
  },
  titleAccent: {
    color: theme.colors.green,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.section,
  },
});
