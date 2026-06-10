import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Body, Display } from './ui';
import { palette, text, type } from '../theme';

/**
 * Odometer-style reveal countdown — rolling wheels for seconds and fractions
 * with a centered overlay ("You're in Group N"), after match.box's
 * CountdownTimer (big-numbers wheel + fractions wheel).
 */

const DIGIT_H = 96;
const FRAC_H = 28;
const FRACTIONS = ['.000', '.200', '.400', '.600', '.800'];

export function CountdownOdometer({
  seconds,
  accent,
  overlayPrefix = 'You’re in',
  overlayStrong = 'Group 1',
}: {
  /** Current remaining whole seconds (drives the big wheel). */
  seconds: number;
  accent: string;
  overlayPrefix?: string;
  overlayStrong?: string;
}) {
  const bigY = useRef(new Animated.Value(0)).current;
  const fracY = useRef(new Animated.Value(0)).current;

  // Big wheel: translate to the row matching `seconds` (rows are 00,01,02,…).
  useEffect(() => {
    Animated.timing(bigY, {
      toValue: -seconds * DIGIT_H,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [seconds, bigY]);

  // Fractions wheel: spins continuously while counting.
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(fracY, {
        toValue: -FRACTIONS.length * FRAC_H,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [fracY]);

  const maxSeconds = Math.max(seconds, 5);
  const rows = Array.from({ length: maxSeconds + 1 }, (_, i) => i);

  return (
    <View style={styles.wrap}>
      <View style={styles.wheels}>
        {/* seconds wheel */}
        <View style={[styles.window, { height: DIGIT_H }]}>
          <Animated.View style={{ transform: [{ translateY: bigY }] }}>
            {rows.map((n) => (
              <View key={n} style={{ height: DIGIT_H, justifyContent: 'center' }}>
                <Display size={84} color={text.primary}>
                  {String(n).padStart(2, '0')}
                </Display>
              </View>
            ))}
          </Animated.View>
        </View>
        {/* fractions wheel */}
        <View style={[styles.window, { height: FRAC_H, marginBottom: 14 }]}>
          <Animated.View style={{ transform: [{ translateY: fracY }] }}>
            {[...FRACTIONS, ...FRACTIONS].map((f, i) => (
              <View key={i} style={{ height: FRAC_H, justifyContent: 'center' }}>
                <Body color={text.hint} size={18} style={{ fontFamily: 'SpaceMono-Regular' }}>
                  {f}
                </Body>
              </View>
            ))}
          </Animated.View>
        </View>
      </View>
      <View style={styles.overlay} pointerEvents="none">
        <Body color={text.secondary} size={17}>
          {overlayPrefix}{' '}
          <Body color={accent} weight="800" size={17}>
            {overlayStrong}
          </Body>
        </Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 24 },
  wheels: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  window: { overflow: 'hidden' },
  overlay: { marginTop: 8 },
});
