import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Body,
  Display,
  Field,
  MonoLabel,
  PrimaryButton,
  RadioCard,
  Screen,
  SectionHeading,
  Spacer,
} from '../../../src/components/ui';
import { useStore } from '../../../src/store';
import { palette, space, text, type } from '../../../src/theme';
import type { Gender } from '../../../src/store/types';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'nonbinary', label: 'Non-binary' },
];

/**
 * Guest sign-in: phone-first (the questionnaire collects name/age, matching the
 * real flow). Romantic events also ask gender + interest here.
 */
export default function Join() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEvent, joinEvent, profileByPhone } = useStore();
  const event = getEvent(id);

  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [interestedIn, setInterestedIn] = useState<Gender[]>([]);
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'form' | 'verify'>('form');

  // Returning guest? Their saved profile carries everything.
  const returning = phone.trim().length >= 6 ? profileByPhone(phone) : undefined;

  if (!event) {
    return (
      <Screen>
        <Display size={type.h2}>Event not found</Display>
      </Screen>
    );
  }

  const accent = palette[event.accent];
  const needsRomance = event.mode === 'romantic';

  const formReady =
    phone.trim().length >= 6 &&
    (!needsRomance || returning || (gender && interestedIn.length > 0));

  const toggleInterest = (value: Gender) =>
    setInterestedIn((list) =>
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );

  const begin = () => {
    const guest = joinEvent(event.id, {
      firstName: returning?.firstName ?? '',
      lastName: returning?.lastName ?? '',
      phone: phone.trim(),
      age: returning?.age,
      gender: gender ?? returning?.gender,
      interestedIn: needsRomance ? (interestedIn.length ? interestedIn : returning?.interestedIn) : undefined,
    });
    router.replace(`/event/${event.id}/rules?guest=${guest.id}`);
  };

  return (
    <Screen>
      <MonoLabel size={11} color={text.hint}>
        {event.title}
      </MonoLabel>
      <Spacer h={space.s} />
      <Display size={type.h1}>
        What’s your number<Display size={type.h1} color={accent}>?</Display>
      </Display>
      <Body color={text.hint} style={{ marginTop: space.s }}>
        We’ll send you a code to make sure it’s you. a Matchstick event hosted by{' '}
        {event.hostName}.
      </Body>

      <Spacer h={space.xxl} />

      {stage === 'form' ? (
        <>
          <Field
            label="Phone number"
            placeholder="+61 400 000 000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            hint="Used as your identity — your answers follow it between events."
          />
          {returning && (
            <View style={{ marginTop: -space.s, marginBottom: space.l }}>
              <Body color={accent} size={14} weight="600">
                Welcome back, {returning.firstName}.
              </Body>
              <Body color={text.hint} size={14}>
                {Object.keys(returning.answers).length} answers on file — you’ll only see
                what’s new.
              </Body>
            </View>
          )}

          {needsRomance && !returning && (
            <>
              <Spacer h={space.l} />
              <SectionHeading>I am…</SectionHeading>
              {GENDERS.map(({ value, label }) => (
                <RadioCard
                  key={value}
                  title={label}
                  selected={gender === value}
                  onPress={() => setGender(value)}
                />
              ))}
              <Spacer h={space.l} />
              <SectionHeading>…and I’d like to meet</SectionHeading>
              <Body color={text.hint} style={{ marginBottom: space.m }}>
                Choose all that apply.
              </Body>
              {GENDERS.map(({ value, label }) => (
                <RadioCard
                  key={value}
                  title={`${label}s`}
                  selected={interestedIn.includes(value)}
                  onPress={() => toggleInterest(value)}
                />
              ))}
            </>
          )}

          <Spacer h={space.l} />
          <PrimaryButton label="Continue" disabled={!formReady} onPress={() => setStage('verify')} />
          <Spacer h={space.l} />
          <Body color={text.whisper} size={14} style={{ textAlign: 'center' }}>
            or,{' '}
            <Body
              color={text.hint}
              size={14}
              style={{ textDecorationLine: 'underline' }}
              onPress={() => setStage('verify')}
            >
              continue with WhatsApp
            </Body>
          </Body>
        </>
      ) : (
        <>
          <SectionHeading>Verify your number</SectionHeading>
          <Body color={text.hint} style={{ marginBottom: space.l }}>
            Enter the code we sent to {phone}.{' '}
            <Body color={text.whisper}>
              (Demo build: no SMS is actually sent — any 4 digits work. Wire Supabase phone
              auth for the real thing; see the README.)
            </Body>
          </Body>
          <Field
            label="Verification code"
            placeholder="0000"
            keyboardType="number-pad"
            maxLength={4}
            value={code}
            onChangeText={setCode}
          />
          <PrimaryButton
            label="Continue"
            arrow
            disabled={code.trim().length !== 4}
            onPress={begin}
          />
        </>
      )}
    </Screen>
  );
}
