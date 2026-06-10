import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MonoLabel } from './ui';
import type { RadarAxis } from '../engine/psychometrics';
import { palette, space, text } from '../theme';

/**
 * Per-dimension linear comparison — a faithful port of match.box's `ScaleList`
 * (the "why you matched" insights view): a horizontal line with end ticks and a
 * positioned dot per person, between two pole labels. See
 * docs/matchbox-reference.css (.ScaleList__scale / meter / axis-labels).
 */

const POLES: Record<string, [string, string]> = {
  O: ['Grounded', 'Curious'],
  C: ['Easygoing', 'Driven'],
  E: ['Reserved', 'Outgoing'],
  A: ['Frank', 'Warm'],
  S: ['Intense', 'Steady'],
  F: ['Thinking', 'Feeling'],
  Ego: ['Emerging', 'Developed'],
};

export function ScaleComparison({
  axes,
  aColor,
  bColor = palette.cream,
}: {
  axes: RadarAxis[];
  aColor: string;
  bColor?: string;
}) {
  return (
    <View>
      {axes.map((ax) => {
        const [lo, hi] = POLES[ax.key] ?? ['Low', 'High'];
        return (
          <View key={ax.key} style={styles.row}>
            <View style={styles.line}>
              {/* end ticks */}
              <View style={[styles.tick, { left: 0 }]} />
              <View style={[styles.tick, { right: 0 }]} />
              {/* dots: match first (under), you on top */}
              <Dot value={ax.b} color={bColor} />
              <Dot value={ax.a} color={aColor} />
            </View>
            <View style={styles.labels}>
              <MonoLabel size={9} color={text.hint}>
                {lo}
              </MonoLabel>
              <MonoLabel size={9} color={text.hint}>
                {hi}
              </MonoLabel>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Dot({ value, color }: { value: number; color: string }) {
  // position center at value*100%, offset by half the dot so it stays on the line
  return (
    <View
      style={[
        styles.dot,
        {
          left: `${Math.max(0, Math.min(1, value)) * 100}%`,
          backgroundColor: color,
          marginLeft: -5,
        },
      ]}
    />
  );
}

const LINE = 1.5;
const DOT = 10;

const styles = StyleSheet.create({
  row: { marginBottom: space.xl },
  line: {
    height: LINE,
    backgroundColor: text.hint,
    borderRadius: LINE,
    justifyContent: 'center',
  },
  tick: {
    position: 'absolute',
    width: LINE,
    height: 12,
    backgroundColor: text.hint,
    top: -6,
  },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    top: -(DOT - LINE) / 2,
    borderWidth: 2,
    borderColor: palette.background,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.s,
  },
});
