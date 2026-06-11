import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { questionsForThemes, surpriseSet, QUESTIONS } from '../data/questions';
import { runMatching } from '../engine/matching';
import { isSupabaseConfigured, supabase } from '../supabase/client';
import { SupabaseBackend } from '../supabase/backend';
import { Backend, LocalBackend, Snapshot } from './backend';
import {
  DraftEvent,
  emptyDraft,
  EventRecord,
  Guest,
  Message,
  pairKeyOf,
  Profile,
} from './types';

const uid = () => Math.random().toString(36).slice(2, 10);

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40) || `event-${uid()}`;

const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');

interface JoinIdentity {
  firstName: string;
  lastName: string;
  phone: string;
  age?: number;
  gender?: Profile['gender'];
  interestedIn?: Profile['interestedIn'];
}

interface Store extends Snapshot {
  draft: DraftEvent;
  setDraft: (update: Partial<DraftEvent>) => void;
  resetDraft: () => void;
  createEventFromDraft: () => EventRecord;
  getEvent: (id: string) => EventRecord | undefined;
  guestsOf: (eventId: string) => Guest[];
  /** Find-or-create a profile by phone, link a guest, pre-fill known answers. */
  joinEvent: (eventId: string, identity: JoinIdentity) => Guest;
  profileByPhone: (phone: string) => Profile | undefined;
  saveAnswer: (eventId: string, guestId: string, questionId: string, value: number) => void;
  /** Set/refresh a guest's name + age from the questionnaire intro pages. */
  updateGuestIdentity: (
    eventId: string,
    guestId: string,
    identity: { firstName?: string; lastName?: string; age?: number },
  ) => void;
  completeQuiz: (eventId: string, guestId: string) => void;
  calculateMatches: (eventId: string) => void;
  /** Fire the reveal: schedules the synchronized countdown 60s out. */
  sendMatches: (eventId: string) => void;
  /** Next round: re-match excluding all previous rounds' pairings. */
  strikeNextRound: (eventId: string) => void;
  /** Reveal options + group count etc. */
  updateEventSettings: (eventId: string, update: Partial<EventRecord>) => void;
  /** Partition guests round-robin into N match groups. */
  assignGroups: (eventId: string, count: number) => void;
  messagesFor: (eventId: string, pairKey: string) => Message[];
  sendMessage: (eventId: string, pairKey: string, fromGuestId: string, text: string) => void;
  addDemoParticipants: (eventId: string, count?: number) => void;
  removeDemoParticipants: (eventId: string) => void;
  deleteEvent: (eventId: string) => void;
  hydrated: boolean;
  backendKind: 'local' | 'supabase';
}

const StoreContext = createContext<Store | null>(null);

const makeBackend = (): Backend =>
  isSupabaseConfigured() && supabase ? new SupabaseBackend(supabase) : new LocalBackend();

