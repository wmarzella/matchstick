import React, { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  border,
  fonts,
  ink,
  palette,
  radius,
  space,
  text,
  type,
} from '../theme';

/* ---------------------------------- layout --------------------------------- */

export function Screen({
  children,
  scroll = true,
  footer,
  style,
}: {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        { padding: space.xl, paddingTop: insets.top + space.xl, paddingBottom: 140 },
        style,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, { padding: space.xl, paddingTop: insets.top + space.xl }, style]}>
      {children}
    </View>
  );
  return (
    <View style={[styles.flex, { backgroundColor: palette.surface }]}>
      {body}
      {footer}
    </View>
  );
}

/** Sticky wizard footer: progress segments + back link + primary action. */
export function WizardFooter({
  segments,
  activeSegment,
  onBack,
  backLabel = 'Back',
  action,
}: {
  segments: number;
  activeSegment: number;
  onBack?: () => void;
  backLabel?: string;
  action: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.footerWrap, { paddingBottom: Math.max(insets.bottom, space.l) }]}>
      <View style={styles.progressRow}>
        {Array.from({ length: segments }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSeg,
              { backgroundColor: i <= activeSegment ? palette.cream : border.default },
            ]}
          />
        ))}
      </View>
      <View style={styles.footerRow}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.backLink}>{backLabel}</Text>
          </Pressable>
        ) : (
          <View />
        )}
        {action}
      </View>
    </View>
  );
}

/* --------------------------------- headings -------------------------------- */

