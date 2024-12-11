import { BlurView } from 'expo-blur';
import { styled } from 'nativewind';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StyledBlurView = styled(BlurView);

export default function BlurTabBarBackground() {
  return (
    <StyledBlurView
      className="absolute inset-0"
      tint="systemChromeMaterial"
      intensity={100}
    />
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}