export function StoreProvider({ children }: { children: ReactNode }) {
  const backend = useRef<Backend>(makeBackend());
  const [state, setState] = useState<Snapshot>({
    events: [],
    guests: {},
    profiles: {},
    messages: [],
  });
  const [draft, setDraftState] = useState<DraftEvent>(emptyDraft());
  const [hydrated, setHydrated] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteEcho = useRef(false); // guard: don't re-persist a remote-sourced update

  // hydrate + subscribe
  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const loaded = await backend.current.load();
      // older persisted snapshots predate `messages`
      setState(loaded ? { ...loaded, messages: loaded.messages ?? [] } : seedDemo());
      setHydrated(true);
      if (backend.current.subscribe) {
        unsub = backend.current.subscribe((snap) => {
          remoteEcho.current = true;
          setState(snap);
        });
      }
    })();
    return () => unsub?.();
  }, []);

  // persist on change (debounced); skip echoes from realtime
  useEffect(() => {
    if (!hydrated) return;
    if (remoteEcho.current) {
      remoteEcho.current = false;
      return;
    }
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      backend.current.persist(state).catch(() => {});
    }, 300);
  }, [state, hydrated]);

  const setDraft = useCallback((update: Partial<DraftEvent>) => {
    setDraftState((d) => ({ ...d, ...update }));
  }, []);
  const resetDraft = useCallback(() => setDraftState(emptyDraft()), []);

  const createEventFromDraft = useCallback((): EventRecord => {
    const id = uid();
    const questionIds =
      draft.customQuestionIds.length >= 1
        ? draft.customQuestionIds
        : draft.themes.length
          ? questionsForThemes(draft.themes).map((q) => q.id)
          : surpriseSet().map((q) => q.id);
    const event: EventRecord = {
      id,
      slug: slugify(draft.title),
      title: draft.title || 'Untitled Event',
      hostName: draft.hostName || 'A Host',
      date: draft.date,
      mode: draft.mode,
      ageConstrained: draft.ageConstrained,
      maxGuests: draft.maxGuests,
      accent: draft.accent,
      themes: draft.themes,
      questionIds,
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, events: [event, ...s.events], guests: { ...s.guests, [id]: [] } }));
    return event;
  }, [draft]);

  const getEvent = useCallback(
    (id: string) => state.events.find((e) => e.id === id || e.slug === id),
    [state.events],
  );
  const guestsOf = useCallback((eventId: string) => state.guests[eventId] ?? [], [state.guests]);

  const profileByPhone = useCallback(
    (phone: string) => {
      const norm = normalizePhone(phone);
      return Object.values(state.profiles).find((p) => normalizePhone(p.phone) === norm);
    },
    [state.profiles],
  );

  const joinEvent = useCallback((eventId: string, identity: JoinIdentity): Guest => {
    const now = Date.now();
    const norm = normalizePhone(identity.phone);
    let createdGuest!: Guest;

    setState((s) => {
      const event = s.events.find((e) => e.id === eventId);
      const existing = Object.values(s.profiles).find((p) => normalizePhone(p.phone) === norm);

      // find-or-create the portable profile
      const profile: Profile = existing
        ? {
            ...existing,
            // refresh demographics from this join
            firstName: identity.firstName || existing.firstName,
            lastName: identity.lastName || existing.lastName,
            age: identity.age ?? existing.age,
            gender: identity.gender ?? existing.gender,
            interestedIn: identity.interestedIn ?? existing.interestedIn,
            updatedAt: now,
          }
        : {
            id: uid(),
            phone: identity.phone,
            firstName: identity.firstName,
            lastName: identity.lastName,
            age: identity.age,
            gender: identity.gender,
            interestedIn: identity.interestedIn,
            answers: {},
            eventsAttended: [],
            createdAt: now,
            updatedAt: now,
          };

      // pre-fill answers this person has already given for THIS event's questions
      const prefilled: Record<string, number> = {};
      const prefilledIds: string[] = [];
      for (const qid of event?.questionIds ?? []) {
        if (profile.answers[qid] != null) {
          prefilled[qid] = profile.answers[qid];
          prefilledIds.push(qid);
        }
      }

      const guest: Guest = {
        id: profile.id,
        profileId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        age: profile.age,
        gender: profile.gender,
        interestedIn: profile.interestedIn,
        answers: prefilled,
        prefilledIds,
        startedAt: now,
      };
      createdGuest = guest;

      const existingGuests = s.guests[eventId] ?? [];
      const withoutDupe = existingGuests.filter((g) => g.profileId !== profile.id);
      return {
        ...s,
        profiles: { ...s.profiles, [profile.id]: profile },
        guests: { ...s.guests, [eventId]: [...withoutDupe, guest] },
      };
    });

    return createdGuest;
  }, []);

  const saveAnswer = useCallback(
    (eventId: string, guestId: string, questionId: string, value: number) => {
      setState((s) => {
        const guests = (s.guests[eventId] ?? []).map((g) =>
          g.id === guestId ? { ...g, answers: { ...g.answers, [questionId]: value } } : g,
        );
        const guest = guests.find((g) => g.id === guestId);
        // write through to the portable profile
        const profiles = { ...s.profiles };
        if (guest?.profileId && profiles[guest.profileId]) {
          const p = profiles[guest.profileId];
          profiles[guest.profileId] = {
            ...p,
            answers: { ...p.answers, [questionId]: value },
            updatedAt: Date.now(),
          };
        }
        return { ...s, guests: { ...s.guests, [eventId]: guests }, profiles };
      });
    },
    [],
  );

  const completeQuiz = useCallback((eventId: string, guestId: string) => {
    setState((s) => {
      const guests = (s.guests[eventId] ?? []).map((g) =>
        g.id === guestId ? { ...g, completedAt: Date.now() } : g,
      );
      const guest = guests.find((g) => g.id === guestId);
      const profiles = { ...s.profiles };
      if (guest?.profileId && profiles[guest.profileId]) {
        const p = profiles[guest.profileId];
        profiles[guest.profileId] = {
          ...p,
          eventsAttended: p.eventsAttended.includes(eventId)
            ? p.eventsAttended
            : [...p.eventsAttended, eventId],
          updatedAt: Date.now(),
        };
      }
      return { ...s, guests: { ...s.guests, [eventId]: guests }, profiles };
    });
  }, []);

  const calculateMatches = useCallback((eventId: string) => {
    setState((s) => {
      const event = s.events.find((e) => e.id === eventId);
      if (!event) return s;
      const questions = QUESTIONS.filter((q) => event.questionIds.includes(q.id));
      const results = runMatching(event, s.guests[eventId] ?? [], questions);
      return {
        ...s,
        events: s.events.map((e) =>
          e.id === eventId
            ? { ...e, results, rounds: [...(e.rounds ?? []).slice(0, -1), results] }
            : e,
        ),
      };
    });
  }, []);

  const updateGuestIdentity = useCallback(
    (
      eventId: string,
      guestId: string,
      identity: { firstName?: string; lastName?: string; age?: number },
    ) => {
      setState((s) => {
        const guests = (s.guests[eventId] ?? []).map((g) =>
          g.id === guestId ? { ...g, ...stripUndefined(identity) } : g,
        );
        const guest = guests.find((g) => g.id === guestId);
        const profiles = { ...s.profiles };
        if (guest?.profileId && profiles[guest.profileId]) {
          profiles[guest.profileId] = {
            ...profiles[guest.profileId],
            ...stripUndefined(identity),
            updatedAt: Date.now(),
          };
        }
        return { ...s, guests: { ...s.guests, [eventId]: guests }, profiles };
      });
    },
    [],
  );

  /** Fire the reveal: lock results as a round, schedule the synced countdown,
   *  and drop the system opener message into every matched pair's thread. */
  const sendMatches = useCallback((eventId: string) => {
    setState((s) => {
      const event = s.events.find((e) => e.id === eventId);
      if (!event?.results) return s;
      const revealAt = Date.now() + 60_000;
      const rounds = [...(event.rounds ?? [])];
      if (rounds[rounds.length - 1] !== event.results) rounds.push(event.results);
      const openers: Message[] = event.results.pairs
        .map((p) => ({ pk: pairKeyOf(p.a, p.b), score: p.score }))
        .filter(({ pk }) => !s.messages.some((m) => m.eventId === eventId && m.pairKey === pk))
        .map(({ pk, score }) => ({
          id: uid(),
          eventId,
          pairKey: pk,
          fromGuestId: 'system',
          text: `You two matched at ${score}%. Say hello — the algorithm did its part.`,
          at: Date.now(),
        }));
      return {
        ...s,
        events: s.events.map((e) =>
          e.id === eventId ? { ...e, rounds, revealAt, revealedAt: revealAt } : e,
        ),
        messages: [...s.messages, ...openers],
      };
    });
  }, []);

  const strikeNextRound = useCallback((eventId: string) => {
    setState((s) => {
      const event = s.events.find((e) => e.id === eventId);
      if (!event) return s;
      const questions = QUESTIONS.filter((q) => event.questionIds.includes(q.id));
      const exclude = new Set<string>();
      for (const round of event.rounds ?? []) {
        for (const p of round.pairs) exclude.add(pairKeyOf(p.a, p.b));
      }
      const results = runMatching(event, s.guests[eventId] ?? [], questions, {
        excludePairKeys: exclude,
      });
      return {
        ...s,
        events: s.events.map((e) =>
          e.id === eventId
            ? { ...e, results, rounds: [...(e.rounds ?? []), results], revealAt: Date.now() + 60_000 }
            : e,
        ),
      };
    });
  }, []);

  const updateEventSettings = useCallback((eventId: string, update: Partial<EventRecord>) => {
    setState((s) => ({
      ...s,
      events: s.events.map((e) => (e.id === eventId ? { ...e, ...update } : e)),
    }));
  }, []);

  const assignGroups = useCallback((eventId: string, count: number) => {
    setState((s) => {
      const guests = (s.guests[eventId] ?? []).map((g, i) => ({
        ...g,
        group: count > 1 ? (i % count) + 1 : undefined,
      }));
      return {
        ...s,
        guests: { ...s.guests, [eventId]: guests },
        events: s.events.map((e) => (e.id === eventId ? { ...e, groupCount: count } : e)),
      };
    });
  }, []);

  const messagesFor = useCallback(
    (eventId: string, pairKey: string) =>
      state.messages
        .filter((m) => m.eventId === eventId && m.pairKey === pairKey)
        .sort((a, b) => a.at - b.at),
    [state.messages],
  );

  const sendMessage = useCallback(
    (eventId: string, pairKey: string, fromGuestId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setState((s) => ({
        ...s,
        messages: [
          ...s.messages,
          { id: uid(), eventId, pairKey, fromGuestId, text: trimmed, at: Date.now() },
        ],
      }));
    },
    [],
  );

  const addDemoParticipants = useCallback((eventId: string, count = 4) => {
    setState((s) => {
      const event = s.events.find((e) => e.id === eventId);
      if (!event) return s;
      const qs = QUESTIONS.filter((q) => event.questionIds.includes(q.id));
      const existing = s.guests[eventId] ?? [];
      const start = existing.filter((g) => g.isDemo).length;
      const demos = makeDemoGuests(qs.map((q) => q.id), start, count);
      return { ...s, guests: { ...s.guests, [eventId]: [...existing, ...demos] } };
    });
  }, []);

  const removeDemoParticipants = useCallback((eventId: string) => {
    setState((s) => ({
      ...s,
      guests: { ...s.guests, [eventId]: (s.guests[eventId] ?? []).filter((g) => !g.isDemo) },
    }));
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setState((s) => ({
      events: s.events.filter((e) => e.id !== eventId),
      guests: Object.fromEntries(Object.entries(s.guests).filter(([k]) => k !== eventId)),
      profiles: s.profiles,
      messages: s.messages.filter((m) => m.eventId !== eventId),
    }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      draft,
      setDraft,
      resetDraft,
      createEventFromDraft,
      getEvent,
      guestsOf,
      joinEvent,
      profileByPhone,
      saveAnswer,
      updateGuestIdentity,
      completeQuiz,
      calculateMatches,
      sendMatches,
      strikeNextRound,
      updateEventSettings,
      assignGroups,
      messagesFor,
      sendMessage,
      addDemoParticipants,
      removeDemoParticipants,
      deleteEvent,
      hydrated,
      backendKind: backend.current.kind,
    }),
    [
      state,
      draft,
      setDraft,
      resetDraft,
      createEventFromDraft,
      getEvent,
      guestsOf,
      joinEvent,
      profileByPhone,
      saveAnswer,
      updateGuestIdentity,
      completeQuiz,
      calculateMatches,
      sendMatches,
      strikeNextRound,
      updateEventSettings,
      assignGroups,
      messagesFor,
      sendMessage,
      addDemoParticipants,
      removeDemoParticipants,
      deleteEvent,
      hydrated,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}

/* --------------------------------- demo seed -------------------------------- */

const DEMO_NAMES: [string, string][] = [
  ['Ada', 'Lovelace'],
  ['Grace', 'Hopper'],
  ['Alan', 'Turing'],
  ['Margaret', 'Hamilton'],
  ['Linus', 'Torvalds'],
  ['Radia', 'Perlman'],
  ['Edsger', 'Dijkstra'],
  ['Barbara', 'Liskov'],
  ['Donald', 'Knuth'],
  ['Katherine', 'Johnson'],
  ['Vint', 'Cerf'],
];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Drop undefined values so spreads don't clobber existing fields. */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function makeDemoGuests(questionIds: string[], startIndex: number, count: number): Guest[] {
  return Array.from({ length: count }).map((_, k) => {
    const i = startIndex + k;
    const [firstName, lastName] = DEMO_NAMES[i % DEMO_NAMES.length];
    const cluster = i % 3;
    const answers: Record<string, number> = {};
    for (const qid of questionIds) {
      const seed = (hash(qid) + cluster * 7) % 7;
      const wobble = (hash(qid + firstName) % 3) - 1;
      answers[qid] = clamp(1 + ((seed + wobble + 7) % 7), 1, 7);
    }
    return {
      id: `demo-${i}-${hash(firstName + lastName) % 9999}`,
      firstName,
      lastName,
      phone: '',
      answers,
      startedAt: Date.now() - 3600_000,
      completedAt: Date.now() - 1800_000,
      isDemo: true,
    };
  });
}

function seedDemo(): Snapshot {
  const themes = ['premium', 'outlook', 'introspective'] as const;
  const qs = questionsForThemes([...themes]);
  const event: EventRecord = {
    id: 'demo',
    slug: 'demo-party',
    title: 'Demo Launch Party',
    hostName: 'Matchstick',
    date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    mode: 'platonic',
    ageConstrained: false,
    maxGuests: 50,
    accent: 'green',
    themes: [...themes],
    questionIds: qs.map((q) => q.id),
    createdAt: Date.now(),
    isDemo: true,
  };
  const guests = makeDemoGuests(qs.map((q) => q.id), 0, DEMO_NAMES.length);
  return { events: [event], guests: { demo: guests }, profiles: {}, messages: [] };
}
