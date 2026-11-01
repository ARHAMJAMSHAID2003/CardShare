import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import theme from '../constants/theme';

export default function SharingSwitch({ on, small }) {
  const trackWidth = small ? 43 : 48;
  const trackHeight = small ? 24 : 26;
  const thumb = small ? 20 : 22;
  const travel = trackWidth - thumb - 4;
  const progress = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    const animation = Animated.spring(progress, {
      toValue: on ? 1 : 0,
      stiffness: 320,
      damping: 26,
      mass: 0.7,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [on, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travel],
  });
  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.bg4, theme.colors.green],
  });

  return (
    <Animated.View
      style={[
        styles.track,
        { width: trackWidth, height: trackHeight, borderRadius: trackHeight / 2, backgroundColor: trackColor },
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          { width: thumb, height: thumb, borderRadius: thumb / 2, transform: [{ translateX }] },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    backgroundColor: theme.colors.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2,
    elevation: 2,
  },
});
