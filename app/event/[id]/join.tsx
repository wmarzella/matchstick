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
  Row,
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

export default function Join() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEvent, joinEvent, profileByPhone } = useStore();
  const event = getEvent(id);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [interestedIn, setInterestedIn] = useState<Gender[]>([]);
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'form' | 'verify'>('form');

  // Returning guest? Their saved profile lets us skip the form entirely.
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
  const needsAge = event.ageConstrained;

  // A returning guest only needs their phone; everything else is on file.
  const formReady = returning
    ? phone.trim().length >= 6
    : firstName.trim() &&
      lastName.trim() &&
      phone.trim().length >= 6 &&
      (!needsAge || Number(age) >= 16) &&
      (!needsRomance || (gender && interestedIn.length > 0));

  const toggleInterest = (value: Gender) =>
    setInterestedIn((list) =>
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );

  const begin = () => {
    const guest = joinEvent(event.id, {
      firstName: (firstName.trim() || returning?.firstName) ?? '',
      lastName: (lastName.trim() || returning?.lastName) ?? '',
      phone: phone.trim(),
      age: needsAge ? Number(age) || returning?.age : returning?.age,
      gender: gender ?? returning?.gender,
      interestedIn: needsRomance ? interestedIn : returning?.interestedIn,
    });
    router.replace(`/event/${event.id}/quiz?guest=${guest.id}`);
  };

  return (
    <Screen>
      <MonoLabel size={11} color={text.hint}>
        {event.title}
      </MonoLabel>
      <Spacer h={space.s} />
      <Display size={type.h1}>
        Find your match<Display size={type.h1} color={accent}>.</Display>
      </Display>
      <Body color={text.hint} style={{ marginTop: space.s }}>
        a Matchstick event hosted by {event.hostName}. Answer honestly — the algorithm does the
        rest.
      </Body>

      <Spacer h={space.xxl} />

      {stage === 'form' ? (
        <>
          <SectionHeading>Who are you?</SectionHeading>
          <Field
            label="Phone number"
            placeholder="+61 400 000 000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            hint="Shared only with your match, never with anyone else."
          />
          {returning && (
            <View style={{ marginTop: -space.s, marginBottom: space.l }}>
              <Body color={palette[event.accent]} size={14} weight="600">
                Welcome back, {returning.firstName}.
              </Body>
              <Body color={text.hint} size={14}>
                We’ll carry over the {Object.keys(returning.answers).length} answers on your
                profile — you’ll only see questions you haven’t met yet.
              </Body>
            </View>
          )}
          {!returning && (
            <Row style={{ gap: space.m }}>
              <Field
                label="First name"
                placeholder="Sam"
                value={firstName}
                onChangeText={setFirstName}
                style={{ flex: 1 }}
              />
              <Field
                label="Last name"
                placeholder="Rivera"
                value={lastName}
                onChangeText={setLastName}
                style={{ flex: 1 }}
              />
            </Row>
          )}
          {needsAge && !returning && (
            <Field
              label="Age"
              placeholder="29"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />
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
          <PrimaryButton
            label="Continue"
            disabled={!formReady}
            onPress={() => setStage('verify')}
          />
        </>
      ) : (
        <>
          <SectionHeading>Check your phone</SectionHeading>
          <Body color={text.hint} style={{ marginBottom: space.l }}>
            We texted a code to {phone}.{' '}
            <Body color={text.whisper}>
              (Demo build: no SMS is actually sent — any 4 digits work. Wire up an SMS provider
              in production; see the README.)
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
            label="Start the questionnaire"
            arrow
            disabled={code.trim().length !== 4}
            onPress={begin}
          />
        </>
      )}
    </Screen>
  );
}
