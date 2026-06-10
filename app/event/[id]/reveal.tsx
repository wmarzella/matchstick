import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { CountdownOdometer } from '../../../src/components/CountdownOdometer';
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
import { QUESTIONS } from '../../../src/data/questions';
import { pickStarters } from '../../../src/data/starters';
import { useStore } from '../../../src/store';
import {
  border,
  ink,
  palette,
  radius,
  space,
  text,
  textOnAccent,
  type,
} from '../../../src/theme';
import type { MatchPair } from '../../../src/engine/matching';

export default function Reveal() {
  const { id, guest: guestId, teaser } = useLocalSearchParams<{
    id: string;
    guest?: string;
    teaser?: string;
  }>();
  const { getEvent, guestsOf } = useStore();
  const event = getEvent(id);
  const [count, setCount] = useState(teaser ? -1 : 5);
  const [flipped, setFlipped] = useState(false);
  const [starterSeed, setStarterSeed] = useState(0);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const guests = guestsOf(event?.id ?? '');
  const guestById = (gid: string) => guests.find((x) => x.id === gid);
  const firstName = (gid: string) => guestById(gid)?.firstName ?? '?';
  const fullName = (gid: string) => {
    const g = guestById(gid);
    return g ? `${g.firstName}\n${g.lastName}` : '?';
  };

  const myPair: MatchPair | undefined = useMemo(() => {
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

  // Teaser: anticipation only, no result.
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
          Matches reveal for everyone at the same moment. Stay close.
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

  // Synchronized countdown — odometer wheels with the group overlay.
  if (count > 0) {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center' }}>
        <CountdownOdometer seconds={count} accent={accent} />
        <Body color={text.whisper} style={{ textAlign: 'center' }}>
          Everyone sees this together.
        </Body>
      </Screen>
    );
  }

  const { pairs, receipts, profiles } = event.results;

  /* ----- personal result (participant view) ----- */
  const personal = (() => {
    if (!myPair || !guestId) return null;
    const otherId = myPair.a === guestId ? myPair.b : myPair.a;
    const other = guestById(otherId);
    const me = profiles[guestId];
    const them = profiles[otherId];
    const date = event.date || new Date(event.createdAt).toISOString().slice(0, 10);

    // "Why you matched" prose from the engine's aligned statements.
    const leans = myPair.reasons.filter((r) => r.kind !== 'both-disagree');
    const pushbacks = myPair.reasons.filter((r) => r.kind === 'both-disagree');

    // Conversation starters weighted by the event's themes; Shuffle re-rolls.
    const starters = pickStarters(event.themes, 3, mulberry(starterSeed + hashStr(guestId)));

    return (
      <>
        <Display size={type.hero}>The results are in.</Display>
        <Spacer h={space.m} />
        <Body color={text.hint} size={18}>
          <Body color={text.primary} weight="700" size={18}>
            Your optimal match
          </Body>{' '}
          for <Body size={18} style={{ fontStyle: 'italic' }}>{event.title}</Body> is:
        </Body>
        <Spacer h={space.l} />

        {/* Cream flip name-card */}
        <Pressable onPress={() => setFlipped((f) => !f)} style={styles.nameCard}>
          {!flipped ? (
            <>
              <Display size={56} color={ink.primary} style={{ lineHeight: 58 }}>
                {fullName(otherId)}
              </Display>
              <Spacer h={space.xl} />
              <Row style={{ justifyContent: 'space-between' }}>
                <MonoLabel size={13} color={ink.secondary}>
                  + You
                </MonoLabel>
                <MonoLabel size={13} color={ink.secondary}>
                  {date}
                </MonoLabel>
              </Row>
            </>
          ) : (
            <>
              <MonoLabel size={11} color={ink.hint}>
                Match details
              </MonoLabel>
              <Spacer h={space.m} />
              <Body color={ink.primary} weight="700" size={20}>
                {other?.firstName} {other?.lastName}
              </Body>
              <Body color={ink.secondary} size={16} style={{ marginTop: 4 }}>
                {other?.phone ? other.phone : 'Number shared at the event'}
              </Body>
              <Spacer h={space.m} />
              <Row style={{ justifyContent: 'space-between' }}>
                <MonoLabel size={12} color={ink.secondary}>
                  {myPair.score}% compatible
                </MonoLabel>
                <MonoLabel size={12} color={ink.hint}>
                  tap to flip back
                </MonoLabel>
              </Row>
            </>
          )}
        </Pressable>

        <Spacer h={space.l} />
        <Body color={text.hint}>
          You’re both in{' '}
          <Body color={text.primary} weight="700">
            Group 1
          </Body>
          .
        </Body>
        <Spacer h={space.l} />

        {/* Message button with notification badge */}
        <View>
          <Pressable
            style={styles.messageBtn}
            onPress={() => {
              if (other?.phone) Linking.openURL(`sms:${other.phone}`).catch(() => {});
            }}
          >
            <MonoLabel size={12} color={text.secondary}>
              💬 Send {firstName(otherId)} a message
            </MonoLabel>
          </Pressable>
          <View style={styles.badge}>
            <Body color="#fff" size={11} weight="700">
              1
            </Body>
          </View>
        </View>

        {/* Why you matched */}
        <Spacer h={space.xxl} />
        <SectionHeading>Why you matched:</SectionHeading>
        <Body color={text.hint} size={17}>
          You and {firstName(otherId)} both leaned into{' '}
          {leans.map((r, i) => (
            <React.Fragment key={r.questionId}>
              <Body color={text.primary} weight="700" size={17}>
                “{r.statement.toLowerCase()}”
              </Body>
              {i < leans.length - 1 ? ' and ' : ''}
            </React.Fragment>
          ))}
          {pushbacks.length > 0 && (
            <>
              {leans.length > 0 ? ' — and you both pushed back on ' : 'You both pushed back on '}
              {pushbacks.map((r, i) => (
                <React.Fragment key={r.questionId}>
                  <Body color={text.primary} weight="700" size={17}>
                    “{r.statement.toLowerCase()}”
                  </Body>
                  {i < pushbacks.length - 1 ? ' and ' : ''}
                </React.Fragment>
              ))}
            </>
          )}
          . {myPair.compat.headline}
        </Body>

        {/* Discuss these */}
        <Spacer h={space.xxl} />
        <SectionHeading>Discuss these, if you’d like:</SectionHeading>
        {starters.map((s, i) => (
          <Row key={s} style={{ alignItems: 'flex-start', marginBottom: space.m }}>
            <MonoLabel size={12} color={text.whisper} style={{ marginTop: 3, width: 24 }}>
              {i + 1}.
            </MonoLabel>
            <Body color={text.secondary} style={{ flex: 1 }}>
              {s}
            </Body>
          </Row>
        ))}
        <Pressable style={styles.shuffleBtn} onPress={() => setStarterSeed((s) => s + 1)}>
          <MonoLabel size={12} color={text.secondary}>
            Shuffle
          </MonoLabel>
        </Pressable>

        {/* Psychometric extras — Matchstick's additions */}
        {me && them && (
          <>
            <Spacer h={space.xxl} />
            <SectionHeading>How you two line up</SectionHeading>
            <Body color={text.hint} size={14} style={{ marginBottom: space.m }}>
              Big Five, feeling vs. thinking, and ego development — the closer the
              shapes, the more alike you are.
            </Body>
            <RadarChart
              axes={myPair.radar}
              aColor={accent}
              bColor={palette.cream}
              aLabel="You"
              bLabel={firstName(otherId)}
            />
            <Spacer h={space.l} />
            <Row style={{ gap: space.m }}>
              <TypeBadge label="You" mbti={me.mbtiType} stage={me.egoStage} />
              <TypeBadge label={firstName(otherId)} mbti={them.mbtiType} stage={them.egoStage} />
            </Row>
            <Spacer h={space.xl} />
            <SectionHeading>Trait by trait</SectionHeading>
            <Spacer h={space.s} />
            <ScaleComparison axes={myPair.radar} aColor={accent} bColor={palette.cream} />
            <Spacer h={space.s} />
            <Bar label="Shared values" value={myPair.compat.breakdown.values} accent={accent} />
            <Bar label="Temperament fit" value={myPair.compat.breakdown.big5} accent={accent} />
            <Bar label="Type chemistry" value={myPair.compat.breakdown.mbti} accent={accent} />
            <Bar label="Same wavelength" value={myPair.compat.breakdown.ego} accent={accent} />
          </>
        )}

        {/* Host CTA */}
        <Spacer h={space.xxl} />
        <Body color={text.hint} style={{ textAlign: 'center' }}>
          Want to run your own night?{' '}
          <Body
            color={text.secondary}
            style={{ textDecorationLine: 'underline' }}
            onPress={() => router.push('/host/setup')}
          >
            Host an event.
          </Body>
        </Body>
        <Spacer h={space.xxl} />
        <View style={styles.divider} />
        <Spacer h={space.xl} />
      </>
    );
  })();

  return (
    <Screen>
      <Pressable onPress={() => router.replace(`/event/${event.id}`)} hitSlop={10}>
        <Body color={text.hint}>‹ {event.title}</Body>
      </Pressable>
      <Spacer h={space.l} />

      {personal}

      {/* Full room results (host view / below personal) */}
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
                {firstName(pair.a)} {guestById(pair.a)?.lastName?.[0] ?? ''}. ✕{' '}
                {firstName(pair.b)} {guestById(pair.b)?.lastName?.[0] ?? ''}.
                {pair.c ? ` ✕ ${firstName(pair.c)}` : ''}
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
              {receipt.title}: {firstName(receipt.guestId)}
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
        <View
          style={[styles.barFill, { width: `${Math.round(value * 100)}%`, backgroundColor: accent }]}
        />
      </View>
    </View>
  );
}

function TypeBadge({ label, mbti, stage }: { label: string; mbti: string; stage: string }) {
  return (
    <View style={styles.typeBadge}>
      <MonoLabel size={9} color={text.whisper}>
        {label}
      </MonoLabel>
      <Display size={type.h3} style={{ marginTop: 2 }}>
        {mbti}
      </Display>
      <Body color={text.hint} size={12}>
        {stage}
      </Body>
    </View>
  );
}

/* deterministic shuffle helpers */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function mulberry(seed: number): () => number {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const styles = StyleSheet.create({
  teaserBar: { width: 16, height: 56, borderRadius: 8 },
  nameCard: {
    backgroundColor: palette.cream,
    borderRadius: radius.tray,
    padding: space.xl,
  },
  messageBtn: {
    backgroundColor: 'rgba(216,207,197,0.08)',
    borderRadius: radius.input,
    paddingVertical: 16,
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: palette.statusRed,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shuffleBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(216,207,197,0.08)',
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: space.s,
  },
  divider: { height: 1, backgroundColor: border.default },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(216,207,197,0.12)' },
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
