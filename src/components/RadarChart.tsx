import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { Body } from './ui';
import type { RadarAxis } from '../engine/psychometrics';
import { border, fonts, palette, text } from '../theme';

/**
 * Spider/radar chart overlaying two trait profiles. Axis values are 0..1.
 * `aColor` is the event accent (this guest / "you"); `bColor` is the match.
 */
export function RadarChart({
  axes,
  aColor,
  bColor = palette.cream,
  aLabel,
  bLabel,
  size = 280,
}: {
  axes: RadarAxis[];
  aColor: string;
  bColor?: string;
  aLabel?: string;
  bLabel?: string;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 46; // leave room for labels
  const n = axes.length;

  // angle for spoke i, starting at top, clockwise
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, value: number): [number, number] => {
    const a = angle(i);
    return [cx + Math.cos(a) * r * value, cy + Math.sin(a) * r * value];
  };
  const toPath = (pick: (ax: RadarAxis) => number) =>
    axes.map((ax, i) => point(i, pick(ax)).join(',')).join(' ');

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* concentric rings */}
        {rings.map((ring) => (
          <Polygon
            key={ring}
            points={axes.map((_, i) => point(i, ring).join(',')).join(' ')}
            fill="none"
            stroke={border.default}
            strokeWidth={1}
          />
        ))}
        {/* spokes + axis labels */}
        {axes.map((ax, i) => {
          const [ex, ey] = point(i, 1);
          const [lx, ly] = point(i, 1.22);
          return (
            <React.Fragment key={ax.key}>
              <Line x1={cx} y1={cy} x2={ex} y2={ey} stroke={border.default} strokeWidth={1} />
              <SvgText
                x={lx}
                y={ly}
                fill={text.hint}
                fontSize={11}
                fontFamily={fonts.monoBold}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {ax.label.toUpperCase()}
              </SvgText>
            </React.Fragment>
          );
        })}
        {/* person B polygon (match) */}
        <Polygon
          points={toPath((ax) => ax.b)}
          fill={bColor}
          fillOpacity={0.16}
          stroke={bColor}
          strokeWidth={2}
        />
        {/* person A polygon (you / accent) */}
        <Polygon
          points={toPath((ax) => ax.a)}
          fill={aColor}
          fillOpacity={0.22}
          stroke={aColor}
          strokeWidth={2}
        />
        {/* vertices */}
        {axes.map((ax, i) => {
          const [ax2, ay2] = point(i, ax.a);
          const [bx2, by2] = point(i, ax.b);
          return (
            <React.Fragment key={`v${ax.key}`}>
              <Circle cx={bx2} cy={by2} r={2.5} fill={bColor} />
              <Circle cx={ax2} cy={ay2} r={2.5} fill={aColor} />
            </React.Fragment>
          );
        })}
      </Svg>
      {(aLabel || bLabel) && (
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 8 }}>
          {aLabel && <Legend color={aColor} label={aLabel} />}
          {bLabel && <Legend color={bColor} label={bLabel} />}
        </View>
      )}
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Body color={text.secondary} size={13}>
        {label}
      </Body>
    </View>
  );
}
