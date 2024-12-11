import React from 'react';
import { View, type ViewProps } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

export type ThemedViewProps = ViewProps & {
  className?: string;
};

export const ThemedView = React.forwardRef<View, ThemedViewProps>(
  ({ style, className = '', ...otherProps }, ref) => {
    return (
      <StyledView 
        ref={ref}
        className={`bg-customBg dark:bg-customDarkBg ${className}`}
        style={style} 
        {...otherProps} 
      />
    );
  }
);

ThemedView.displayName = 'ThemedView';