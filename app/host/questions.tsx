import { router } from 'expo-router';
import React from 'react';
import {
  Body,
  Display,
  OutlinePill,
  PrimaryButton,
  Screen,
  SectionHeading,
  Spacer,
  WizardFooter,
  Wrap,
} from '../../src/components/ui';
import { THEMES } from '../../src/data/questions';
import { useStore } from '../../src/store';
import { space, text, type } from '../../src/theme';
import type { ThemeKey } from '../../src/data/questions';

export default function Questions() {
  const { draft, setDraft } = useStore();
  // The theme step shows content themes only; premium questions are added in
  // the "choose specific questions" builder (badged there), matching match.box.
  const themePills = THEMES.filter((t) => t.key !== 'premium');

  const toggle = (key: ThemeKey) => {
    const selected = draft.themes.includes(key);
    if (selected) {
      setDraft({ themes: draft.themes.filter((t) => t !== key) });
    } else if (draft.themes.length < 3) {
      setDraft({ themes: [...draft.themes, key], customQuestionIds: [] });
    }
  };

  const surprise = () => {
    const shuffled = [...themePills].sort(() => Math.random() - 0.5).slice(0, 3);
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
