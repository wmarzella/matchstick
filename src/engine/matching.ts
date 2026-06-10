/**
 * Matchstick matching engine.
 *
 * Guests answer statements on a 1–7 agreement scale. For each guest we build a
 * psychometric TraitProfile (Big Five + MBTI + Loevinger; see psychometrics.ts).
 * We then score every eligible pair by blending raw value-alignment with trait
 * compatibility, greedily pair the highest-scoring couples first (a max-weight
 * matching approximation that is plenty for party-sized groups), and attach the
 * odd guest out to their best pair as a trio.
 */

import { Question } from '../data/questions';
import {
  compatibility,
  Compatibility,
  radarAxes,
  RadarAxis,
  scoreProfile,
  TraitProfile,
} from './psychometrics';
import type { EventRecord, Guest } from '../store/types';

export interface MatchReason {
  questionId: string;
  statement: string;
  kind: 'both-agree' | 'both-disagree' | 'aligned';
}

export interface MatchPair {
  a: string; // guest ids
  b: string;
  c?: string; // optional trio member (odd guest out)
  score: number; // 0..100 compatibility
  quality: number; // 0..100 percentile vs all candidate pairs
  compat: Compatibility;
  radar: RadarAxis[];
  reasons: MatchReason[];
}

export interface Receipt {
  title: string;
  emoji: string;
  guestId: string;
  detail: string;
}

export interface MatchResult {
  pairs: MatchPair[];
  receipts: Receipt[];
  profiles: Record<string, TraitProfile>; // guestId -> profile
}

/* --------------------------------- scoring --------------------------------- */

/** Raw value alignment over the event's question set: 0..1. */
export function valueAlignment(
  questions: Question[],
  a: Record<string, number>,
  b: Record<string, number>,
): number {
  let overlap = 0;
  let total = 0;
  for (const question of questions) {
    const av = a[question.id];
    const bv = b[question.id];
    if (av == null || bv == null) continue;
    overlap += 1;
    total += 1 - Math.abs(av - bv) / 6;
  }
  if (overlap === 0) return 0;
  const base = total / overlap;
  const confidence = overlap / questions.length;
  return base * (0.7 + 0.3 * confidence);
}

/** Romantic eligibility: mutual orientation interest. Otherwise: anyone. */
export function eligible(event: EventRecord, a: Guest, b: Guest): boolean {
  if (event.mode !== 'romantic') return true;
  if (!a.gender || !b.gender || !a.interestedIn?.length || !b.interestedIn?.length) {
    return true; // missing data: do not exclude
  }
  return a.interestedIn.includes(b.gender) && b.interestedIn.includes(a.gender);
}

const agePenalty = (event: EventRecord, a: Guest, b: Guest): number => {
  if (!event.ageConstrained || a.age == null || b.age == null) return 0;
  const gap = Math.abs(a.age - b.age);
  return Math.min(0.25, Math.max(0, (gap - 4) * 0.02));
};

/* --------------------------------- pairing --------------------------------- */

export function runMatching(
  event: EventRecord,
  guests: Guest[],
  questions: Question[],
): MatchResult {
  const done = guests.filter((g) => g.completedAt != null);

  // Build every completed guest's psychometric profile once.
  const profiles: Record<string, TraitProfile> = {};
  for (const g of done) profiles[g.id] = scoreProfile(questions, g.answers);

  interface Candidate {
    a: Guest;
    b: Guest;
    score: number;
    compat: Compatibility;
  }
  const candidates: Candidate[] = [];
  for (let i = 0; i < done.length; i++) {
    for (let j = i + 1; j < done.length; j++) {
      const a = done[i];
      const b = done[j];
      if (!eligible(event, a, b)) continue;
      const va = valueAlignment(questions, a.answers, b.answers);
      const compat = compatibility(profiles[a.id], profiles[b.id], va);
      const penalty = agePenalty(event, a, b) * 100;
      candidates.push({ a, b, score: Math.max(0, compat.score - penalty), compat });
    }
  }

  candidates.sort((x, y) => y.score - x.score);
  const scores = candidates.map((c) => c.score);

  const used = new Set<string>();
  const pairs: MatchPair[] = [];
  for (const c of candidates) {
    if (used.has(c.a.id) || used.has(c.b.id)) continue;
    used.add(c.a.id);
    used.add(c.b.id);
    pairs.push({
      a: c.a.id,
      b: c.b.id,
      score: c.score,
      quality: percentile(scores, c.score),
      compat: c.compat,
      radar: radarAxes(profiles[c.a.id], profiles[c.b.id]),
      reasons: explain(questions, c.a, c.b),
    });
  }

  // Odd guest out joins their strongest pair as a trio.
  const leftover = done.filter((g) => !used.has(g.id));
  for (const solo of leftover) {
    let best: { pair: MatchPair; s: number } | null = null;
    for (const pair of pairs) {
      if (pair.c) continue;
      const s =
        valueAlignment(questions, solo.answers, byId(done, pair.a).answers) +
        valueAlignment(questions, solo.answers, byId(done, pair.b).answers);
      if (!best || s > best.s) best = { pair, s };
    }
    if (best) best.pair.c = solo.id;
  }

  return { pairs, receipts: buildReceipts(done, questions), profiles };
}

