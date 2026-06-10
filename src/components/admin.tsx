import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Body, Display, MonoLabel } from './ui';
import { border, palette, radius, space, text, type } from '../theme';

/**
 * Admin "Section" — sticky-style heading + subheading + body, mirroring
 * match.box's Section component (serif h2, hint subheading, bordered body).
 */
export function Section({
  index,
  title,
  subtitle,
  children,
}: {
  index?: number;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={{ marginBottom: space.xxl }}>
      <Display size={type.h2}>
        {index != null ? (
          <Display size={type.h2} color={text.hint}>
            {index}.{' '}
          </Display>
        ) : null}
        {title}
      </Display>
      {subtitle ? (
        <Body color={text.hint} style={{ marginTop: 4, marginBottom: space.l }}>
          {subtitle}
        </Body>
      ) : (
        <View style={{ height: space.l }} />
      )}
      {children}
    </View>
  );
}

/**
 * ActionCard — bordered panel from the admin dashboard.
 * Literal: bg transparent, radius ~12px, border rgba(fg / .19).
 */
export function ActionCard({
  title,
  children,
  disabled = false,
}: {
  title?: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.card, disabled && { opacity: 0.5 }]}>
      {title ? (
        <Display size={type.h3} style={{ marginBottom: space.s }}>
          {title}
        </Display>
      ) : null}
      {children}
    </View>
  );
}

/** Big number + caption stat (SUBMITTED / REMAINING SEATS / MATCHED). */
export function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <Display size={type.h1}>{value}</Display>
      <MonoLabel size={10} color={text.hint} style={{ marginTop: -4 }}>
        {label}
      </MonoLabel>
    </View>
  );
}

/** Outlined admin button (e.g. ADD DEMO PARTICIPANTS, CALCULATE). */
export function AdminButton({
  label,
  onPress,
  disabled = false,
  tone = 'outline',
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  tone?: 'outline' | 'solid';
}) {
  const solid = tone === 'solid';
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        solid
          ? { backgroundColor: disabled ? 'rgba(216,207,197,0.14)' : palette.cream }
          : { borderWidth: 1.5, borderColor: border.active },
        { opacity: pressed && !disabled ? 0.8 : disabled ? 0.4 : 1 },
      ]}
    >
      <MonoLabel size={12} color={solid ? 'rgba(13,21,17,0.95)' : text.secondary}>
        {label}
      </MonoLabel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: 'rgba(216, 207, 197, 0.19)',
    borderRadius: radius.card,
    padding: space.xl,
    backgroundColor: palette.surfaceSunken,
  },
  btn: {
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
