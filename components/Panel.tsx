import { PropsWithChildren } from 'react';
import { View, useWindowDimensions } from 'react-native';

type Props = PropsWithChildren<{
  variant?: 'default' | 'alt';
}>;

export default function Panel({ children, variant = 'default' }: Props) {
  const { width } = useWindowDimensions();
  
  return (
    <View 
      style={{ width }}
      className={`h-full ${variant === 'alt' ? 'bg-[#F5FFF5]' : ''}`}
    >
      {children}
    </View>
  );
}