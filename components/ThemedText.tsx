import { Text, type TextProps } from 'react-native';
import { styled } from 'nativewind';

const StyledText = styled(Text);

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({ style, type = 'default', children, className = '', ...rest }: ThemedTextProps) {
  const baseClasses = 'text-customText dark:text-customDarkText';
  
  const typeClasses = {
    default: 'text-base leading-6',
    defaultSemiBold: 'text-base leading-6 font-semibold',
    title: 'text-3xl font-bold leading-8',
    subtitle: 'text-xl font-bold',
    link: 'text-base leading-[30px] text-secondary dark:text-white'
  };

  const classes = `${baseClasses} ${typeClasses[type]} ${className}`;

  return <StyledText className={classes} style={style} {...rest}>{children}</StyledText>;
}