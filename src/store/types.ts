import type { ThemeKey } from '../data/questions';
import type { AccentName } from '../theme';
import type { MatchResult } from '../engine/matching';

export type MatchMode = 'platonic' | 'romantic' | 'professional';

export type Gender = 'woman' | 'man' | 'nonbinary';

/**
 * A portable person. Identity is the phone number; answers accumulate across
 * every event they attend, so a returning guest never re-answers a question.
 */
export interface Profile {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender?: Gender;
  interestedIn?: Gender[];
  answers: Record<string, number>; // questionId -> 1..7, accumulated over events
  eventsAttended: string[]; // event ids
  createdAt: number;
  updatedAt: number;
}

export interface Guest {
  id: string;
  profileId?: string; // link to the portable Profile
  firstName: string;
  lastName: string;
  phone: string;
  age?: number;
  gender?: Gender;
  interestedIn?: Gender[];
  answers: Record<string, number>; // questionId -> 1..7 (mirrors profile for this event)
  prefilledIds?: string[]; // questions answered from a saved profile (not re-asked)
  /** Match group (1-based) when the event uses multiple groups. */
  group?: number;
  startedAt?: number;
  completedAt?: number;
  isDemo?: boolean;
}

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  hostName: string;
  date: string; // ISO yyyy-mm-dd
  mode: MatchMode;
  ageConstrained: boolean;
  maxGuests: number;
  accent: AccentName;
  themes: ThemeKey[];
  questionIds: string[]; // resolved questionnaire
  createdAt: number;
  /** When the host fired Send Matches: countdown target everyone reveals at. */
  revealAt?: number;
  revealedAt?: number;
  /** Reveal options (match.box "Send matches" OPTIONS). */
  revealFullNames?: boolean; // default false → last initial only
  sharePhones?: boolean; // default false → in-app messages only
  /** Number of match groups; guests are partitioned and matched within groups. */
  groupCount?: number;
  results?: MatchResult; // latest round
  /** All rounds, oldest first (results === rounds[rounds.length-1]). */
  rounds?: MatchResult[];
  isDemo?: boolean;
}

/** In-app message between matched guests (the phone-relay alternative). */
export interface Message {
  id: string;
  eventId: string;
  pairKey: string; // sorted guest ids joined with '+'
  fromGuestId: string; // 'system' for the opener
  text: string;
  at: number;
}

export const pairKeyOf = (a: string, b: string): string => [a, b].sort().join('+');

export interface DraftEvent {
  title: string;
  hostName: string;
  date: string;
  mode: MatchMode;
  ageConstrained: boolean;
  maxGuests: number;
  accent: AccentName;
  themes: ThemeKey[];
  customQuestionIds: string[];
}

export const emptyDraft = (): DraftEvent => ({
  title: '',
  hostName: '',
  date: '',
  mode: 'platonic',
  ageConstrained: false,
  maxGuests: 50,
  accent: 'red',
  themes: [],
  customQuestionIds: [],
});
