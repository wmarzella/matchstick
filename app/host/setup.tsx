import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Body,
  Display,
  Field,
  MonoLabel,
  PrimaryButton,
  RadioCard,
  Row,
  Screen,
  SectionHeading,
  Spacer,
  WizardFooter,
} from '../../src/components/ui';
import { useStore } from '../../src/store';
import { ACCENTS, border, palette, space, text, type } from '../../src/theme';
import type { MatchMode } from '../../src/store/types';

const GUEST_STOPS = [12, 20, 30, 40, 50, 60, 80, 100, 150, 200, 500];

const MODES: { mode: MatchMode; title: string; caption: string }[] = [
  {
    mode: 'platonic',
    title: 'Platonic matching',
    caption: 'Anyone can match with anyone.',
  },
  {
    mode: 'romantic',
    title: 'Romantic matching',
    caption: 'The questionnaire will ask everyone their gender and who they want to meet.',
  },
  {
    mode: 'professional',
    title: 'Professional matching',
    caption: 'For career-oriented connections.',
  },
];

export default function Setup() {
  const { draft, setDraft } = useStore();

  const canContinue = draft.title.trim().length > 0 && draft.hostName.trim().length > 0;

  return (
    <Screen
      footer={
        <WizardFooter
          segments={3}
          activeSegment={0}
          onBack={() => router.back()}
          action={
            <PrimaryButton
              label="Next"
              disabled={!canContinue}
              onPress={() => router.push('/host/questions')}
            />
          }
        />
      }
    >
      <Display size={type.h1}>Customize your matching</Display>
      <Body color={text.hint} style={{ marginTop: space.s }}>
        Dial in your key choices.
      </Body>

      <Spacer h={space.xxl} />
      <SectionHeading>What’s the matching experience?</SectionHeading>
      {MODES.map(({ mode, title, caption }) => (
        <RadioCard
          key={mode}
          title={title}
          caption={caption}
          selected={draft.mode === mode}
          onPress={() => setDraft({ mode })}
        />
      ))}

      <Spacer h={space.xl} />
      <SectionHeading>Should we consider ages?</SectionHeading>
      <RadioCard
        title="Don’t consider age"
        caption="My guests are of a similar age, such that they would feel comfortable matching with anyone."
        selected={!draft.ageConstrained}
        onPress={() => setDraft({ ageConstrained: false })}
      />
      <RadioCard
        title="Use age-constrained matching"
        caption="The questionnaire will ask guests their age, and matches will be made between guests close in age."
        selected={draft.ageConstrained}
        onPress={() => setDraft({ ageConstrained: true })}
      />

      <Spacer h={space.xl} />
      <SectionHeading>Polish the details</SectionHeading>
      <Body color={text.hint} style={{ marginBottom: space.l }}>
        Customize how your matching questionnaire will appear to guests.
      </Body>
      <Field
        label="Event title"
        placeholder="Untitled Event"
        value={draft.title}
        onChangeText={(title) => setDraft({ title })}
        hint={
          draft.title.trim()
            ? `Guests will join at /${draft.title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`
            : undefined
        }
      />
      <Field
        label="Host name"
        placeholder="John Doe"
        value={draft.hostName}
        onChangeText={(hostName) => setDraft({ hostName })}
        hint={
          draft.hostName.trim()
            ? `Appears on your event page: “a Matchstick event hosted by ${draft.hostName.trim()}”`
            : 'Appears on your event page'
        }
      />
      <Field
        label="When will it happen?"
        placeholder="2026-07-01"
        value={draft.date}
        onChangeText={(date) => setDraft({ date })}
        autoCapitalize="none"
      />

      <Spacer h={space.xl} />
      <SectionHeading>Pick your color</SectionHeading>
      <Body color={text.hint} style={{ marginBottom: space.l }}>
        Your event page and questionnaire take on this accent.
      </Body>
      <Row style={{ gap: space.m, flexWrap: 'wrap' }}>
        {ACCENTS.map((accent) => (
          <Pressable
            key={accent}
            onPress={() => setDraft({ accent })}
            style={[
              styles.swatch,
              { backgroundColor: palette[accent] },
              draft.accent === accent && styles.swatchSelected,
            ]}
          />
        ))}
      </Row>

      <Spacer h={space.xl} />
      <SectionHeading>How many guests?</SectionHeading>
      <Row style={{ flexWrap: 'wrap', gap: space.s, marginTop: space.s }}>
        {GUEST_STOPS.map((stop) => (
          <Pressable
            key={stop}
            onPress={() => setDraft({ maxGuests: stop })}
            style={[
              styles.guestStop,
              draft.maxGuests === stop && {
                backgroundColor: palette.cream,
                borderColor: palette.cream,
              },
            ]}
          >
            <MonoLabel
              size={13}
              color={draft.maxGuests === stop ? 'rgba(13,21,17,0.9)' : text.hint}
            >
              {stop}
            </MonoLabel>
          </Pressable>
        ))}
      </Row>
      <Body color={text.whisper} size={14} style={{ marginTop: space.m }}>
        Set an initial maximum number of guests. You can always add more later — no caps, no
        tiers, free forever.
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: palette.cream,
  },
  guestStop: {
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
});
