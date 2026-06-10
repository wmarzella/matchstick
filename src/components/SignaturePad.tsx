import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MonoLabel } from './ui';
import { ink, palette, radius, space } from '../theme';

/**
 * "Sign to agree" pad — match.box's GroundRulesCard signature box: an "X", a
 * placeholder, an underline, and an SVG overlay that captures the drawn stroke.
 * Renders on the cream card surface (dark ink strokes). Calls onSign(true) once
 * the user has drawn something.
 */
export function SignaturePad({ onSign }: { onSign?: (signed: boolean) => void }) {
  const [paths, setPaths] = useState<string[]>([]);
  const current = useRef<string>('');
  const width = useRef(0);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current += ` L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        setPaths((p) => [...p.slice(0, -1), current.current]);
      },
      onPanResponderRelease: () => {
        setPaths((p) => {
          const next = [...p];
          onSign?.(true);
          return [...next, ''];
        });
      },
    }),
  ).current;

  // ensure a trailing empty slot so in-progress strokes append cleanly
  const display = paths.length === 0 ? [''] : paths;
  const signed = paths.some((d) => d.length > 0);

  const onLayout = (e: LayoutChangeEvent) => {
    width.current = e.nativeEvent.layout.width;
  };

  return (
    <View style={styles.box} {...responder.panHandlers} onLayout={onLayout}>
      <MonoLabel size={20} color={ink.secondary} style={{ position: 'absolute', left: 14, bottom: 14 }}>
        x
      </MonoLabel>
      {!signed && (
        <MonoLabel
          size={11}
          color={ink.hint}
          style={{ position: 'absolute', alignSelf: 'center', bottom: 18 }}
        >
          sign to agree
        </MonoLabel>
      )}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        {display.map((d, i) =>
          d ? (
            <Path key={i} d={d} stroke={ink.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null,
        )}
      </Svg>
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 110,
    borderRadius: radius.input,
    backgroundColor: 'rgba(13,21,17,0.05)',
    marginTop: space.l,
    overflow: 'hidden',
  },
  underline: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    height: 1,
    backgroundColor: 'rgba(13,21,17,0.35)',
  },
});
