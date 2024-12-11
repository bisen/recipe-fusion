import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { styled } from 'nativewind';

const StyledPressable = styled(PlatformPressable);

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <StyledPressable
      {...props}
      className="flex-1 items-center justify-center"
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}