import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
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
import { border, palette, space, text, type } from '../../../src/theme';

/**
 * Participant confirmation — match.box's "You're in." screen: title, a stats row
 * (events / answers / hot takes) with hairline borders, and a share-your-link CTA.
 */
export default function Confirmation() {
  const { id, guest: guestId } = useLocalSearchParams<{ id: string; guest: string }>();
  const { getEvent, guestsOf, profiles } = useStore();
  const event = getEvent(id);

  if (!event) {
    return (
      <Screen>
        <Display size={type.h2}>Event not found</Display>
      </Screen>
    );
  }

  const guest = guestsOf(event.id).find((g) => g.id === guestId);
  const profile = guest?.profileId ? profiles[guest.profileId] : undefined;
  const events = profile?.eventsAttended.length || 1;
  const answers = guest ? Object.keys(guest.answers).length : 0;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <Screen scroll={false} style={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <Display size={type.hero} style={{ textAlign: 'center' }}>
          You’re in<Display size={type.hero} italic>.</Display>
        </Display>
        <Spacer h={space.l} />
        <Body color={text.hint} style={{ textAlign: 'center', maxWidth: 320 }}>
          Welcome to the party. Hang onto your phone — you’ll get a text when matches are out.
        </Body>

        <Spacer h={space.xl} />
        <View style={styles.statsRow}>
          <Stat value={pad(events)} label="events" />
          <Stat value={pad(answers)} label="answers" />
          <Stat value={pad(0)} label="hot takes" />
        </View>

        <Spacer h={space.xl} />
        <Body color={text.hint} style={{ textAlign: 'center', maxWidth: 330 }}>
          <Body color={text.primary} weight="700">
            In the meantime
          </Body>
          , share your unique link with friends in this event to reveal your{' '}
          <Body color={text.primary} weight="700">
            compatibility score
          </Body>{' '}
          with anyone who clicks it.
        </Body>
        <Spacer h={space.l} />
        <PrimaryButton
          label="Share your link"
          onPress={() => router.replace(`/event/${event.id}/reveal?guest=${guestId ?? ''}`)}
        />
        <Spacer h={space.l} />
        {guestId ? (
          <Body
            color={text.whisper}
            size={14}
            onPress={() => router.push(`/profile/${guestId}` as never)}
            style={{ textDecorationLine: 'underline' }}
          >
            see your portable profile
          </Body>
        ) : null}
      </View>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Display size={type.h2}>{value}</Display>
      <MonoLabel size={11} color={text.hint}>
        {label}
      </MonoLabel>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    paddingVertical: space.l,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: border.default,
  },
});
