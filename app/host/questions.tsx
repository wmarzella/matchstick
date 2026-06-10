import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { ScrollingChips } from '../../src/components/ScrollingChips';
import {
  Body,
  Display,
  OutlinePill,
  PrimaryButton,
  Row,
  Screen,
  SectionHeading,
  Spacer,
  WizardFooter,
  Wrap,
} from '../../src/components/ui';
import { premiumQuestions, THEMES } from '../../src/data/questions';
import { useStore } from '../../src/store';
import { border, palette, radius, space, text, textOnAccent, type } from '../../src/theme';
import type { ThemeKey } from '../../src/data/questions';

const PREMIUM_PREVIEW: string[][] = (() => {
  const pool = premiumQuestions().map((q) => q.statement);
  const rows: string[][] = [[], [], [], []];
  pool.forEach((s, i) => rows[i % 4].push(s));
  return rows.map((r) => (r.length ? r : ['I’m special']));
})();

export default function Questions() {
  const { draft, setDraft } = useStore();
  const themePills = THEMES.filter((t) => t.key !== 'premium');
  const premiumOn = draft.themes.includes('premium');

  const toggle = (key: ThemeKey) => {
    const selected = draft.themes.includes(key);
    if (selected) {
      setDraft({ themes: draft.themes.filter((t) => t !== key) });
    } else if (draft.themes.length < 3) {
      setDraft({ themes: [...draft.themes, key], customQuestionIds: [] });
    }
  };

  const togglePremium = () =>
    setDraft({
      themes: premiumOn
        ? draft.themes.filter((t) => t !== 'premium')
        : ([...draft.themes, 'premium'] as ThemeKey[]).slice(0, 3),
      customQuestionIds: [],
    });

  const surprise = () => {
    // Three random themes
    const shuffled = [...THEMES].sort(() => Math.random() - 0.5).slice(0, 3);
    setDraft({ themes: shuffled.map((t) => t.key), customQuestionIds: [] });
  };

  const canContinue = draft.themes.length >= 1 || draft.customQuestionIds.length >= 5;

  return (
    <Screen
      footer={
        <WizardFooter
          segments={3}
          activeSegment={1}
          onBack={() => router.back()}
          action={
            <PrimaryButton
              label="Next"
              disabled={!canContinue}
              onPress={() => router.push('/host/review')}
            />
          }
        />
      }
    >
      <Display size={type.h1}>Questions</Display>

      <Spacer h={space.xxl} />
      <SectionHeading>Choose the theme of your questionnaire</SectionHeading>
      <Body color={text.hint} style={{ marginBottom: space.l }}>
        Choose 1–3.
      </Body>

      <Wrap>
        {themePills.map((theme) => (
          <OutlinePill
            key={theme.key}
            emoji={theme.emoji}
            label={theme.label}
            selected={draft.themes.includes(theme.key)}
            onPress={() => toggle(theme.key)}
          />
        ))}
        <OutlinePill emoji="🎲" label="Surprise Me" onPress={surprise} />
      </Wrap>

      <Spacer h={space.xl} />

      {/* Premium questions panel — the scrolling-chips preview. */}
      <View
        style={{
          borderWidth: 1,
          borderColor: premiumOn ? palette[draft.accent] : border.default,
          borderRadius: radius.card,
          padding: space.l,
          overflow: 'hidden',
        }}
      >
        <Row>
          <View style={{ flex: 1 }}>
            <Display size={type.h3}>
              Include <Display size={type.h3} italic>premium questions</Display>
            </Display>
            <Body color={text.hint} size={14} style={{ marginTop: 2 }}>
              Sharper, more revealing prompts — they spark conversation and make the best matches.
            </Body>
          </View>
        </Row>
        <Spacer h={space.m} />
        <ScrollingChips rows={PREMIUM_PREVIEW} accent={palette[draft.accent]} />
        <Spacer h={space.m} />
        <Pressable
          onPress={togglePremium}
          style={{
            alignSelf: 'flex-start',
            borderRadius: radius.pill,
            paddingVertical: 10,
            paddingHorizontal: 18,
            backgroundColor: premiumOn ? palette[draft.accent] : 'transparent',
            borderWidth: 1.5,
            borderColor: premiumOn ? palette[draft.accent] : border.active,
          }}
        >
          <Body
            weight="600"
            size={14}
            color={premiumOn ? textOnAccent[draft.accent] : text.secondary}
          >
            {premiumOn ? '✓ Premium included' : 'Add premium questions'}
          </Body>
        </Pressable>
      </View>

      <Spacer h={space.xxl} />
      <Body color={text.hint} style={{ textAlign: 'center' }}>
        or,{' '}
        <Body
          color={text.secondary}
          style={{ textDecorationLine: 'underline' }}
          onPress={() => router.push('/host/advanced')}
        >
          choose specific questions
        </Body>
      </Body>
      {draft.customQuestionIds.length > 0 && (
        <Body color={text.hint} size={14} style={{ textAlign: 'center', marginTop: space.s }}>
          {draft.customQuestionIds.length} hand-picked questions selected
        </Body>
      )}
    </Screen>
  );
}
