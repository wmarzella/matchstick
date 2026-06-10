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
import { Body, Display, MonoLabel, PrimaryButton, Row, Spacer } from '../src/components/ui';
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

          {/* How it works */}
          <View style={{ paddingHorizontal: space.xl, marginTop: space.xxxl }}>
            <MonoLabel style={{ textAlign: 'center', marginBottom: space.l }}>
              How it works
            </MonoLabel>
            {[
              ['01', 'Make your questionnaire', 'Pick themes or hand-pick statements. Guests answer on their phones.'],
              ['02', 'Everyone signs in', 'Your event gets a link and QR code. No app store, no accounts.'],
              ['03', 'Strike the match', 'The algorithm pairs your room. Matches reveal together, with receipts.'],
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

          {/* Everything included — free */}
          <View style={{ paddingHorizontal: space.xl, marginTop: space.xxl }}>
            <Display size={type.h2} style={{ textAlign: 'center' }}>
              Every feature. Free.
            </Display>
            <Body color={text.hint} size={15} style={{ textAlign: 'center', marginTop: space.s }}>
              Open source, self-hosted, no tiers, no per-guest fees.
            </Body>
            <Spacer h={space.l} />
            <View style={styles.featureCard}>
              {[
                'Unlimited guests and events',
                'Countdown match reveal',
                'Why-you-matched explanations',
                'Match quality scores',
                'Receipts: superlatives for the room',
                'Dedicated link and QR code',
                'Romantic, platonic & professional modes',
                'Age-constrained matching',
                'Custom questionnaires',
              ].map((feature) => (
                <Row key={feature} style={{ marginBottom: space.m }}>
                  <Text style={{ color: palette.green, fontSize: 15, marginRight: space.m }}>✓</Text>
                  <Body color={text.secondary} size={15}>
                    {feature}
                  </Body>
                </Row>
              ))}
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
