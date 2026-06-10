import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RadarChart } from '../../../src/components/RadarChart';
import { ScaleComparison } from '../../../src/components/ScaleComparison';
import {
  Body,
  Display,
  MonoLabel,
  PrimaryButton,
  Row,
  Screen,
  SectionHeading,
  Spacer,
} from '../../../src/components/ui';
import { egoStage } from '../../../src/engine/psychometrics';
import { useStore } from '../../../src/store';
import {
  border,
  palette,
  radius,
  space,
  text,
  textOnAccent,
  type,
} from '../../../src/theme';

export default function Reveal() {
  const { id, guest: guestId, teaser } = useLocalSearchParams<{
    id: string;
    guest?: string;
    teaser?: string;
  }>();
  const { getEvent, guestsOf } = useStore();
  const event = getEvent(id);
  const [count, setCount] = useState(teaser ? -1 : 3);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 850);
    return () => clearTimeout(t);
  }, [count]);

  const guests = guestsOf(event?.id ?? '');
  const name = (gid: string) => {
    const g = guests.find((x) => x.id === gid);
    return g ? `${g.firstName} ${g.lastName ? g.lastName[0] + '.' : ''}`.trim() : '?';
  };
  const phone = (gid: string) => guests.find((x) => x.id === gid)?.phone ?? '';

  const myPair = useMemo(() => {
    if (!event?.results || !guestId) return undefined;
    return event.results.pairs.find(
      (p) => p.a === guestId || p.b === guestId || p.c === guestId,
    );
  }, [event, guestId]);

  if (!event) {
    return (
      <Screen>
        <Display size={type.h2}>Event not found</Display>
      </Screen>
    );
  }

  const accent = palette[event.accent];
  const onAccent = textOnAccent[event.accent];

  if (!event.results) {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <MonoLabel>Not yet</MonoLabel>
        <Spacer h={space.m} />
        <Display size={type.h2} style={{ textAlign: 'center' }}>
          The host hasn’t struck the matches.
        </Display>
        <Spacer h={space.xl} />
        <PrimaryButton label="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  // Teaser: show a held breath, not the result.
  if (teaser) {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={[styles.teaserBar, { backgroundColor: accent }]} />
        <Spacer h={space.xl} />
        <MonoLabel size={12}>Your match is ready</MonoLabel>
        <Spacer h={space.m} />
        <Display size={type.h1} style={{ textAlign: 'center' }}>
          Something’s waiting{'\n'}for you<Display size={type.h1} italic>.</Display>
        </Display>
        <Spacer h={space.l} />
        <Body color={text.hint} style={{ textAlign: 'center', maxWidth: 300 }}>
          The host will reveal everyone’s match at the same moment. Stay close.
        </Body>
        <Spacer h={space.xxl} />
        <PrimaryButton
          label="I’m ready"
          arrow
          onPress={() => router.replace(`/event/${event.id}/reveal?guest=${guestId ?? ''}`)}
        />
      </Screen>
    );
  }

  if (count > 0) {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <MonoLabel size={12}>Matches reveal in</MonoLabel>
        <Display size={120} color={accent}>
          {count}
        </Display>
        <Body color={text.whisper}>Everyone sees this together.</Body>
      </Screen>
    );
  }

  const { pairs, receipts, profiles } = event.results;

  return (
    <Screen>
      <Pressable onPress={() => router.replace(`/event/${event.id}`)} hitSlop={10}>
        <Body color={text.hint}>‹ {event.title}</Body>
      </Pressable>
      <Spacer h={space.l} />

      {/* Personal match card + radar */}
      {myPair && guestId ? (
        <>
          {(() => {
            const otherId = myPair.a === guestId ? myPair.b : myPair.a;
            const me = profiles[guestId];
            const them = profiles[otherId];
            return (
              <>
                <MonoLabel size={11}>Your match</MonoLabel>
                <Spacer h={space.s} />
                <View style={[styles.matchCard, { backgroundColor: accent }]}>
                  <Display size={type.h1} color={onAccent}>
                    {name(otherId)}
                  </Display>
                  {myPair.c && (
                    <Body color={onAccent} style={{ marginTop: 4 }}>
                      …and {name(myPair.c === guestId ? myPair.b : myPair.c)} — tonight’s a trio.
                    </Body>
                  )}
                  <Spacer h={space.m} />
                  <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Display size={type.h1} color={onAccent}>
                      {myPair.score}%
                    </Display>
                    <Body color={onAccent} size={14}>
                      {myPair.compat.headline}
                    </Body>
                  </Row>
                  <Spacer h={space.m} />
                  <Body color={onAccent} size={15}>
                    Say hello: {phone(otherId) || '(shared at the event)'}
                  </Body>
                </View>

                {/* Radar */}
                {me && them && (
                  <>
                    <Spacer h={space.xl} />
                    <SectionHeading>How you two line up</SectionHeading>
                    <Body color={text.hint} size={14} style={{ marginBottom: space.m }}>
                      Big Five traits, feeling vs. thinking, and ego development —
                      the closer the shapes, the more alike you are.
                    </Body>
                    <RadarChart
                      axes={myPair.radar}
                      aColor={accent}
                      bColor={palette.cream}
                      aLabel="You"
                      bLabel={name(otherId)}
                    />
                    <Spacer h={space.l} />
                    <Row style={{ gap: space.m }}>
                      <TypeBadge label="You" type={me.mbtiType} stage={me.egoStage} />
                      <TypeBadge label={name(otherId)} type={them.mbtiType} stage={them.egoStage} />
                    </Row>

                    {/* Trait-by-trait linear comparison (match.box ScaleList) */}
                    <Spacer h={space.xl} />
                    <SectionHeading>Trait by trait</SectionHeading>
                    <Body color={text.hint} size={14} style={{ marginBottom: space.l }}>
                      Where each of you falls — you in {event.accent}, {name(otherId)} in cream.
                    </Body>
                    <ScaleComparison axes={myPair.radar} aColor={accent} bColor={palette.cream} />
                  </>
                )}

                {/* Compatibility breakdown */}
                <Spacer h={space.xl} />
                <SectionHeading>What’s driving the match</SectionHeading>
                <Bar label="Shared values" value={myPair.compat.breakdown.values} accent={accent} />
                <Bar label="Temperament fit" value={myPair.compat.breakdown.big5} accent={accent} />
                <Bar label="Type chemistry" value={myPair.compat.breakdown.mbti} accent={accent} />
                <Bar
                  label="Same wavelength"
                  value={myPair.compat.breakdown.ego}
                  accent={accent}
                />
              </>
            );
          })()}

          <Spacer h={space.xl} />
          <SectionHeading>Why you two</SectionHeading>
          {myPair.reasons.map((reason) => (
            <Row key={reason.questionId} style={{ alignItems: 'flex-start', marginBottom: space.m }}>
              <Body color={accent} style={{ marginRight: space.m }}>
                {reason.kind === 'both-disagree' ? '✗✗' : '✓✓'}
              </Body>
              <Body color={text.secondary} style={{ flex: 1 }}>
                You both {reason.kind === 'both-disagree' ? 'pushed back on' : 'leaned into'}: “
                {reason.statement}”
              </Body>
            </Row>
          ))}
          <Spacer h={space.xl} />
        </>
      ) : null}

      {/* Full room results */}
      <SectionHeading>The matches</SectionHeading>
      {pairs.length === 0 ? (
        <Body color={text.whisper}>No eligible pairs yet.</Body>
      ) : (
        pairs.map((pair, i) => (
          <View key={i} style={styles.pairRow}>
            <View style={[styles.pairBadge, { backgroundColor: accent }]}>
              <MonoLabel size={10} color={onAccent}>
                {String(i + 1).padStart(2, '0')}
              </MonoLabel>
            </View>
            <View style={{ flex: 1 }}>
              <Body color={text.primary} weight="600">
                {name(pair.a)} ✕ {name(pair.b)}
                {pair.c ? ` ✕ ${name(pair.c)}` : ''}
              </Body>
              <Body color={text.whisper} size={13}>
                {pair.score}% · {pair.compat.headline}
              </Body>
            </View>
          </View>
        ))
      )}

      <Spacer h={space.xxl} />
      <SectionHeading>Receipts</SectionHeading>
      <Body color={text.hint} size={15} style={{ marginBottom: space.l }}>
        Superlatives for the room, straight from the answers.
      </Body>
      {receipts.map((receipt) => (
        <View key={receipt.title} style={styles.receiptCard}>
          <Body size={26}>{receipt.emoji}</Body>
          <View style={{ flex: 1, marginLeft: space.l }}>
            <Body color={text.primary} weight="700">
              {receipt.title}: {name(receipt.guestId)}
            </Body>
            <Body color={text.hint} size={14}>
              {receipt.detail}
            </Body>
          </View>
        </View>
      ))}
      <Spacer h={space.xxl} />
    </Screen>
  );
}

function Bar({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={{ marginBottom: space.m }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
        <Body color={text.secondary} size={14}>
          {label}
        </Body>
        <MonoLabel size={11} color={text.hint}>
          {Math.round(value * 100)}
        </MonoLabel>
      </Row>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.round(value * 100)}%`, backgroundColor: accent }]} />
      </View>
    </View>
  );
}

function TypeBadge({ label, type: t, stage }: { label: string; type: string; stage: string }) {
  return (
    <View style={styles.typeBadge}>
      <MonoLabel size={9} color={text.whisper}>
        {label}
      </MonoLabel>
      <Display size={type.h3} style={{ marginTop: 2 }}>
        {t}
      </Display>
      <Body color={text.hint} size={12}>
        {stage}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  teaserBar: { width: 16, height: 56, borderRadius: 8 },
  matchCard: { borderRadius: radius.card, padding: space.xl },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(216,207,197,0.12)',
  },
  barFill: { height: 6, borderRadius: 3 },
  typeBadge: {
    flex: 1,
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.input,
    padding: space.l,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.input,
    padding: space.l,
    marginBottom: space.s,
    gap: space.l,
  },
  pairBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.input,
    padding: space.l,
    marginBottom: space.s,
  },
});