const byId = (guests: Guest[], id: string) => guests.find((g) => g.id === id)!;

const percentile = (sorted: number[], value: number): number => {
  if (sorted.length <= 1) return 100;
  const below = sorted.filter((s) => s < value).length;
  return Math.round((below / (sorted.length - 1)) * 100);
};

/* ------------------------------- explanations ------------------------------ */

function explain(questions: Question[], a: Guest, b: Guest): MatchReason[] {
  const reasons: { q: Question; gap: number; av: number; bv: number }[] = [];
  for (const question of questions) {
    const av = a.answers[question.id];
    const bv = b.answers[question.id];
    if (av == null || bv == null) continue;
    reasons.push({ q: question, gap: Math.abs(av - bv), av, bv });
  }
  reasons.sort((x, y) => x.gap - y.gap || extremity(y) - extremity(x));
  return reasons.slice(0, 3).map(({ q, av, bv }) => ({
    questionId: q.id,
    statement: q.statement,
    kind: av >= 5 && bv >= 5 ? 'both-agree' : av <= 3 && bv <= 3 ? 'both-disagree' : 'aligned',
  }));
}

const extremity = (r: { av: number; bv: number }) =>
  Math.abs(r.av - 4) + Math.abs(r.bv - 4);

/* --------------------------------- receipts -------------------------------- */

function buildReceipts(guests: Guest[], questions: Question[]): Receipt[] {
  if (guests.length === 0) return [];
  const receipts: Receipt[] = [];

  const byAvg = (
    pick: (g: Guest) => number,
    title: string,
    emoji: string,
    detail: string,
  ) => {
    const ranked = [...guests].sort((x, y) => pick(y) - pick(x));
    const top = ranked[0];
    if (top) receipts.push({ title, emoji, guestId: top.id, detail });
  };

  const avgAnswer = (g: Guest) => {
    const vals = Object.values(g.answers);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  };
  const decisiveness = (g: Guest) => {
    const vals = Object.values(g.answers);
    return vals.length ? vals.reduce((s, v) => s + Math.abs(v - 4), 0) / vals.length : 0;
  };
  const contrarian = (g: Guest) => {
    let score = 0;
    for (const question of questions) {
      const v = g.answers[question.id];
      if (v == null) continue;
      const others = guests
        .filter((o) => o.id !== g.id)
        .map((o) => o.answers[question.id])
        .filter((x): x is number => x != null);
      if (!others.length) continue;
      const mean = others.reduce((s, x) => s + x, 0) / others.length;
      score += Math.abs(v - mean);
    }
    return score;
  };
  const egoLevel = (g: Guest) => scoreProfile(questions, g.answers).egoLevel;

  byAvg(decisiveness, 'Most Decisive', '⚡️', 'Never met a middle button they liked.');
  byAvg(avgAnswer, 'Biggest Yes-Person', '🌞', 'Agreed with nearly everything. Delightful.');
  byAvg((g) => -avgAnswer(g), 'Hardest to Impress', '🧊', 'Disagreed with the room, politely.');
  byAvg(contrarian, 'Resident Wildcard', '🎲', 'Answered like nobody was watching.');
  byAvg(egoLevel, 'Old Soul', '🦉', 'Sees the most shades of grey in the room.');

  return receipts;
}

export type { TraitProfile, Compatibility, RadarAxis };
