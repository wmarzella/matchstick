import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Display, MonoLabel, Row, Spacer } from '../../../src/components/ui';
import { useStore } from '../../../src/store';
import { border, fonts, palette, radius, space, text, textOnAccent, type } from '../../../src/theme';

/**
 * In-app match thread — the open-source stand-in for match.box's phone-relay
 * messaging ("Send {name} a message" with the notification badge). Messages
 * live in the store snapshot, so they sync across devices on Supabase.
 */
export default function Chat() {
  const { id, pair, guest: guestId } = useLocalSearchParams<{
    id: string;
    pair: string;
    guest: string;
  }>();
  const { getEvent, guestsOf, messagesFor, sendMessage } = useStore();
  const insets = useSafeAreaInsets();
  const [draft, setDraftText] = useState('');

  const event = getEvent(id);
  if (!event || !pair) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + space.xl }]}>
        <Display size={type.h2}>Thread not found</Display>
      </View>
    );
  }

  const accent = palette[event.accent];
  const guests = guestsOf(event.id);
  const otherId = pair.split('+').find((gid) => gid !== guestId);
  const other = guests.find((g) => g.id === otherId);
  const thread = messagesFor(event.id, pair);

  const send = () => {
    if (!guestId) return;
    sendMessage(event.id, pair, guestId, draft);
    setDraftText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + space.m }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Body color={text.hint}>‹</Body>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Display size={type.h3}>
            {other ? `${other.firstName} ${other.lastName ? other.lastName[0] + '.' : ''}` : 'Your match'}
          </Display>
          <MonoLabel size={9} color={text.whisper}>
            {event.sharePhones && other?.phone ? other.phone : 'In-app thread · numbers stay private'}
          </MonoLabel>
        </View>
        <View style={{ width: 16 }} />
      </View>

      {/* Thread */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: space.xl, gap: space.m }}
        showsVerticalScrollIndicator={false}
      >
        {thread.map((m) => {
          const system = m.fromGuestId === 'system';
          const mine = m.fromGuestId === guestId;
          if (system) {
            return (
              <View key={m.id} style={styles.systemRow}>
                <MonoLabel size={10} color={text.whisper} style={{ textAlign: 'center' }}>
                  {m.text}
                </MonoLabel>
              </View>
            );
          }
          return (
            <View
              key={m.id}
              style={[
                styles.bubble,
                mine
                  ? { backgroundColor: accent, alignSelf: 'flex-end' }
                  : { backgroundColor: 'rgba(216,207,197,0.1)', alignSelf: 'flex-start' },
              ]}
            >
              <Body color={mine ? textOnAccent[event.accent] : text.primary} size={16}>
                {m.text}
              </Body>
            </View>
          );
        })}
        {thread.length <= 1 && (
          <Body color={text.whisper} size={14} style={{ textAlign: 'center', marginTop: space.l }}>
            Break the ice — you already know you agree on the big stuff.
          </Body>
        )}
      </ScrollView>

      {/* Composer */}
      <Row
        style={{
          padding: space.l,
          paddingBottom: Math.max(insets.bottom, space.l),
          gap: space.m,
          borderTopWidth: 1,
          borderTopColor: border.default,
        }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraftText}
          placeholder="Say something true"
          placeholderTextColor={text.whisper}
          style={styles.input}
          multiline
        />
        <Pressable
          onPress={send}
          disabled={!draft.trim()}
          style={[
            styles.sendBtn,
            { backgroundColor: draft.trim() ? accent : 'rgba(216,207,197,0.1)' },
          ]}
        >
          <Body color={draft.trim() ? textOnAccent[event.accent] : text.whisper} weight="700">
            ↑
          </Body>
        </Pressable>
      </Row>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingBottom: space.m,
    borderBottomWidth: 1,
    borderBottomColor: border.default,
  },
  systemRow: { paddingVertical: space.s, paddingHorizontal: space.xl },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: border.default,
    borderRadius: radius.input,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: text.primary,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
