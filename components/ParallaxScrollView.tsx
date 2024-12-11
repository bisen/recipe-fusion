import type { PropsWithChildren, ReactElement } from 'react';
import { useColorScheme } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { styled } from 'nativewind';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';

const HEADER_HEIGHT = 250;
const AnimatedScrollView = styled(Animated.ScrollView);
const AnimatedView = styled(Animated.View);

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
        ),
      },
      {
        scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
      },
    ],
  }));

  return (
    <ThemedView className="flex-1">
      <AnimatedScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        <AnimatedView
          className="h-[250px] overflow-hidden"
          style={[
            headerAnimatedStyle,
            { backgroundColor: headerBackgroundColor[colorScheme] },
          ]}>
          {headerImage}
        </AnimatedView>
        <ThemedView className="flex-1 p-8 gap-4 overflow-hidden">
          {children}
        </ThemedView>
      </AnimatedScrollView>
    </ThemedView>
  );
}