import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { RadarChart } from '../../src/components/RadarChart';
import {
  Body,
  Display,
  MonoLabel,
  Row,
  Screen,
  SectionHeading,
  Spacer,
} from '../../src/components/ui';
import { QUESTIONS } from '../../src/data/questions';
import { egoStage, radarAxes, scoreProfile } from '../../src/engine/psychometrics';
import { useStore } from '../../src/store';
import { border, palette, radius, space, text, type } from '../../src/theme';

const BIG5_LABELS: Record<string, string> = {
  O: 'Openness',
  C: 'Conscientiousness',
  E: 'Extraversion',
  A: 'Agreeableness',
  N: 'Neuroticism',
};

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profiles } = useStore();
  const profile = profiles[id];

  const result = useMemo(() => {
    if (!profile) return null;
    const prof = scoreProfile(QUESTIONS, profile.answers);
    // radar vs. the population midpoint (0.5 everywhere)
    const baseline = {
      big5: { O: 0.5, C: 0.5, E: 0.5, A: 0.5, N: 0.5 },
      mbtiAxes: { EI: 0, SN: 0, TF: 0, JP: 0 },
      mbtiType: '----',
      egoLevel: 4.5,
      egoStage: 'Self-aware',
      coverage: 1,
    };
    return { prof, axes: radarAxes(prof, baseline as any) };
  }, [profile]);

  if (!profile || !result) {
    return (
      <Screen>
        <Display size={type.h2}>Profile not found</Display>
        <Spacer />
        <Body color={text.hint}>
          Profiles are created when someone completes a questionnaire.
        </Body>
      </Screen>
    );
  }

  const { prof } = result;
  const answered = Object.keys(profile.answers).length;
  const stage = egoStage(prof.egoLevel);

  return (
    <Screen>
      <Body color={text.hint} onPress={() => router.back()}>
        ‹ Back
      </Body>
      <Spacer h={space.l} />
      <MonoLabel size={11}>Your portable profile</MonoLabel>
      <Spacer h={space.s} />
      <Display size={type.h1}>
        {profile.firstName} {profile.lastName}
      </Display>
      <Body color={text.hint} style={{ marginTop: 4 }}>
        {answered} answers on file · {profile.eventsAttended.length} event
        {profile.eventsAttended.length === 1 ? '' : 's'} attended
      </Body>
      <Spacer h={space.s} />
      <Body color={text.whisper} size={14}>
        These travel with you. Your next event only asks what’s new.
      </Body>

      <Spacer h={space.xl} />

      {/* Type + ego */}
      <Row style={{ gap: space.m }}>
        <View style={styles.bigBadge}>
          <MonoLabel size={9} color={text.whisper}>
            Type
          </MonoLabel>
          <Display size={type.h1}>{prof.mbtiType}</Display>
        </View>
        <View style={styles.bigBadge}>
          <MonoLabel size={9} color={text.whisper}>
            Ego stage
          </MonoLabel>
          <Display size={type.h3} style={{ marginTop: 4 }}>
            {stage.label}
          </Display>
          <Body color={text.hint} size={12} style={{ marginTop: 2 }}>
            {stage.blurb}
          </Body>
        </View>
      </Row>

      <Spacer h={space.xl} />
      <SectionHeading>Where you sit</SectionHeading>
      <Body color={text.hint} size={14} style={{ marginBottom: space.m }}>
        Your shape against the population midpoint.
      </Body>
      <RadarChart axes={result.axes} aColor={palette.aqua} bColor={border.active} aLabel="You" bLabel="Average" />

      <Spacer h={space.xl} />
      <SectionHeading>Big Five</SectionHeading>
      {(['O', 'C', 'E', 'A', 'N'] as const).map((k) => (
        <View key={k} style={{ marginBottom: space.m }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
            <Body color={text.secondary} size={14}>
              {BIG5_LABELS[k]}
            </Body>
            <MonoLabel size={11} color={text.hint}>
              {Math.round(prof.big5[k] * 100)}
            </MonoLabel>
          </Row>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.round(prof.big5[k] * 100)}%`, backgroundColor: palette.aqua },
              ]}
            />
          </View>
        </View>
      ))}

      {prof.coverage < 0.5 && (
        <Body color={text.whisper} size={13} style={{ marginTop: space.m }}>
          Answer more trait questions to sharpen this profile (currently
          {' '}{Math.round(prof.coverage * 100)}% covered).
        </Body>
      )}
      <Spacer h={space.xxl} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bigBadge: {
    flex: 1,
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.card,
    padding: space.l,
  },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(216,207,197,0.12)' },
  barFill: { height: 6, borderRadius: 3 },
});
