import { Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import Animated from 'react-native-reanimated';

type Props = {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'cancel';
  style?: any;
  disabled?: boolean;
};

export default function NavigationButton({ 
  onPress, 
  label, 
  variant = 'primary',
  style,
  disabled 
}: Props) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-secondary';
      case 'cancel':
        return 'bg-cancel';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Animated.View style={style} className="pointer-events-none">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`h-16 rounded-3xl shadow-lg items-center justify-center ${getVariantStyle()} 
          ${disabled ? 'opacity-50' : ''}`}
      >
        <ThemedText 
          numberOfLines={1}
          className="text-lg font-semibold text-black text-center w-full px-4"
        >
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}