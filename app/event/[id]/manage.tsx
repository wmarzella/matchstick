import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Body,
  Display,
  MonoLabel,
  Row,
  Screen,
  Spacer,
} from '../../../src/components/ui';
import { useStore } from '../../../src/store';
import { border, palette, radius, space, text, type } from '../../../src/theme';

/**
 * Event settings — mirrors match.box's "Manage event" page feature catalog.
 * Everything here is free in Matchstick; the original gates several behind
 * paid tiers (kept as labels for fidelity, all unlocked).
 */
export default function Manage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEvent, guestsOf, assignGroups } = useStore();
  const event = getEvent(id);

  if (!event) {
    return (
      <Screen>
        <Display size={type.h2}>Event not found</Display>
      </Screen>
    );
  }
  const guests = guestsOf(event.id);

  return (
    <Screen>
      <Pressable onPress={() => router.replace(`/event/${event.id}`)} hitSlop={10}>
        <Body color={text.hint}>‹ {event.title}</Body>
      </Pressable>
      <Spacer h={space.l} />
      <Display size={type.h1}>
        Manage{' '}
        <Display size={type.h1} color={text.hint}>
          event
        </Display>
      </Display>
      <Spacer h={space.xl} />

      <SettingRow label="Listing" value="Unlisted" action="Promote" />
      <SettingRow label="Event title" value={event.title} action="Edit" />
      <SettingRow label="Host" value={event.hostName} action="Edit" />
      <SettingRow label="Custom link" value={`/${event.slug}`} action="Change" />
      <SettingRow
        label="Seats"
        value={`${guests.length} / ${event.maxGuests}`}
        action="Add seats"
      />
      <SettingRow label="Admin collaborators" value="Just you" action="Invite" />
      <SettingRow
        label="Questions"
        value={`${event.questionIds.length} selected`}
        action="Change"
        onPress={() => router.push('/host/questions')}
      />
      {/* Groups — partition the room into separate match pools */}
      <Row style={styles.row}>
        <View style={{ flex: 1 }}>
          <Body color={text.primary} weight="600">
            Groups
          </Body>
          <Body color={text.hint} size={14}>
            {(event.groupCount ?? 1) === 1
              ? 'One match group'
              : `${event.groupCount} groups — matching stays within each`}
          </Body>
        </View>
        <Row style={{ gap: space.s }}>
          {[1, 2, 3].map((n) => (
            <Pressable
              key={n}
              onPress={() => assignGroups(event.id, n)}
              style={[
                styles.groupChip,
                (event.groupCount ?? 1) === n && {
                  backgroundColor: palette[event.accent],
                  borderColor: palette[event.accent],
                },
              ]}
            >
              <MonoLabel
                size={11}
                color={(event.groupCount ?? 1) === n ? '#000' : text.secondary}
              >
                {n}
              </MonoLabel>
            </Pressable>
          ))}
        </Row>
      </Row>
      <SettingRow
        label="Age constraints"
        value={event.ageConstrained ? 'On' : 'Off'}
        action="Change"
      />
      <SettingRow label="Matching" value={`${event.mode} matching`} action="Change" />
      <SettingRow label="Post-event feedback" value="Not sent" action="Send" />

      <Spacer h={space.xl} />
      <View style={styles.freeNote}>
        <MonoLabel size={10} color={palette.statusGreen}>
          All features free
        </MonoLabel>
        <Body color={text.hint} size={14} style={{ marginTop: 4 }}>
          The original gates promotion, collaborators, groups and premium questions behind paid
          tiers. Matchstick unlocks everything — it’s open source.
        </Body>
      </View>
      <Spacer h={space.xxl} />
    </Screen>
  );
}

function SettingRow({
  label,
  value,
  action,
  onPress,
}: {
  label: string;
  value: string;
  action: string;
  onPress?: () => void;
}) {
  return (
    <Row style={styles.row}>
      <View style={{ flex: 1 }}>
        <Body color={text.primary} weight="600">
          {label}
        </Body>
        <Body color={text.hint} size={14}>
          {value}
        </Body>
      </View>
      <Pressable onPress={onPress} style={styles.actionBtn} hitSlop={6}>
        <MonoLabel size={10} color={text.secondary}>
          {action}
        </MonoLabel>
      </Pressable>
    </Row>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216,207,197,0.08)',
    paddingVertical: space.l,
    gap: space.m,
  },
  actionBtn: {
    borderWidth: 1.5,
    borderColor: border.active,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  freeNote: {
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.card,
    padding: space.l,
  },
  groupChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: border.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
