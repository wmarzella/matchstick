import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { DraftEvent, emptyDraft, EventRecord, Guest } from './types';

const STORAGE_KEY = 'matchstick.state.v1';

interface State {
  events: EventRecord[];
  guests: Record<string, Guest[]>; // eventId -> guests
}

interface Store extends State {
  draft: DraftEvent;
  setDraft: (update: Partial<DraftEvent>) => void;
  resetDraft: () => void;
  createEventFromDraft: () => EventRecord;
  getEvent: (id: string) => EventRecord | undefined;
  guestsOf: (eventId: string) => Guest[];
  joinEvent: (eventId: string, guest: Omit<Guest, 'id' | 'answers'>) => Guest;
  saveAnswer: (eventId: string, guestId: string, questionId: string, value: number) => void;
  completeQuiz: (eventId: string, guestId: string) => void;
  calculateMatches: (eventId: string) => void;
  deleteEvent: (eventId: string) => void;
  hydrated: boolean;
}

const StoreContext = createContext<Store | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40) || `event-${uid()}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ events: [], guests: {} });
  const [draft, setDraftState] = useState<DraftEvent>(emptyDraft());
  const [hydrated, setHydrated] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setState(JSON.parse(raw));
        } else {
          setState(seedDemo());
        }
      } catch {
        setState(seedDemo());
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
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

  const guestsOf = useCallback(
    (eventId: string) => state.guests[eventId] ?? [],
    [state.guests],
  );

  const joinEvent = useCallback(
    (eventId: string, guest: Omit<Guest, 'id' | 'answers'>): Guest => {
      const record: Guest = { ...guest, id: uid(), answers: {}, startedAt: Date.now() };
      setState((s) => ({
        ...s,
        guests: { ...s.guests, [eventId]: [...(s.guests[eventId] ?? []), record] },
      }));
      return record;
    },
    [],
  );

  const saveAnswer = useCallback(
    (eventId: string, guestId: string, questionId: string, value: number) => {
      setState((s) => ({
        ...s,
        guests: {
          ...s.guests,
          [eventId]: (s.guests[eventId] ?? []).map((g) =>
            g.id === guestId ? { ...g, answers: { ...g.answers, [questionId]: value } } : g,
          ),
        },
      }));
    },
    [],
  );

  const completeQuiz = useCallback((eventId: string, guestId: string) => {
    setState((s) => ({
      ...s,
      guests: {
        ...s.guests,
        [eventId]: (s.guests[eventId] ?? []).map((g) =>
          g.id === guestId ? { ...g, completedAt: Date.now() } : g,
        ),
      },
    }));
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
          e.id === eventId ? { ...e, results, revealedAt: Date.now() } : e,
        ),
      };
    });
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setState((s) => ({
      events: s.events.filter((e) => e.id !== eventId),
      guests: Object.fromEntries(Object.entries(s.guests).filter(([k]) => k !== eventId)),
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
      saveAnswer,
      completeQuiz,
      calculateMatches,
      deleteEvent,
      hydrated,
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
      saveAnswer,
      completeQuiz,
      calculateMatches,
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
  ['Ada', 'L'],
  ['Grace', 'H'],
  ['Alan', 'T'],
  ['Margaret', 'H'],
  ['Linus', 'T'],
  ['Radia', 'P'],
  ['Edsger', 'D'],
  ['Barbara', 'L'],
  ['Donald', 'K'],
  ['Katherine', 'J'],
  ['Vint', 'C'],
];

function seedDemo(): State {
  const themes = ['fun', 'outlook', 'friends'] as const;
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

  // Three loose "personality clusters" so demo matches look coherent.
  const guests: Guest[] = DEMO_NAMES.map(([firstName, lastName], i) => {
    const cluster = i % 3;
    const answers: Record<string, number> = {};
    for (const q of qs) {
      const seed = (hash(q.id) + cluster * 7) % 7;
      const wobble = (hash(q.id + firstName) % 3) - 1;
      answers[q.id] = clamp(1 + ((seed + wobble + 7) % 7), 1, 7);
    }
    return {
      id: `demo-${i}`,
      firstName,
      lastName,
      phone: `+1 555 01${String(i).padStart(2, '0')}`,
      answers,
      startedAt: Date.now() - 3600_000,
      completedAt: Date.now() - 1800_000,
      isDemo: true,
    };
  });

  return { events: [event], guests: { demo: guests } };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
