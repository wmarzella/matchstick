import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import {
  Body,
  Display,
  MonoLabel,
  PrimaryButton,
  Row,
  Screen,
  SectionHeading,
  Spacer,
  WizardFooter,
} from '../../src/components/ui';
import { THEMES } from '../../src/data/questions';
import { useStore } from '../../src/store';
import { border, palette, radius, space, text, type } from '../../src/theme';

export default function Review() {
  const { draft, createEventFromDraft, resetDraft } = useStore();

  const create = () => {
    const event = createEventFromDraft();
    resetDraft();
    router.replace(`/event/${event.id}`);
  };

  const questionCount =
    draft.customQuestionIds.length ||
    draft.themes.length * 8 ||
    24;

  return (
    <Screen
      footer={
        <WizardFooter
          segments={3}
          activeSegment={2}
          onBack={() => router.back()}
          action={<PrimaryButton label="Create event" onPress={create} />}
        />
      }
    >
      <Display size={type.h1}>Activate questionnaire</Display>
      <Body color={text.hint} style={{ marginTop: space.s }}>
        Get your link, monitor signups, and strike matches when everyone’s in.
      </Body>

      <Spacer h={space.xxl} />

      <View
        style={{
          borderWidth: 1,
          borderColor: border.default,
          borderRadius: radius.card,
          padding: space.xl,
        }}
      >
        <Row style={{ justifyContent: 'space-between', marginBottom: space.l }}>
          <MonoLabel size={11}>Event</MonoLabel>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: palette[draft.accent],
            }}
          />
        </Row>
        <Display size={type.h2}>{draft.title || 'Untitled Event'}</Display>
        <Body color={text.hint} style={{ marginTop: 4 }}>
          a Matchstick event hosted by {draft.hostName || 'you'}
          {draft.date ? ` · ${draft.date}` : ''}
        </Body>

        <Spacer h={space.l} />
        <Row style={{ flexWrap: 'wrap', gap: space.s }}>
          <Chip label={`${draft.mode} matching`} />
          <Chip label={draft.ageConstrained ? 'age-constrained' : 'all ages welcome'} />
          <Chip label={`up to ${draft.maxGuests} guests`} />
          <Chip label={`~${questionCount} questions`} />
          {draft.themes.map((key) => {
            const theme = THEMES.find((t) => t.key === key);
            return theme ? <Chip key={key} label={`${theme.emoji} ${theme.label}`} /> : null;
          })}
        </Row>
      </View>

      <Spacer h={space.xxl} />
      <SectionHeading>What’s next?</SectionHeading>
      {[
        'You get an event page where you can monitor signups and run the algorithm.',
        'Your matching link activates right away — share it or show the QR code.',
        'Everything lives on this device. No fees, no accounts, no email required.',
      ].map((item, i) => (
        <Row key={i} style={{ alignItems: 'flex-start', marginBottom: space.m }}>
          <MonoLabel size={12} color={text.whisper} style={{ marginTop: 3 }}>
            {i + 1}.
          </MonoLabel>
          <Body color={text.secondary} style={{ flex: 1, marginLeft: space.m }}>
            {item}
          </Body>
        </Row>
      ))}
    </Screen>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: border.default,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 12,
      }}
    >
      <Body color={text.hint} size={13}>
        {label}
      </Body>
    </View>
  );
}
