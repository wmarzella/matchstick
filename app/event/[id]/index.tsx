import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { ActionCard, AdminButton, Section, Stat } from '../../../src/components/admin';
import {
  Body,
  Display,
  MonoLabel,
  PrimaryButton,
  Row,
  Screen,
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
import type { Guest } from '../../../src/store/types';

const shortName = (g: Guest) =>
  `${g.firstName} ${g.lastName ? g.lastName[0] + '.' : ''}`.trim();

export default function AdminDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getEvent,
    guestsOf,
    calculateMatches,
    addDemoParticipants,
    removeDemoParticipants,
    deleteEvent,
    backendKind,
  } = useStore();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const event = getEvent(id);
  if (!event) {
    return (
      <Screen>
        <Display size={type.h2}>Event not found</Display>
        <Spacer />
        <PrimaryButton label="Go home" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const guests = guestsOf(event.id);
  const submitted = guests.filter((g) => g.completedAt != null);
  const accent = palette[event.accent];
  const onAccent = textOnAccent[event.accent];
  const hasDemo = guests.some((g) => g.isDemo);
  const matched = event.results != null;
  const remaining = Math.max(0, event.maxGuests - guests.length);

  return (
    <Screen>
      {/* Header */}
      <Pressable onPress={() => router.replace('/')} hitSlop={10}>
        <Body color={text.hint}>‹ Home</Body>
      </Pressable>
      <Spacer h={space.l} />
      <Display size={type.h1}>
        {event.title}{' '}
        <Display size={type.h1} color={text.hint}>
          Admin Controls
        </Display>
      </Display>
      <Spacer h={space.m} />
      <MonoLabel size={12} color={text.hint}>
        {event.date || 'No date set'}
      </MonoLabel>
      <Spacer h={space.xs} />
      <MonoLabel size={12} color={text.hint}>
        {submitted.length} / {guests.length} guests
      </MonoLabel>
      <Spacer h={space.xs} />
      <Row style={{ gap: space.s }}>
        <View style={[styles.accentDot, { backgroundColor: accent }]} />
        <MonoLabel size={12} color={text.hint}>
          {event.mode} · {event.questionIds.length} questions
          {backendKind === 'supabase' ? ' · live' : ''}
        </MonoLabel>
      </Row>

      {/* Tab indicator */}
      <View style={styles.tabBar}>
        <View style={styles.tabActive}>
          <Body color={text.primary} weight="600">
            Matching
          </Body>
          <View style={[styles.tabUnderline, { backgroundColor: palette.cream }]} />
        </View>
        <Pressable onPress={() => router.push(`/event/${event.id}/manage`)} hitSlop={8}>
          <Body color={text.hint}>Manage</Body>
        </Pressable>
      </View>

      <Spacer h={space.xl} />

      {/* 1. Signups */}
      <Section
        index={1}
        title="Signups"
        subtitle="Distribute your questionnaire to your guests and wait for them to complete it."
      >
        <ActionCard title="Distribute your questionnaire">
          <Body color={text.hint} size={14} style={{ marginBottom: space.m }}>
            Share your unique link to let guests sign up.
          </Body>
          <Row style={{ gap: space.s }}>
            <View style={styles.linkBox}>
              <Body
                style={{ fontFamily: 'SpaceMono-Regular', color: text.secondary }}
                size={12}
                numberOfLines={1}
              >
                matchstick.app/{event.slug}
              </Body>
            </View>
            <Pressable style={styles.iconBtn} hitSlop={6}>
              <Body color={text.secondary}>⧉</Body>
            </Pressable>
          </Row>
          <Spacer h={space.l} />
          <Row style={{ gap: space.xl, alignItems: 'center' }}>
            <FauxQr seed={event.slug} />
            <View style={{ flex: 1 }}>
              <Row style={{ gap: space.xl }}>
                <Stat value={submitted.length} label="Submitted" />
                <Stat value={remaining} label="Remaining seats" />
              </Row>
            </View>
          </Row>
          <Spacer h={space.l} />
          <AdminButton
            label={hasDemo ? 'Remove demo participants' : 'Add demo participants'}
            onPress={() =>
              hasDemo ? removeDemoParticipants(event.id) : addDemoParticipants(event.id, 4)
            }
          />
          <Spacer h={space.m} />
          <PrimaryButton
            label="Open the guest flow"
            tone="dim"
            onPress={() => router.push(`/event/${event.id}/join`)}
          />
        </ActionCard>

        {guests.length > 0 && (
          <View style={{ marginTop: space.l }}>
            {guests.map((g) => (
              <Row key={g.id} style={styles.guestRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: g.completedAt
                        ? palette.statusGreen
                        : palette.statusYellow,
                    },
                  ]}
                />
                <Body color={text.secondary} style={{ flex: 1 }}>
                  {g.firstName} {g.lastName}
                </Body>
                {g.isDemo && (
                  <View style={styles.demoBadge}>
                    <MonoLabel size={9} color={text.hint}>
                      Demo
                    </MonoLabel>
                  </View>
                )}
              </Row>
            ))}
          </View>
        )}
      </Section>

      {/* 2. Matching */}
      <Section
        index={2}
        title="Matching"
        subtitle={`Use the algorithm to calculate the optimal ${event.mode} matches among everyone who has signed up.`}
      >
        {/* name cloud */}
        {submitted.length > 0 && (
          <View style={styles.cloud}>
            {submitted.map((g) => (
              <View key={g.id} style={styles.cloudName}>
                <Display size={type.h3} color={text.secondary}>
                  {shortName(g)}
                </Display>
              </View>
            ))}
          </View>
        )}
        <Spacer h={space.l} />
        {submitted.length < 2 ? (
          <Body color={text.whisper} size={14}>
            You need at least 2 participants to match.
          </Body>
        ) : (
          <>
            <AdminButton
              label={matched ? 'Recalculate' : 'Calculate'}
              tone="solid"
              onPress={() => calculateMatches(event.id)}
            />
            {matched && event.results && (
              <View style={{ marginTop: space.l }}>
                <MonoLabel size={10} color={text.whisper} style={{ marginBottom: space.m }}>
                  {event.results.pairs.length} matched
                </MonoLabel>
                {event.results.pairs.map((pair, i) => {
                  const a = guests.find((g) => g.id === pair.a);
                  const b = guests.find((g) => g.id === pair.b);
                  const c = pair.c ? guests.find((g) => g.id === pair.c) : undefined;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => router.push(`/event/${event.id}/reveal`)}
                      style={styles.matchRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Body color={text.primary} weight="600">
                          {a ? shortName(a) : '?'} + {b ? shortName(b) : '?'}
                          {c ? ` + ${shortName(c)}` : ''}
                        </Body>
                        <Body color={text.whisper} size={12}>
                          {pair.compat.headline}
                        </Body>
                      </View>
                      <View style={[styles.scorePill, { backgroundColor: accent }]}>
                        <MonoLabel size={12} color={onAccent}>
                          {pair.score}%
                        </MonoLabel>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}
      </Section>

      {/* 3. Finalize */}
      <Section
        index={3}
        title="Finalize results"
        subtitle="If these matches look good, confirm you’re ready to reveal them."
      >
        <ActionCard disabled={!matched}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Body color={matched ? text.primary : text.hint} weight="600">
              {matched ? 'Ready to reveal' : 'Calculate matches first'}
            </Body>
            {matched && (
              <View style={[styles.readyDot, { backgroundColor: palette.statusGreen }]} />
            )}
          </Row>
        </ActionCard>
      </Section>

      {/* 4. Reveal */}
      <Section
        index={4}
        title="Reveal"
        subtitle="The big moment. Send the teaser, then reveal everyone’s match at once."
      >
        <Row style={{ gap: space.m }}>
          <View style={{ flex: 1 }}>
            <AdminButton
              label="Send teaser"
              disabled={!matched}
              onPress={() => router.push(`/event/${event.id}/reveal?teaser=1`)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AdminButton
              label="Send matches"
              tone="solid"
              disabled={!matched}
              onPress={() => router.push(`/event/${event.id}/reveal`)}
            />
          </View>
        </Row>
      </Section>

      {/* Delete */}
      {!event.isDemo &&
        (confirmingDelete ? (
          <Row style={{ justifyContent: 'center', gap: space.xl }}>
            <Pressable
              onPress={() => {
                deleteEvent(event.id);
                router.replace('/');
              }}
            >
              <Body color={palette.statusRed}>Yes, delete this event</Body>
            </Pressable>
            <Pressable onPress={() => setConfirmingDelete(false)}>
              <Body color={text.hint}>Keep it</Body>
            </Pressable>
          </Row>
        ) : (
          <Pressable onPress={() => setConfirmingDelete(true)}>
            <Body color={text.whisper} size={14} style={{ textAlign: 'center' }}>
              Delete event
            </Body>
          </Pressable>
        ))}
      <Spacer h={space.xxl} />
    </Screen>
  );
}

/** Deterministic decorative QR-style block. */
function FauxQr({ seed }: { seed: string }) {
  const cells: boolean[] = [];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = 0; i < 81; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    cells.push((h & 0xff) > 100);
  }
  const SIZE = 84;
  const cell = SIZE / 9;
  return (
    <View style={{ backgroundColor: palette.creamBright, padding: 7, borderRadius: 8 }}>
      <Svg width={SIZE} height={SIZE}>
        {cells.map((on, i) =>
          on ? (
            <Rect
              key={i}
              x={(i % 9) * cell}
              y={Math.floor(i / 9) * cell}
              width={cell - 1}
              height={cell - 1}
              fill="#09110d"
            />
          ) : null,
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  accentDot: { width: 10, height: 10, borderRadius: 5 },
  tabBar: {
    flexDirection: 'row',
    gap: space.xl,
    alignItems: 'center',
    marginTop: space.xl,
    borderBottomWidth: 1,
    borderBottomColor: border.default,
    paddingBottom: space.m,
  },
  tabActive: { alignItems: 'center' },
  tabUnderline: {
    height: 2,
    width: '100%',
    marginTop: space.s,
    position: 'absolute',
    bottom: -space.m - 1,
  },
  linkBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: border.default,
    borderRadius: 7,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: palette.surfaceSunken,
    justifyContent: 'center',
  },
  iconBtn: {
    width: 46,
    borderWidth: 1.5,
    borderColor: border.default,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216,207,197,0.08)',
    paddingVertical: space.m,
    gap: space.m,
    alignItems: 'center',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  demoBadge: {
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.m,
    alignItems: 'center',
  },
  cloudName: { opacity: 0.9 },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.input,
    padding: space.l,
    marginBottom: space.s,
    gap: space.m,
  },
  scorePill: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  readyDot: { width: 10, height: 10, borderRadius: 5 },
});
