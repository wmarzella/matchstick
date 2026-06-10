import { router } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Body, Display, Screen, Spacer } from '../src/components/ui';
import { space, text, type } from '../src/theme';

const FAQ: [string, string][] = [
  [
    'What is Matchstick?',
    'A free, open-source party matchmaking app. You host an event, guests answer a short questionnaire on their phones, and an algorithm pairs the room — romantically, platonically, or professionally. Matches reveal together, with reasons.',
  ],
  [
    'Is it really all free?',
    'Yes. Every feature is enabled for every event: unlimited guests, custom questionnaires, match explanations, quality scores, receipts. There is no premium tier because there is nothing to sell — the code is MIT-licensed.',
  ],
  [
    'Where does my data live?',
    'On the device that runs the event. This build has no server: answers, phone numbers, and matches never leave the phone unless you wire up your own backend.',
  ],
  [
    'How does the matching work?',
    'Each answer is a 1–7 agreement rating. We score every eligible pair by answer closeness, pair the strongest couples first, and attach the odd guest out to their best pair as a trio. Romantic mode respects gender and interest; age-constrained mode keeps matches close in age.',
  ],
  [
    'Can I use it for a real event with many phones?',
    'The demo build is single-device (pass the phone around, or run it at the door). The data layer is one file — swap AsyncStorage for Supabase, Firebase, or your own API to go multi-device. The README walks through it.',
  ],
  [
    'Why does it look like this?',
    'The design language — warm cream, near-black green, serif display type, mono labels — is an open-source homage to the great IRL-matching products of the 2020s, rebuilt from scratch with freely licensed fonts (Instrument Serif, Hanken Grotesk, Space Mono).',
  ],
];

export default function About() {
  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={10}>
        <Body color={text.hint}>‹ Home</Body>
      </Pressable>
      <Spacer h={space.l} />
      <Display size={type.h1}>FAQ</Display>
      <Spacer h={space.xl} />
      {FAQ.map(([question, answer]) => (
        <React.Fragment key={question}>
          <Display size={type.h3}>{question}</Display>
          <Body color={text.hint} style={{ marginTop: space.s, marginBottom: space.xl }}>
            {answer}
          </Body>
        </React.Fragment>
      ))}
    </Screen>
  );
}
