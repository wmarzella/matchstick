import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import {
  Body,
  Display,
  MonoLabel,
  PrimaryButton,
  Screen,
  Spacer,
} from '../../../src/components/ui';
import { useStore } from '../../../src/store';
import { palette, space, text, type } from '../../../src/theme';

export default function Done() {
  const { id, guest: guestId } = useLocalSearchParams<{ id: string; guest: string }>();
  const { getEvent } = useStore();
  const event = getEvent(id);

  if (!event) {
    return (
      <Screen>
        <Display size={type.h2}>Event not found</Display>
      </Screen>
    );
  }

  const accent = palette[event.accent];

  return (
    <Screen scroll={false} style={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 16,
            height: 56,
            borderRadius: 8,
            backgroundColor: accent,
            marginBottom: space.xl,
          }}
        />
        <MonoLabel size={11}>You’re in</MonoLabel>
        <Spacer h={space.m} />
        <Display size={type.h1} style={{ textAlign: 'center' }}>
          Now we wait<Display size={type.h1} italic>.</Display>
        </Display>
        <Spacer h={space.l} />
        <Body color={text.hint} style={{ textAlign: 'center', maxWidth: 300 }}>
          When everyone has answered, your host strikes the matches and the whole room finds
          out together.
        </Body>
        <Spacer h={space.xxl} />
        <PrimaryButton
          label="Watch for the reveal"
          arrow
          onPress={() => router.replace(`/event/${event.id}/reveal?guest=${guestId ?? ''}`)}
        />
        <Spacer h={space.l} />
        {guestId ? (
          <Body
            color={text.secondary}
            size={14}
            onPress={() => router.push(`/profile/${guestId}` as never)}
            style={{ textDecorationLine: 'underline' }}
          >
            see your portable profile
          </Body>
        ) : null}
        <Spacer h={space.s} />
        <Body
          color={text.whisper}
          size={14}
          onPress={() => router.replace(`/event/${event.id}`)}
          style={{ textDecorationLine: 'underline' }}
        >
          back to the event page
        </Body>
      </View>
    </Screen>
  );
}
