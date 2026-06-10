import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollingChips } from '../src/components/ScrollingChips';
import { Body, Display, MonoLabel, PrimaryButton, Row, Spacer } from '../src/components/ui';
import { premiumQuestions } from '../src/data/questions';
import { useStore } from '../src/store';
import {
  ACCENTS,
  border,
  fonts,
  ink,
  palette,
  radius,
  space,
  text,
  type,
} from '../src/theme';

// Two alternating rows of original premium statements for the bento preview.
const PREMIUM_ROWS: string[][] = (() => {
  const pool = premiumQuestions().map((q) => q.statement);
  return [pool.filter((_, i) => i % 2 === 0).slice(0, 6), pool.filter((_, i) => i % 2 === 1).slice(0, 6)];
})();

const PREMIUM_FEATURES: { head: string; body: string; emoji: string }[] = [
  {
    head: 'Drop a countdown for maximum suspense',
    body: 'In perfect sync for every guest — matches reveal after 60 seconds of rising anticipation.',
    emoji: '⏱️',
  },
  {
    head: 'Build anticipation with clues',
    body: 'Help guests mingle and narrow down, getting closer and closer to their match.',
    emoji: '🔎',
  },
  {
    head: 'Insights reveal why each match works',
    body: 'Let guests see under the hood — the traits and answers behind their match.',
    emoji: '📊',
  },
];

const PEACE_OF_MIND = ['Avoid age gaps', 'Add and remove people', 'Carry over unused seats'];

const ROTATING = [
  'house party',
  'cocktail hour',
  'family reunion',
  'team offsite',
  'game night',
  'costume ball',
  'dinner party',
];

