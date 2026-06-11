import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Body,
  Display,
  Field,
  MonoLabel,
  PrimaryButton,
  Row,
  Screen,
  Spacer,
} from '../../../src/components/ui';
import { DEFAULT_POLES, QUESTIONS, Question } from '../../../src/data/questions';
import { useStore } from '../../../src/store';
import {
  border,
  fonts,
  palette,
  radius,
  space,
  text,
  textOnAccent,
  type,
} from '../../../src/theme';

const SCALE = [1, 2, 3, 4, 5, 6, 7];

type Page =
  | { kind: 'name' }
  | { kind: 'age' }
  | { kind: 'question'; question: Question };

/**
 * Participant questionnaire — a vertically paged stack (the real flow is a
 * scroll-snap container): name → age → one Likert statement per page, each a
 * row of 7 numbered cells with per-question pole labels.
 */
export default function Quiz() {
  const { id, guest: guestId } = useLocalSearchParams<{ id: string; guest: string }>();
  const { getEvent, guestsOf, saveAnswer, updateGuestIdentity, completeQuiz } = useStore();
  const insets = useSafeAreaInsets();

  const event = getEvent(id);
  const guest = guestsOf(event?.id ?? '').find((g) => g.id === guestId);

  const allQuestions = useMemo(
    () => (event ? QUESTIONS.filter((q) => event.questionIds.includes(q.id)) : []),
    [event],
  );
  const prefilledCount = guest?.prefilledIds?.length ?? 0;
  const todo = useMemo(
    () => allQuestions.filter((q) => guest?.answers[q.id] == null),
    // freeze the working set on mount; answering shouldn't drop pages
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event?.id, guest?.id],
  );

  const pages: Page[] = useMemo(
    () => [
      { kind: 'name' },
      { kind: 'age' },
      ...todo.map((question) => ({ kind: 'question' as const, question })),
    ],
    [todo],
  );

  const [index, setIndex] = useState(0);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [firstName, setFirstName] = useState(guest?.firstName ?? '');
  const [lastName, setLastName] = useState(guest?.lastName ?? '');
  const [age, setAge] = useState(guest?.age ? String(guest.age) : '');
  const [pageH, setPageH] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (!event || !guest) {
    return (
      <Screen>
        <Display size={type.h2}>Session not found</Display>
      </Screen>
    );
  }

  const accent = palette[event.accent];
  const onAccent = textOnAccent[event.accent];

  // Returning guests with nothing new: straight to done.
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
          We carried over {prefilledCount} answers from past events — nothing new to fill in.
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

  // Welcome-back intro for returning guests with new questions.
  if (prefilledCount > 0 && !introDismissed) {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Display size={type.h1} style={{ textAlign: 'center' }}>
          Welcome back,{'\n'}
          {guest.firstName || 'you'}
          <Display size={type.h1} italic>.</Display>
        </Display>
        <Spacer h={space.l} />
        <Body color={text.hint} style={{ textAlign: 'center', maxWidth: 320 }}>
          This event has{' '}
          <Body color={accent} weight="700">
            {todo.length} new
          </Body>{' '}
          {todo.length === 1 ? 'question' : 'questions'}. The rest carried over from your
          profile.
        </Body>
        <Spacer h={space.xxl} />
        <PrimaryButton label="Continue" arrow onPress={() => setIntroDismissed(true)} />
      </Screen>
    );
  }

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, next));
    setIndex(clamped);
    scrollRef.current?.scrollTo({ y: clamped * pageH, animated: true });
  };

  const finish = () => {
    completeQuiz(event.id, guest.id);
    router.replace(`/event/${event.id}/done?guest=${guest.id}`);
  };

  const answeredAll = todo.every((q) => guest.answers[q.id] != null);
  const questionNumber = (page: Page) =>
    page.kind === 'question' ? todo.indexOf(page.question) + 1 : 0;

  const onLayout = (e: LayoutChangeEvent) => setPageH(e.nativeEvent.layout.height);

  return (
    <Screen scroll={false}>
      {/* Fixed header: back + progress */}
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={() => (index === 0 ? router.back() : goTo(index - 1))} hitSlop={10}>
          <Body color={text.hint}>‹</Body>
        </Pressable>
        <MonoLabel size={11}>
          {index < 2
            ? index === 0
              ? 'Your name'
              : 'Your age'
            : `${String(questionNumber(pages[index])).padStart(2, '0')} / ${String(
                todo.length,
              ).padStart(2, '0')}`}
        </MonoLabel>
        <View style={{ width: 16 }} />
      </Row>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((index + 1) / pages.length) * 100}%`,
              backgroundColor: accent,
            },
          ]}
        />
      </View>
      {prefilledCount > 0 && (
        <Body color={text.whisper} size={13} style={{ marginTop: space.s }}>
          {prefilledCount} answers carried over from your profile.
        </Body>
      )}

      {/* Paged stack */}
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {pageH > 0 && (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            snapToInterval={pageH}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) =>
              setIndex(Math.round(e.nativeEvent.contentOffset.y / pageH))
            }
          >
            {pages.map((page, i) => (
              <View key={i} style={{ height: pageH, justifyContent: 'center' }}>
                {page.kind === 'name' && (
                  <View>
                    <Display size={36}>First things first. What’s your name?</Display>
                    <Spacer h={space.xl} />
                    <Row style={{ gap: space.m }}>
                      <Field
                        placeholder="First name"
                        value={firstName}
                        onChangeText={setFirstName}
                        style={{ flex: 1, marginBottom: 0 }}
                      />
                      <Field
                        placeholder="Last name"
                        value={lastName}
                        onChangeText={setLastName}
                        style={{ flex: 1, marginBottom: 0 }}
                      />
                    </Row>
                    <Spacer h={space.l} />
                    <PrimaryButton
                      label="Next"
                      disabled={!firstName.trim()}
                      onPress={() => {
                        updateGuestIdentity(event.id, guest.id, {
                          firstName: firstName.trim(),
                          lastName: lastName.trim(),
                        });
                        goTo(i + 1);
                      }}
                      style={{ alignSelf: 'flex-end', paddingHorizontal: 36 }}
                    />
                  </View>
                )}

                {page.kind === 'age' && (
                  <View>
                    <Display size={36}>How old are you?</Display>
                    <Spacer h={space.xl} />
                    <Field
                      placeholder="Age"
                      keyboardType="number-pad"
                      value={age}
                      onChangeText={setAge}
                      style={{ marginBottom: 0 }}
                    />
                    <Spacer h={space.l} />
                    <PrimaryButton
                      label="Next"
                      disabled={!age || Number(age) < 16}
                      onPress={() => {
                        updateGuestIdentity(event.id, guest.id, { age: Number(age) });
                        goTo(i + 1);
                      }}
                      style={{ alignSelf: 'flex-end', paddingHorizontal: 36 }}
                    />
                  </View>
                )}

                {page.kind === 'question' && (
                  <QuestionPage
                    question={page.question}
                    value={guest.answers[page.question.id]}
                    accent={accent}
                    onAccent={onAccent}
                    isLast={questionNumber(page) === todo.length}
                    answeredAll={answeredAll}
                    onChoose={(v) => {
                      saveAnswer(event.id, guest.id, page.question.id, v);
                      if (questionNumber(page) === todo.length) return; // stay for Submit
                      setTimeout(() => goTo(i + 1), 200);
                    }}
                    onFinish={finish}
                  />
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      <View style={{ height: Math.max(insets.bottom, space.l) }} />
    </Screen>
  );
}

function QuestionPage({
  question,
  value,
  accent,
  onAccent,
  isLast,
  answeredAll,
  onChoose,
  onFinish,
}: {
  question: Question;
  value: number | undefined;
  accent: string;
  onAccent: string;
  isLast: boolean;
  answeredAll: boolean;
  onChoose: (v: number) => void;
  onFinish: () => void;
}) {
  const poles = question.poles ?? DEFAULT_POLES;
  return (
    <View>
      <Display size={34}>{question.statement}</Display>
      <Spacer h={space.xxl} />
      <View style={styles.scaleRow}>
        {SCALE.map((v) => {
          const selected = value === v;
          return (
            <Pressable
              key={v}
              onPress={() => onChoose(v)}
              style={[
                styles.cell,
                {
                  borderColor: selected ? accent : border.default,
                  backgroundColor: selected ? accent : 'transparent',
                },
              ]}
            >
              <Text style={[styles.cellNum, { color: selected ? onAccent : text.primary }]}>
                {v}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Row style={{ justifyContent: 'space-between', marginTop: space.s }}>
        <MonoLabel size={10} color={text.hint}>
          {poles[0]}
        </MonoLabel>
        <MonoLabel size={10} color={text.hint}>
          {poles[1]}
        </MonoLabel>
      </Row>
      {isLast && (
        <>
          <Spacer h={space.xl} />
          <PrimaryButton label="Submit" arrow disabled={!answeredAll} onPress={onFinish} />
        </>
      )}
    </View>
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
  scaleRow: { flexDirection: 'row', gap: 7, justifyContent: 'space-between' },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellNum: { fontFamily: fonts.sansMedium, fontSize: 16 },
});
