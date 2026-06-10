import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
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
import { border, palette, radius, space, text, textOnAccent, type } from '../../../src/theme';

export default function EventPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEvent, guestsOf, calculateMatches, deleteEvent } = useStore();
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
  const completed = guests.filter((g) => g.completedAt != null);
  const accent = palette[event.accent];
  const matched = event.results != null;

  const strike = () => {
    calculateMatches(event.id);
    router.push(`/event/${event.id}/reveal`);
  };

  return (
    <Screen>
      <Pressable onPress={() => router.replace('/')} hitSlop={10}>
        <Body color={text.hint}>‹ Home</Body>
      </Pressable>
      <Spacer h={space.l} />

      <Row style={{ gap: space.m }}>
        <View style={[styles.accentDot, { backgroundColor: accent }]} />
        <MonoLabel size={11}>{event.isDemo ? 'Demo event' : 'Your event'}</MonoLabel>
      </Row>
      <Spacer h={space.s} />
      <Display size={type.h1}>{event.title}</Display>
      <Body color={text.hint} style={{ marginTop: 4 }}>
        a Matchstick event hosted by {event.hostName}
        {event.date ? ` · ${event.date}` : ''}
      </Body>

      <Spacer h={space.xl} />

      {/* Share card */}
      <View style={[styles.card, { borderColor: border.default }]}>
        <MonoLabel size={11} style={{ marginBottom: space.m }}>
          Guests join at
        </MonoLabel>
        <View style={[styles.linkBox, { backgroundColor: accent }]}>
          <Body
            weight="700"
            color={textOnAccent[event.accent]}
            style={{ textAlign: 'center' }}
          >
            matchstick.app/{event.slug}
          </Body>
        </View>
        <Spacer h={space.l} />
        <Row style={{ gap: space.l, alignItems: 'flex-start' }}>
          <FauxQr accent={accent} seed={event.slug} />
          <View style={{ flex: 1 }}>
            <Body color={text.hint} size={14}>
              Show this QR at the door, or share the link. Guests answer on their phones — no
              app store, no account.
            </Body>
            <Spacer h={space.m} />
            <Pressable onPress={() => router.push(`/event/${event.id}/join`)}>
              <Body color={text.secondary} style={{ textDecorationLine: 'underline' }}>
                Open the guest flow on this phone →
              </Body>
            </Pressable>
          </View>
        </Row>
      </View>

      <Spacer h={space.xl} />

      {/* Signups */}
      <SectionHeading>
        Signups{' '}
        <Display size={type.h2} color={text.hint}>
          — {completed.length} of {guests.length} done
        </Display>
      </SectionHeading>
      {guests.length === 0 ? (
        <Body color={text.whisper}>No guests yet. Share the link above.</Body>
      ) : (
        guests.map((guest) => (
          <Row key={guest.id} style={styles.guestRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: guest.completedAt ? palette.statusGreen : palette.statusYellow,
                },
              ]}
            />
            <Body color={text.secondary} style={{ flex: 1 }}>
              {guest.firstName} {guest.lastName}.
            </Body>
            <MonoLabel size={10} color={text.whisper}>
              {guest.completedAt ? 'done' : 'answering'}
            </MonoLabel>
          </Row>
        ))
      )}

      <Spacer h={space.xxl} />

      {/* Matching */}
      {matched ? (
        <PrimaryButton
          label="View the reveal"
          arrow
          onPress={() => router.push(`/event/${event.id}/reveal`)}
        />
      ) : (
        <>
          <PrimaryButton
            label={`Strike matches (${completed.length})`}
            disabled={completed.length < 2}
            onPress={strike}
          />
          {completed.length < 2 && (
            <Body color={text.whisper} size={14} style={{ marginTop: space.m, textAlign: 'center' }}>
              You need at least two finished questionnaires.
            </Body>
          )}
        </>
      )}

      <Spacer h={space.xxl} />
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
    </Screen>
  );
}

/** Decorative deterministic QR-style block (real QR lib optional later). */
function FauxQr({ accent, seed }: { accent: string; seed: string }) {
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
  const SIZE = 90;
  const cell = SIZE / 9;
  return (
    <View style={{ backgroundColor: palette.creamBright, padding: 8, borderRadius: 8 }}>
      <Svg width={SIZE} height={SIZE}>
        {cells.map((on, i) =>
          on ? (
            <Rect
              key={i}
              x={(i % 9) * cell}
              y={Math.floor(i / 9) * cell}
              width={cell - 1}
              height={cell - 1}
              fill="#0d1511"
            />
          ) : null,
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  accentDot: { width: 12, height: 12, borderRadius: 6 },
  card: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: space.xl,
  },
  linkBox: {
    borderRadius: radius.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  guestRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(243,239,230,0.08)',
    paddingVertical: space.m,
    gap: space.m,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
