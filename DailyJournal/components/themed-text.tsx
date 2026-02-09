import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useFontScale } from '@/hooks/use-font-scale';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, type === 'link' ? 'tint' : 'text');
  const scale = useFontScale();

  return (
    <Text
      style={[
        { color },
        type === 'default' ? [styles.default, { fontSize: 16 * scale, lineHeight: 24 * scale }] : undefined,
        type === 'title' ? [styles.title, { fontSize: 32 * scale, lineHeight: 36 * scale }] : undefined,
        type === 'defaultSemiBold'
          ? [styles.defaultSemiBold, { fontSize: 16 * scale, lineHeight: 24 * scale }]
          : undefined,
        type === 'subtitle' ? [styles.subtitle, { fontSize: 20 * scale, lineHeight: 26 * scale }] : undefined,
        type === 'link' ? [styles.link, { fontSize: 16 * scale, lineHeight: 24 * scale }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  link: {
    lineHeight: 24,
    fontSize: 16,
  },
});