export default function Landing() {
  const insets = useSafeAreaInsets();
  const { events } = useStore();
  const [wordIndex, setWordIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        setWordIndex((i) => (i + 1) % ROTATING.length);
        Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      });
    }, 2600);
    return () => clearInterval(interval);
  }, [fade]);

  return (
    <View style={styles.frame}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <Text style={[styles.wordmark, { marginTop: insets.top + 10 }]}>MATCHSTICK</Text>

        {/* Dark rounded canvas */}
        <View style={styles.canvas}>
          <Row style={{ justifyContent: 'center', gap: space.xl, marginTop: space.xl }}>
            <Pressable onPress={() => router.push('/events')} hitSlop={8}>
              <Body color={text.secondary}>Attend</Body>
            </Pressable>
            <Pressable onPress={() => router.push('/host/setup')} hitSlop={8}>
              <Body color={text.secondary}>Host</Body>
            </Pressable>
            <Pressable onPress={() => router.push('/about')} hitSlop={8}>
              <Body color={text.secondary}>FAQ</Body>
            </Pressable>
          </Row>

          <View style={{ paddingHorizontal: space.xl, marginTop: 56, alignItems: 'center' }}>
            <Display size={type.hero} style={{ textAlign: 'center' }}>
              Matching{'\n'}at your next
            </Display>
            <Animated.View style={{ opacity: fade }}>
              <Display size={type.hero} italic style={{ textAlign: 'center' }}>
                {ROTATING[wordIndex]}
              </Display>
            </Animated.View>

            <Spacer h={space.xxl} />
            <Body color={text.hint} style={{ textAlign: 'center', maxWidth: 300 }}>
              In any room, someone is on your wavelength. Matchstick helps you find them.
            </Body>
            <Spacer h={space.xxl} />
            <PrimaryButton
              label="Start for free"
              arrow
              onPress={() => router.push('/host/setup')}
            />
            <Spacer h={space.l} />
            <Pressable onPress={() => router.push('/event/demo')}>
              <Body color={text.hint} style={{ textDecorationLine: 'underline' }}>
                or, explore the demo event
              </Body>
            </Pressable>
          </View>

          {/* Polaroid strip */}
          <View style={styles.polaroidRow}>
            {ACCENTS.slice(0, 3).map((accent, i) => (
              <View
                key={accent}
                style={[
                  styles.polaroid,
                  { transform: [{ rotate: `${(i - 1) * 4}deg` }] },
                ]}
              >
                <View style={[styles.polaroidPhoto, { backgroundColor: palette[accent] }]}>
                  <Text style={styles.polaroidEmoji}>{['🔥', '🥂', '💌'][i]}</Text>
                </View>
                <MonoLabel size={9} color={ink.hint} style={{ alignSelf: 'center', marginTop: 8 }}>
                  {['strike one', 'cheers', 'sealed'][i]}
                </MonoLabel>
              </View>
            ))}
          </View>

          {/* 3 Steps to Great Matches */}
          <View style={{ paddingHorizontal: space.xl, marginTop: space.xxxl }}>
            <Display size={type.h2} style={{ textAlign: 'center', marginBottom: space.xl }}>
              3 steps to great matches
            </Display>
            {[
              ['01', 'Guests fill out your questionnaire', 'Share a link and QR code. They answer on their phones — no app store, no accounts.'],
              ['02', 'Run the algorithm to calculate matches', 'One tap pairs the whole room by shared values and personality.'],
              ['03', 'Release the match results', 'Matches reveal together, with a radar chart and the reasons behind each one.'],
            ].map(([num, title, caption]) => (
              <View key={num} style={styles.step}>
                <MonoLabel size={12} color={text.whisper}>
                  {num}
                </MonoLabel>
                <View style={{ flex: 1, marginLeft: space.l }}>
                  <Display size={type.h3}>{title}</Display>
                  <Body color={text.hint} size={15} style={{ marginTop: 4 }}>
                    {caption}
                  </Body>
                </View>
              </View>
            ))}
          </View>

          {/* Get more — the premium feature bento (all free here) */}
          <View style={{ paddingHorizontal: space.xl, marginTop: space.xxxl }}>
            <Display size={type.h2} style={{ textAlign: 'center' }}>
              Get more — <Display size={type.h2} italic>all of it free</Display>
            </Display>
            <Body color={text.hint} size={15} style={{ textAlign: 'center', marginTop: space.s }}>
              The features match.box charges for, included with every event.
            </Body>
            <Spacer h={space.l} />

            {/* Premium questions card with scrolling chips */}
            <View style={styles.bentoCard}>
              <Display size={type.h3}>
                Include <Display size={type.h3} italic>premium questions</Display>
              </Display>
              <Body color={text.hint} size={14} style={{ marginTop: 2, marginBottom: space.m }}>
                Design a more tailored questionnaire to spark conversation and make the best matches
                possible.
              </Body>
              <ScrollingChips rows={PREMIUM_ROWS} accent={palette.aqua} />
            </View>

            {/* Other premium feature cards */}
            {PREMIUM_FEATURES.map((f) => (
              <View key={f.head} style={styles.bentoCard}>
                <Row style={{ alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 26, marginRight: space.m }}>{f.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Display size={type.h3}>{f.head}</Display>
                    <Body color={text.hint} size={14} style={{ marginTop: 4 }}>
                      {f.body}
                    </Body>
                  </View>
                </Row>
              </View>
            ))}

            {/* Plus, peace of mind */}
            <Spacer h={space.l} />
            <MonoLabel size={11} color={text.hint} style={{ marginBottom: space.m }}>
              Plus, peace of mind that things run smoothly
            </MonoLabel>
            <View style={styles.featureCard}>
              {PEACE_OF_MIND.map((feature) => (
                <Row key={feature} style={{ marginBottom: space.m }}>
                  <Text style={{ color: palette.green, fontSize: 15, marginRight: space.m }}>✓</Text>
                  <Body color={text.secondary} size={15}>
                    {feature}
                  </Body>
                </Row>
              ))}
              <Row>
                <Text style={{ color: palette.green, fontSize: 15, marginRight: space.m }}>✓</Text>
                <Body color={text.secondary} size={15}>
                  Open source — MIT licensed, self-hostable
                </Body>
              </Row>
            </View>
          </View>

          {events.length > 0 && (
            <View style={{ paddingHorizontal: space.xl, marginTop: space.xxl }}>
              <MonoLabel style={{ marginBottom: space.m }}>Your events</MonoLabel>
              {events.map((event) => (
                <Pressable
                  key={event.id}
                  onPress={() => router.push(`/event/${event.id}`)}
                  style={({ pressed }) => [styles.eventRow, pressed && { opacity: 0.8 }]}
                >
                  <View
                    style={[styles.eventDot, { backgroundColor: palette[event.accent] }]}
                  />
                  <View style={{ flex: 1 }}>
                    <Body color={text.primary} weight="600">
                      {event.title}
                    </Body>
                    <Body color={text.whisper} size={13}>
                      /{event.slug}
                      {event.isDemo ? '  ·  demo' : ''}
                    </Body>
                  </View>
                  <Body color={text.hint}>→</Body>
                </Pressable>
              ))}
            </View>
          )}

          <Spacer h={space.xxxl} />
          <MonoLabel size={10} color={text.whisper} style={{ textAlign: 'center' }}>
            Free & open source · MIT
          </MonoLabel>
          <Spacer h={space.xl} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 22,
    letterSpacing: 3,
    color: ink.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  canvas: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    marginHorizontal: 6,
    paddingBottom: space.xl,
    minHeight: 700,
  },
  polaroidRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.l,
    marginTop: space.xxxl,
  },
  polaroid: {
    backgroundColor: palette.creamBright,
    padding: 8,
    paddingBottom: 6,
    borderRadius: 4,
    width: 104,
  },
  polaroidPhoto: {
    height: 96,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  polaroidEmoji: { fontSize: 34 },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: space.xl,
  },
  featureCard: {
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.card,
    padding: space.xl,
  },
  bentoCard: {
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.card,
    padding: space.l,
    marginBottom: space.m,
    overflow: 'hidden',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.input,
    padding: space.l,
    marginBottom: space.m,
    gap: space.m,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
