import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import CardDots from './CardDots';

// A row of pages you swipe through, with tappable dots under it.
// renderItem gets the item and whether it is the page on screen.
// extraBelow is drawn under the dots.
export default function CardPager({
  items,
  keyOf = (item) => item.id,
  renderItem,
  onIndexChange,
  dotsLabel,
  extraBelow,
  resetKey,
}) {
  const scroller = useRef(null);
  const indexRef = useRef(0);
  const widthRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const count = items.length;

  const move = (next) => {
    if (indexRef.current === next) return;
    indexRef.current = next;
    setIndex(next);
    onIndexChange?.(next);
  };

  useEffect(() => {
    indexRef.current = 0;
    setIndex(0);
    scroller.current?.scrollTo({ x: 0, animated: false });
    onIndexChange?.(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (width <= 0) return;
    const page = Math.min(indexRef.current, Math.max(0, count - 1));
    const widthChanged = widthRef.current !== width;
    widthRef.current = width;
    if (!widthChanged && page === indexRef.current) return;
    move(page);
    scroller.current?.scrollTo({ x: page * width, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, width]);

  const settle = (x) => {
    if (width <= 0) return;
    move(Math.max(0, Math.min(count - 1, Math.round(x / width))));
  };

  const goTo = (page) => {
    if (width <= 0) return;
    scroller.current?.scrollTo({ x: page * width, animated: true });
    move(page);
  };

  if (count === 0) return null;

  return (
    <View>
      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 ? (
          <ScrollView
            ref={scroller}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="start"
            disableIntervalMomentum
            scrollEnabled={count > 1}
            scrollEventThrottle={16}
            onScroll={(event) => settle(event.nativeEvent.contentOffset.x)}
            onMomentumScrollEnd={(event) => settle(event.nativeEvent.contentOffset.x)}
            style={{ width }}
          >
            {items.map((item, i) => (
              <View key={keyOf(item)} style={{ width }}>
                {renderItem(item, i === index)}
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
      {count > 1 ? (
        <View style={{ marginTop: 11 }}>
          <CardDots count={count} index={index} onPick={goTo} label={dotsLabel} />
        </View>
      ) : null}
      {extraBelow}
    </View>
  );
}
