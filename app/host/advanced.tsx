import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Body,
  Display,
  MonoLabel,
  PrimaryButton,
  Screen,
  Spacer,
  Tray,
  WizardFooter,
} from '../../src/components/ui';
import { QUESTIONS, THEMES, surpriseSet } from '../../src/data/questions';
import { useStore } from '../../src/store';
import { border, fonts, palette, radius, space, text, type } from '../../src/theme';
import type { ThemeKey } from '../../src/data/questions';

const TARGET_MIN = 5;
const TARGET_MAX = 30;

export default function Advanced() {
  const { draft, setDraft } = useStore();
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('principles');

  const picked = draft.customQuestionIds;
  const available = QUESTIONS.filter(
    (q) => q.theme === activeTheme && !picked.includes(q.id),
  );

  const add = (id: string) => {
    if (picked.length >= TARGET_MAX) return;
    setDraft({ customQuestionIds: [...picked, id], themes: [] });
  };
  const remove = (id: string) =>
    setDraft({ customQuestionIds: picked.filter((q) => q !== id) });

  const surprise = () =>
    setDraft({ customQuestionIds: surpriseSet().map((q) => q.id), themes: [] });

  const canContinue = picked.length >= TARGET_MIN;

  return (
    <Screen
      footer={
        <WizardFooter
          segments={3}
          activeSegment={1}
          onBack={() => router.back()}
          backLabel="Back to Themes"
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
      <Display size={type.h1} style={{ textAlign: 'center' }}>
        Questions
      </Display>
      <Body color={text.hint} style={{ textAlign: 'center', marginTop: space.s }}>
        Select {TARGET_MIN}–{TARGET_MAX} questions.
      </Body>

      <Spacer h={space.xl} />

      {/* Your event tray */}
      <Tray title="Your event">
        {picked.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: space.xl }}>
            <Display size={type.h3} style={{ textAlign: 'center' }}>
              Tap questions <Display size={type.h3} color={text.hint}>to start building your questionnaire.</Display>
            </Display>
            <Spacer h={space.l} />
            <Body color={text.hint}>— or —</Body>
            <Spacer h={space.l} />
            <Pressable onPress={surprise} style={styles.surpriseBtn}>
              <MonoLabel size={12} color={text.secondary}>
                Surprise me
              </MonoLabel>
            </Pressable>
          </View>
        ) : (
          <>
            <MonoLabel size={10} color={text.whisper} style={{ marginBottom: space.m }}>
              {picked.length} selected · tap to remove
            </MonoLabel>
            {picked.map((id) => {
              const q = QUESTIONS.find((question) => question.id === id);
              if (!q) return null;
              return (
                <Pressable key={id} onPress={() => remove(id)} style={styles.pickedCard}>
                  <Body color={text.primary} size={15} style={{ flex: 1 }}>
                    {q.statement}
                  </Body>
                  <Text style={{ color: text.hint, fontSize: 16, marginLeft: space.m }}>×</Text>
                </Pressable>
              );
            })}
          </>
        )}
      </Tray>

      <Spacer h={space.xl} />

      {/* Available questions tray */}
      <Tray title="Available questions">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space.s, paddingBottom: space.m }}
        >
          {THEMES.map((theme) => (
            <Pressable
              key={theme.key}
              onPress={() => setActiveTheme(theme.key)}
              style={[
                styles.catPill,
                activeTheme === theme.key && {
                  borderColor: palette.cream,
                  backgroundColor: 'rgba(243,239,230,0.1)',
                },
              ]}
            >
              <MonoLabel
                size={11}
                color={activeTheme === theme.key ? text.primary : text.hint}
              >
                {theme.label}
              </MonoLabel>
            </Pressable>
          ))}
        </ScrollView>

        {available.length === 0 ? (
          <Body color={text.whisper} style={{ paddingVertical: space.l, textAlign: 'center' }}>
            All questions from this theme are in your event.
          </Body>
        ) : (
          available.map((q) => (
            <Pressable key={q.id} onPress={() => add(q.id)} style={styles.availableCard}>
              <Body color={text.secondary} size={15} style={{ flex: 1 }}>
                {q.statement}
              </Body>
              <Text style={{ color: text.hint, fontSize: 18, marginLeft: space.m }}>+</Text>
            </Pressable>
          ))
        )}
      </Tray>
    </Screen>
  );
}

const styles = StyleSheet.create({
  surpriseBtn: {
    borderWidth: 1,
    borderColor: border.active,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  pickedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: border.active,
    borderRadius: radius.input,
    padding: space.l,
    marginBottom: space.s,
    backgroundColor: 'rgba(243,239,230,0.04)',
  },
  availableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.input,
    padding: space.l,
    marginBottom: space.s,
  },
  catPill: {
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