export function Display({
  children,
  size = type.h1,
  italic = false,
  color = text.primary,
  style,
}: {
  children: ReactNode;
  size?: number;
  italic?: boolean;
  color?: string;
  style?: TextStyle;
}) {
  return (
    <Text
      style={[
        {
          fontFamily: italic ? fonts.serifItalic : fonts.serif,
          fontSize: size,
          lineHeight: size * 1.08,
          color,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function SectionHeading({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return (
    <Display size={type.h2} style={StyleSheet.flatten([{ marginBottom: space.s }, style])}>
      {children}
    </Display>
  );
}

export function Body({
  children,
  color = text.secondary,
  size = type.base,
  weight,
  style,
  onPress,
  numberOfLines,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  weight?: '400' | '500' | '600' | '700' | '800';
  style?: TextStyle;
  onPress?: () => void;
  numberOfLines?: number;
}) {
  const family =
    weight === '800'
      ? fonts.sansExtraBold
      : weight === '700'
        ? fonts.sansBold
        : weight === '600'
          ? fonts.sansSemiBold
          : weight === '500'
            ? fonts.sansMedium
            : fonts.sans;
  return (
    <Text
      onPress={onPress}
      numberOfLines={numberOfLines}
      style={[{ fontFamily: family, fontSize: size, lineHeight: size * 1.35, color }, style]}
    >
      {children}
    </Text>
  );
}

/** Letterspaced uppercase mono label, e.g. panel titles. */
export function MonoLabel({
  children,
  color = text.hint,
  size = 12,
  style,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  style?: TextStyle;
}) {
  return (
    <Text
      style={[
        {
          fontFamily: fonts.monoBold,
          fontSize: size,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          color,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/* --------------------------------- buttons --------------------------------- */

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  arrow = false,
  tone = 'cream',
  style,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  arrow?: boolean;
  tone?: 'cream' | 'dim';
  style?: ViewStyle;
}) {
  const bg = disabled || tone === 'dim' ? 'rgba(243,239,230,0.14)' : palette.cream;
  const fg = disabled || tone === 'dim' ? text.hint : ink.primary;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        { backgroundColor: bg, opacity: pressed && !disabled ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[styles.primaryBtnText, { color: fg }]}>
        {label}
        {arrow ? '  →' : ''}
      </Text>
    </Pressable>
  );
}

export function OutlinePill({
  label,
  onPress,
  selected = false,
  emoji,
  small = false,
}: {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  emoji?: string;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        small && { paddingVertical: 8, paddingHorizontal: 14 },
        {
          borderColor: selected ? palette.cream : border.active,
          backgroundColor: selected ? 'rgba(243,239,230,0.12)' : 'transparent',
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: fonts.sansMedium,
          fontSize: small ? 14 : 17,
          color: selected ? text.primary : text.secondary,
        }}
      >
        {emoji ? `${emoji}  ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

/** Bordered selectable card with a title + caption (radio-style). */
export function RadioCard({
  title,
  caption,
  selected,
  onPress,
  right,
}: {
  title: string;
  caption?: string;
  selected: boolean;
  onPress: () => void;
  right?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.radioCard,
        {
          borderColor: selected ? palette.cream : border.default,
          backgroundColor: selected ? 'rgba(243,239,230,0.06)' : 'transparent',
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.flex}>
        <Body color={text.primary} weight="600">
          {title}
        </Body>
        {caption ? (
          <Body color={text.hint} size={15} style={{ marginTop: 2 }}>
            {caption}
          </Body>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

/* ---------------------------------- inputs --------------------------------- */

export function Field({
  label,
  hint,
  style,
  ...inputProps
}: TextInputProps & { label?: string; hint?: string; style?: ViewStyle }) {
  return (
    <View style={[{ marginBottom: space.l }, style]}>
      {label ? (
        <Body color={text.primary} weight="600" style={{ marginBottom: space.s }}>
          {label}
        </Body>
      ) : null}
      <TextInput
        placeholderTextColor={text.whisper}
        selectionColor={palette.cream}
        {...inputProps}
        style={styles.input}
      />
      {hint ? (
        <Body color={text.whisper} size={14} style={{ marginTop: space.xs, fontStyle: 'italic' }}>
          {hint}
        </Body>
      ) : null}
    </View>
  );
}

/* ------------------------------ matchbox tray ------------------------------ */

/**
 * Panel styled like the inner tray of a matchbox: rounded corners,
 * a sunken face, and a brighter "lip" running along the right edge.
 */
export function Tray({
  title,
  children,
  style,
}: {
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.trayOuter, style]}>
      {title ? (
        <View style={styles.trayTitleRow}>
          <View style={styles.trayTitleRule} />
          <MonoLabel size={11} color={text.hint} style={{ marginHorizontal: space.s }}>
            {title}
          </MonoLabel>
          <View style={styles.trayTitleRule} />
        </View>
      ) : null}
      <View style={styles.trayInner}>{children}</View>
      <View style={styles.trayLip} />
    </View>
  );
}

/* --------------------------------- helpers --------------------------------- */

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export function Wrap({ children, gap = space.m }: { children: ReactNode; gap?: number }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>{children}</View>;
}

export function Spacer({ h = space.l }: { h?: number }) {
  return <View style={{ height: h }} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13,21,17,0.92)',
    paddingHorizontal: space.xl,
  },
  progressRow: {
    flexDirection: 'row',
    gap: space.s,
    marginBottom: space.l,
  },
  progressSeg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: text.secondary,
    textDecorationLine: 'underline',
  },
  primaryBtn: {
    borderRadius: radius.pill,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  pill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  radioCard: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: space.l,
    marginBottom: space.m,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: fonts.sans,
    fontSize: 17,
    color: text.primary,
  },
  trayOuter: {
    backgroundColor: palette.surfaceSunken,
    borderRadius: radius.tray,
    borderWidth: 1,
    borderColor: 'rgba(243,239,230,0.08)',
    paddingTop: space.m,
    overflow: 'hidden',
  },
  trayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.l,
    marginBottom: space.s,
  },
  trayTitleRule: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(243,239,230,0.12)',
  },
  trayInner: {
    padding: space.l,
    paddingRight: space.l + 6,
  },
  trayLip: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(243,239,230,0.06)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.4)',
  },
});
