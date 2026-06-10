import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Body,
  Display,
  MonoLabel,
  PrimaryButton,
  Screen,
  Spacer,
} from '../src/components/ui';
import { useStore } from '../src/store';
import { border, palette, radius, space, text, type } from '../src/theme';

export default function Events() {
  const { events, guestsOf } = useStore();

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={10}>
        <Body color={text.hint}>‹ Home</Body>
      </Pressable>
      <Spacer h={space.l} />
      <Display size={type.h1}>Upcoming events</Display>
      <Body color={text.hint} style={{ marginTop: space.s }}>
        Events on this device. Tap one to join as a guest.
      </Body>
      <Spacer h={space.xl} />

      {events.length === 0 ? (
        <View style={styles.empty}>
          <Body color={text.whisper} style={{ textAlign: 'center' }}>
            Nothing here yet.
          </Body>
          <Spacer />
          <PrimaryButton label="Host the first one" onPress={() => router.push('/host/setup')} />
        </View>
      ) : (
        events.map((event) => {
          const guests = guestsOf(event.id);
          return (
            <Pressable
              key={event.id}
              onPress={() => router.push(`/event/${event.id}/join`)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            >
              <View style={[styles.stripe, { backgroundColor: palette[event.accent] }]} />
              <View style={{ flex: 1, padding: space.l }}>
                <Display size={type.h3}>{event.title}</Display>
                <Body color={text.hint} size={14} style={{ marginTop: 2 }}>
                  hosted by {event.hostName}
                  {event.date ? ` · ${event.date}` : ''}
                </Body>
                <Spacer h={space.s} />
                <MonoLabel size={10} color={text.whisper}>
                  {guests.length} signed up · {event.mode}
                  {event.isDemo ? ' · demo' : ''}
                </MonoLabel>
              </View>
              <Body color={text.hint} style={{ paddingRight: space.l }}>
                →
              </Body>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.card,
    padding: space.xxl,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.card,
    marginBottom: space.m,
    overflow: 'hidden',
  },
  stripe: {
    width: 6,
    alignSelf: 'stretch',
  },
});
