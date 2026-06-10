import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SignaturePad } from '../../../src/components/SignaturePad';
import { Body, Display, MonoLabel, PrimaryButton, Row, Screen, Spacer } from '../../../src/components/ui';
import { useStore } from '../../../src/store';
import { ink, palette, radius, space, type } from '../../../src/theme';
import type { MatchMode } from '../../../src/store/types';

/** Event-specific ground rules, keyed by matching mode (mirrors match.box). */
const RULES: Record<MatchMode, [string, string][]> = {
  platonic: [
    ['Matches are platonic.', 'Gender will not be considered.'],
    ['Matching is based on values.', 'Long-term compatibility is the goal.'],
    ['Meet the whole group.', 'It’s about more than just your match.'],
  ],
  romantic: [
    ['Matches can be romantic.', 'Gender and orientation are considered.'],
    ['Matching is based on values.', 'Real compatibility, not just a spark.'],
    ['Be open.', 'The best match may surprise you.'],
  ],
  professional: [
    ['Matches are professional.', 'Built for career-minded connections.'],
    ['Matching is based on values.', 'Shared drive and outlook come first.'],
    ['Meet the whole room.', 'Every introduction is worth making.'],
  ],
};

export default function GroundRules() {
  const { id, guest: guestId } = useLocalSearchParams<{ id: string; guest?: string }>();
  const { getEvent } = useStore();
  const event = getEvent(id);

  if (!event) {
    return (
      <Screen>
        <Display size={type.h2}>Event not found</Display>
      </Screen>
    );
  }

  const rules = RULES[event.mode];

  const next = () => {
    const q = guestId ? `?guest=${guestId}` : '';
    router.replace(`/event/${event.id}/quiz${q}`);
  };

  return (
    <Screen scroll style={{ justifyContent: 'center' }}>
      <Spacer h={space.xxl} />
      {/* Cream card */}
      <View style={styles.card}>
        <Display size={type.h2} color={ink.secondary} style={styles.heading}>
          GROUND RULES
        </Display>
        <Spacer h={space.l} />
        {rules.map(([title, sub], i) => (
          <Row key={i} style={{ alignItems: 'flex-start', marginBottom: space.l }}>
            <MonoLabel size={13} color={ink.hint} style={{ marginTop: 3, width: 28 }}>
              {String(i + 1).padStart(2, '0')}
            </MonoLabel>
            <View style={{ flex: 1 }}>
              <Body weight="700" size={18} color={ink.primary}>
                {title}
              </Body>
              <Body size={16} color={ink.secondary}>
                {sub}
              </Body>
            </View>
          </Row>
        ))}
        <SignaturePad />
      </View>

      <Spacer h={space.l} />
      {/* Continue is always enabled (matches match.box); signing is encouraged. */}
      <PrimaryButton label="Continue" onPress={next} />
      <Spacer h={space.xxl} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.cream,
    borderRadius: radius.tray,
    padding: space.xl,
  },
  heading: {
    textAlign: 'center',
    letterSpacing: 1,
  },
});
