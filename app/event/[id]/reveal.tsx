import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
  const { id, guest: guestId } = useLocalSearchParams<{ id: string; guest?: string }>();
  const { getEvent, guestsOf } = useStore();
  const event = getEvent(id);
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 900);
    return () => clearTimeout(t);
  }, [count]);

  const guests = guestsOf(event?.id ?? '');
  const name = (gid: string) => {
    const g = guests.find((x) => x.id === gid);
    return g ? `${g.firstName} ${g.lastName}.` : '?';
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

  const accent = palette[event.accent];

  // Synchronized-countdown moment
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

  const { pairs, receipts } = event.results;

  return (
    <Screen>
      <Pressable onPress={() => router.replace(`/event/${event.id}`)} hitSlop={10}>
        <Body color={text.hint}>‹ {event.title}</Body>
      </Pressable>
      <Spacer h={space.l} />

      {/* Personal match card when arriving as a guest */}
      {myPair && guestId ? (
        <>
          <MonoLabel size={11}>Your match</MonoLabel>
          <Spacer h={space.s} />
          <View style={[styles.matchCard, { backgroundColor: accent }]}>
            <Display size={type.h1} color={textOnAccent[event.accent]}>
              {name(myPair.a === guestId ? myPair.b : myPair.a)}
            </Display>
            {myPair.c && (
              <Body color={textOnAccent[event.accent]} style={{ marginTop: 4 }}>
                …and {name(myPair.c === guestId ? myPair.b : myPair.c)} — tonight is a trio.
              </Body>
            )}
            <Spacer h={space.l} />
            <Row style={{ justifyContent: 'space-between' }}>
              <MonoLabel size={11} color={textOnAccent[event.accent]}>
                Match quality
              </MonoLabel>
              <MonoLabel size={11} color={textOnAccent[event.accent]}>
                top {Math.max(1, 100 - myPair.quality)}%
              </MonoLabel>
            </Row>
            <View style={styles.qualityTrack}>
              <View
                style={[
                  styles.qualityFill,
                  {
                    width: `${myPair.quality}%`,
                    backgroundColor: textOnAccent[event.accent],
                  },
                ]}
              />
            </View>
            <Spacer h={space.l} />
            <Body color={textOnAccent[event.accent]} size={15}>
              Say hello: {phone(myPair.a === guestId ? myPair.b : myPair.a)}
            </Body>
          </View>

          <Spacer h={space.l} />
          <SectionHeading>Why you two</SectionHeading>
          {myPair.reasons.map((reason) => (
            <Row key={reason.questionId} style={{ alignItems: 'flex-start', marginBottom: space.m }}>
              <Body color={accent} style={{ marginRight: space.m }}>
                {reason.kind === 'both-disagree' ? '✗✗' : '✓✓'}
              </Body>
              <Body color={text.secondary} style={{ flex: 1 }}>
                You both {reason.kind === 'both-disagree' ? 'pushed back on' : 'leaned into'}:{' '}
                “{reason.statement}”
              </Body>
            </Row>
          ))}
          <Spacer h={space.xl} />
        </>
      ) : null}

      {/* Full room results (host view) */}
      <SectionHeading>The matches</SectionHeading>
      {pairs.length === 0 ? (
        <Body color={text.whisper}>No eligible pairs — need more finished questionnaires.</Body>
      ) : (
        pairs.map((pair, i) => (
          <View key={i} style={styles.pairRow}>
            <View style={[styles.pairBadge, { backgroundColor: accent }]}>
              <MonoLabel size={10} color={textOnAccent[event.accent]}>
                {String(i + 1).padStart(2, '0')}
              </MonoLabel>
            </View>
            <View style={{ flex: 1 }}>
              <Body color={text.primary} weight="600">
                {name(pair.a)} ✕ {name(pair.b)}
                {pair.c ? ` ✕ ${name(pair.c)}` : ''}
              </Body>
              <Body color={text.whisper} size={13}>
                quality {pair.quality}/100
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

const styles = StyleSheet.create({
  matchCard: {
    borderRadius: radius.card,
    padding: space.xl,
  },
  qualityTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginTop: space.s,
  },
  qualityFill: {
    height: 4,
    borderRadius: 2,
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
