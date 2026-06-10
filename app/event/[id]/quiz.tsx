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

  // The full event questionnaire…
  const allQuestions = useMemo(
    () => (event ? QUESTIONS.filter((q) => event.questionIds.includes(q.id)) : []),
    [event],
  );
  // …minus what the guest already answered (carried over from their profile).
  const prefilledCount = guest?.prefilledIds?.length ?? 0;
  const todo = useMemo(
    () => allQuestions.filter((q) => guest?.answers[q.id] == null),
    // only recompute the working set on mount; answering shouldn't drop items
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event?.id, guest?.id],
  );

  const [index, setIndex] = useState(0);

  if (!event || !guest) {
    return (
      <Screen>
        <Display size={type.h2}>Session not found</Display>
      </Screen>
    );
  }

  // Nothing new to ask — their profile already covers this questionnaire.
  if (todo.length === 0) {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <MonoLabel size={11}>Welcome back</MonoLabel>
        <Spacer h={space.m} />
        <Display size={type.h1} style={{ textAlign: 'center' }}>
          Your profile already{'\n'}has the answers<Display size={type.h1} italic>.</Display>
        </Display>
        <Spacer h={space.l} />
        <Body color={text.hint} style={{ textAlign: 'center', maxWidth: 300 }}>
          We carried over {prefilledCount} answers from past events, so there’s nothing new to
          fill in. You’re ready to be matched.
        </Body>
        <Spacer h={space.xxl} />
        <PrimaryButton
          label="I’m in"
          arrow
          onPress={() => {
            completeQuiz(event.id, guest.id);
            router.replace(`/event/${event.id}/done?guest=${guest.id}`);
          }}
        />
      </Screen>
    );
  }

  const question = todo[index];
  const value = guest.answers[question.id];
  const last = index === todo.length - 1;
  const answeredCount = todo.filter((q) => guest.answers[q.id] != null).length;

  const choose = (v: number) => {
    saveAnswer(event.id, guest.id, question.id, v);
    if (!last) setTimeout(() => setIndex((i) => i + 1), 200);
  };
  const finish = () => {
    completeQuiz(event.id, guest.id);
    router.replace(`/event/${event.id}/done?guest=${guest.id}`);
  };

  return (
    <Screen scroll={false}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable
          onPress={() => (index === 0 ? router.back() : setIndex((i) => i - 1))}
          hitSlop={10}
        >
          <Body color={text.hint}>‹</Body>
        </Pressable>
        <MonoLabel size={11}>
          {String(index + 1).padStart(2, '0')} / {String(todo.length).padStart(2, '0')}
        </MonoLabel>
        <View style={{ width: 16 }} />
      </Row>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((index + 1) / todo.length) * 100}%`, backgroundColor: palette[event.accent] },
          ]}
        />
      </View>

      {prefilledCount > 0 && (
        <Body color={text.whisper} size={13} style={{ marginTop: space.s }}>
          {prefilledCount} answers carried over from your profile.
        </Body>
      )}

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <MonoLabel size={11} color={text.whisper} style={{ marginBottom: space.l }}>
          Do you agree?
        </MonoLabel>
        <Display size={36}>{question.statement}</Display>
      </View>

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
                    borderColor: selected ? palette[event.accent] : border.active,
                    backgroundColor: selected ? palette[event.accent] : 'transparent',
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
        {last && answeredCount === todo.length ? (
          <PrimaryButton label="Finish" arrow onPress={finish} />
        ) : (
          <Row style={{ justifyContent: 'space-between' }}>
            <Pressable disabled={index === 0} onPress={() => setIndex((i) => i - 1)} hitSlop={10}>
              <Body color={index === 0 ? text.whisper : text.secondary}>Previous</Body>
            </Pressable>
            <Pressable
              disabled={value == null}
              onPress={() => (last ? finish() : setIndex((i) => i + 1))}
              hitSlop={10}
            >
              <Body color={value == null ? text.whisper : text.secondary}>
                {last ? 'Finish' : 'Next'}
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
    backgroundColor: 'rgba(216,207,197,0.12)',
    borderRadius: 1,
    marginTop: space.l,
  },
  progressFill: { height: 2, borderRadius: 1 },
  bubble: { borderWidth: 1.5 },
});
