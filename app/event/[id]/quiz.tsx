import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Body,
  Display,
  MonoLabel,
  PrimaryButton,
  Row,
  Screen,
  Spacer,
} from '../../../src/components/ui';
import { QUESTIONS } from '../../../src/data/questions';
import { useStore } from '../../../src/store';
import { border, palette, space, text, type } from '../../../src/theme';

const SCALE = [1, 2, 3, 4, 5, 6, 7];
/** Bubble diameters: large at the poles, small in the middle. */
const BUBBLE = [44, 36, 28, 24, 28, 36, 44];

export default function Quiz() {
  const { id, guest: guestId } = useLocalSearchParams<{ id: string; guest: string }>();
  const { getEvent, guestsOf, saveAnswer, completeQuiz } = useStore();
  const insets = useSafeAreaInsets();

  const event = getEvent(id);
  const guest = guestsOf(event?.id ?? '').find((g) => g.id === guestId);

  const questions = useMemo(
    () => (event ? QUESTIONS.filter((q) => event.questionIds.includes(q.id)) : []),
    [event],
  );

  const [index, setIndex] = useState(() => {
    if (!guest) return 0;
    const firstUnanswered = questions.findIndex((q) => guest.answers[q.id] == null);
    return firstUnanswered === -1 ? 0 : firstUnanswered;
  });

  if (!event || !guest) {
    return (
      <Screen>
        <Display size={type.h2}>Session not found</Display>
      </Screen>
    );
  }

  const accent = palette[event.accent];
  const question = questions[index];
  const value = question ? guest.answers[question.id] : undefined;
  const last = index === questions.length - 1;

  const choose = (v: number) => {
    saveAnswer(event.id, guest.id, question.id, v);
    if (!last) {
      setTimeout(() => setIndex((i) => i + 1), 220);
    }
  };

  const finish = () => {
    completeQuiz(event.id, guest.id);
    router.replace(`/event/${event.id}/done?guest=${guest.id}`);
  };

  const answeredAll = questions.every((q) => guest.answers[q.id] != null);

  return (
    <Screen scroll={false}>
      {/* Top bar */}
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Body color={text.hint}>‹</Body>
        </Pressable>
        <MonoLabel size={11}>
          {String(index + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
        </MonoLabel>
        <View style={{ width: 16 }} />
      </Row>

      {/* Progress hairline */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((index + 1) / questions.length) * 100}%`, backgroundColor: accent },
          ]}
        />
      </View>

      {/* Statement */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <MonoLabel size={11} color={text.whisper} style={{ marginBottom: space.l }}>
          Do you agree?
        </MonoLabel>
        <Display size={36}>{question.statement}</Display>
      </View>

      {/* Agreement scale */}
      <View style={{ paddingBottom: Math.max(insets.bottom, space.l) + space.xl }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          {SCALE.map((v, i) => {
            const selected = value === v;
            return (
              <Pressable
                key={v}
                onPress={() => choose(v)}
                hitSlop={8}
                style={[
                  styles.bubble,
                  {
                    width: BUBBLE[i],
                    height: BUBBLE[i],
                    borderRadius: BUBBLE[i] / 2,
                    borderColor: selected ? accent : border.active,
                    backgroundColor: selected ? accent : 'transparent',
                  },
                ]}
              />
            );
          })}
        </Row>
        <Row style={{ justifyContent: 'space-between', marginTop: space.m }}>
          <MonoLabel size={10} color={text.hint}>
            Disagree
          </MonoLabel>
          <MonoLabel size={10} color={text.hint}>
            Agree
          </MonoLabel>
        </Row>

        <Spacer h={space.xl} />
        {last && answeredAll ? (
          <PrimaryButton label="Finish" arrow onPress={finish} />
        ) : (
          <Row style={{ justifyContent: 'space-between' }}>
            <Pressable
              disabled={index === 0}
              onPress={() => setIndex((i) => i - 1)}
              hitSlop={10}
            >
              <Body color={index === 0 ? text.whisper : text.secondary}>Previous</Body>
            </Pressable>
            <Pressable
              disabled={value == null}
              onPress={() => (last ? finish() : setIndex((i) => i + 1))}
              hitSlop={10}
            >
              <Body color={value == null ? text.whisper : text.secondary}>
                {last ? 'Finish' : 'Skip ahead'}
              </Body>
            </Pressable>
          </Row>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(243,239,230,0.12)',
    borderRadius: 1,
    marginTop: space.l,
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
  },
  bubble: {
    borderWidth: 1.5,
  },
});
