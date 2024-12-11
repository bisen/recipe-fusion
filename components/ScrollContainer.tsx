import { PropsWithChildren } from 'react';
import Animated from 'react-native-reanimated';
import { ThemedView } from '@/components/ThemedView';

type Props = PropsWithChildren<{
  onScroll?: any;
  contentOffset?: { x: number; y: number };
  ref?: any;
}>;

export default function ScrollContainer({ children, onScroll, contentOffset, ref }: Props) {
  return (
    <ThemedView className="flex-1">
      <Animated.ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentOffset={contentOffset}
        className="flex-1"
      >
        {children}
      </Animated.ScrollView>
    </ThemedView>
  );
}