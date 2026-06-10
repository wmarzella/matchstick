import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Body } from './ui';
import { border, fonts, palette, radius, space, text } from '../theme';

/**
 * Marquee of question "chips" in alternating-direction rows — the preview used
 * on match.box's "Include premium questions" panel. Pure-JS looped translateX
 * so it runs without layout measurement.
 */
export function ScrollingChips({
  rows,
  accent = palette.cream,
}: {
  rows: string[][];
  accent?: string;
}) {
  return (
    <View style={styles.container}>
      {rows.map((chips, i) => (
        <ChipRow key={i} chips={chips} direction={i % 2 === 0 ? 'left' : 'right'} accent={accent} />
      ))}
    </View>
  );
}

function ChipRow({
  chips,
  direction,
  accent,
}: {
  chips: string[];
  direction: 'left' | 'right';
  accent: string;
}) {
  const x = useRef(new Animated.Value(0)).current;
  // duplicate the row so the loop is seamless
  const doubled = [...chips, ...chips];

  useEffect(() => {
    const distance = 600; // px per cycle; approximate, row is wider than viewport
    const from = direction === 'left' ? 0 : -distance;
    const to = direction === 'left' ? -distance : 0;
    x.setValue(from);
    const anim = Animated.loop(
      Animated.timing(x, {
        toValue: to,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [direction, x]);

  return (
    <View style={styles.rowClip}>
      <Animated.View style={[styles.row, { transform: [{ translateX: x }] }]}>
        {doubled.map((chip, i) => (
          <View key={i} style={[styles.chip, { borderColor: border.default }]}>
            <Body color={text.secondary} size={14} style={{ fontFamily: fonts.sansMedium }}>
              {chip}
            </Body>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.s, overflow: 'hidden' },
  rowClip: { overflow: 'hidden' },
  row: { flexDirection: 'row', gap: space.s },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
