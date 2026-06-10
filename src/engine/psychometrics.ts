/**
 * Psychometric model for Matchstick.
 *
 * match.box's internal algorithm is proprietary, so this is an original,
 * transparent model grounded in three published frameworks the user asked for:
 *
 *   1. Big Five (OCEAN)  — Openness, Conscientiousness, Extraversion,
 *                          Agreeableness, Neuroticism. Continuous 0..1.
 *   2. Myers–Briggs      — four axes (E/I, S/N, T/F, J/P). We score the axes
 *                          from question loadings; the 4-letter type is derived.
 *                          (Academically MBTI's axes track Big Five: E/I~E,
 *                          S/N~O, T/F~A, J/P~C — we keep them as their own
 *                          signals so questions can load either way.)
 *   3. Loevinger ego development — an ordinal stage of meaning-making, modelled
 *                          as a continuous level 1..9 (Cook-Greuter's extension)
 *                          and bucketed into a named stage.
 *
 * Every question carries optional `traits` loadings (see questions.ts). A guest's
 * 1..7 agreement answers are aggregated into a TraitProfile. Compatibility blends
 * value-alignment with trait similarity/complementarity. The radar chart plots
 * two profiles across seven normalized axes.
 */

export type Big5Key = 'O' | 'C' | 'E' | 'A' | 'N';
export type MbtiAxis = 'EI' | 'SN' | 'TF' | 'JP';

/**
 * Per-question loadings. Values are signed weights (-2..2): how strongly
 * "strongly agree" pushes a dimension up (positive) or down (negative).
 * `ego` is the developmental level (1..9) the statement is characteristic of;
 * strong agreement pulls the respondent's ego estimate toward `ego`.
 */
export interface TraitLoadings {
  O?: number;
  C?: number;
  E?: number;
  A?: number;
  N?: number;
  EI?: number; // + = Extraversion pole, - = Introversion
  SN?: number; // + = iNtuition pole,    - = Sensing
  TF?: number; // + = Feeling pole,      - = Thinking
  JP?: number; // + = Perceiving pole,   - = Judging
  ego?: number; // 1..9 stage this statement is diagnostic of
  egoWeight?: number; // how diagnostic (default 1)
}

export const EGO_STAGES: { min: number; label: string; blurb: string }[] = [
  { min: 1, label: 'Impulsive', blurb: 'Lives in the immediate; needs and impulses rule.' },
  { min: 2, label: 'Self-protective', blurb: 'Opportunistic, wary, rules are there to be worked around.' },
  { min: 3, label: 'Conformist', blurb: 'Belonging matters; the group defines what is right.' },
  { min: 4, label: 'Self-aware', blurb: 'Sees alternatives; first real inner life and self-doubt.' },
  { min: 5, label: 'Conscientious', blurb: 'Lives by self-chosen standards and long-term goals.' },
  { min: 6, label: 'Individualistic', blurb: 'Holds paradox; tolerant of self and others.' },
  { min: 7, label: 'Autonomous', blurb: 'Integrates conflicting needs; values self-actualization.' },
  { min: 8, label: 'Construct-aware', blurb: 'Sees the constructed nature of meaning itself.' },
  { min: 9, label: 'Unitive', blurb: 'Fluid identity; experiences self as part of a larger whole.' },
];

export const egoStage = (level: number): { label: string; blurb: string } => {
  const i = Math.max(0, Math.min(EGO_STAGES.length - 1, Math.round(level) - 1));
  return EGO_STAGES[i];
};

export interface TraitProfile {
  big5: Record<Big5Key, number>; // 0..1
  mbtiAxes: Record<MbtiAxis, number>; // -1..1
  mbtiType: string; // e.g. "ENFP"
  egoLevel: number; // 1..9
  egoStage: string;
  coverage: number; // 0..1, share of trait-bearing questions answered
}

const BIG5: Big5Key[] = ['O', 'C', 'E', 'A', 'N'];
const AXES: MbtiAxis[] = ['EI', 'SN', 'TF', 'JP'];

interface LoadedQuestion {
  id: string;
  traits?: TraitLoadings;
}

/** Convert a 1..7 answer to a centered -1..1 signal. */
const centered = (v: number) => (v - 4) / 3;

/**
 * Build a TraitProfile from a guest's answers over a set of questions.
 * answers: questionId -> 1..7.
 */
export function scoreProfile(
  questions: LoadedQuestion[],
  answers: Record<string, number>,
): TraitProfile {
  const sum: Record<string, number> = {};
  const wsum: Record<string, number> = {};
  const bump = (k: string, signal: number, weight: number) => {
    sum[k] = (sum[k] ?? 0) + signal * weight;
    wsum[k] = (wsum[k] ?? 0) + Math.abs(weight);
  };

  let egoNum = 0;
  let egoDen = 0;
  let traitQs = 0;
  let answeredTraitQs = 0;

  for (const q of questions) {
    if (!q.traits) continue;
    traitQs += 1;
    const a = answers[q.id];
    if (a == null) continue;
    answeredTraitQs += 1;
    const c = centered(a); // -1..1
    const agreement = (a - 1) / 6; // 0..1, for ego pull

    for (const k of BIG5) {
      const w = q.traits[k];
      if (w) bump(k, c * Math.sign(w), Math.abs(w));
    }
    for (const k of AXES) {
      const w = q.traits[k];
      if (w) bump(k, c * Math.sign(w), Math.abs(w));
    }
    if (q.traits.ego != null) {
      const ew = q.traits.egoWeight ?? 1;
      // Strong agreement pulls the estimate toward this stage; disagreement away.
      egoNum += q.traits.ego * agreement * ew;
      egoDen += agreement * ew;
    }
  }

  const big5 = {} as Record<Big5Key, number>;
  for (const k of BIG5) {
    // map mean signal (-1..1) to 0..1, default 0.5 when unmeasured
    const mean = wsum[k] ? sum[k] / wsum[k] : 0;
    big5[k] = clamp01(0.5 + mean / 2);
  }

  const mbtiAxes = {} as Record<MbtiAxis, number>;
  for (const k of AXES) {
    mbtiAxes[k] = wsum[k] ? clamp(sum[k] / wsum[k], -1, 1) : 0;
  }
  // Fold Big Five into the axes where a question didn't speak directly
  // (E/I<-E, S/N<-O, T/F<-A, J/P<-C), so the type is never undefined.
  mbtiAxes.EI = blendAxis(mbtiAxes.EI, big5.E);
  mbtiAxes.SN = blendAxis(mbtiAxes.SN, big5.O);
  mbtiAxes.TF = blendAxis(mbtiAxes.TF, big5.A);
  mbtiAxes.JP = blendAxis(mbtiAxes.JP, 1 - big5.C); // high C -> Judging (negative JP)

  const mbtiType =
    (mbtiAxes.EI >= 0 ? 'E' : 'I') +
    (mbtiAxes.SN >= 0 ? 'N' : 'S') +
    (mbtiAxes.TF >= 0 ? 'F' : 'T') +
    (mbtiAxes.JP >= 0 ? 'P' : 'J');

  const egoLevel = egoDen > 0 ? clamp(egoNum / egoDen, 1, 9) : 4.5;

  return {
    big5,
    mbtiAxes,
    mbtiType,
    egoLevel,
    egoStage: egoStage(egoLevel).label,
    coverage: traitQs ? answeredTraitQs / traitQs : 0,
  };
}

/** Nudge an axis (-1..1) toward a Big Five-derived value (0..1) when weakly measured. */
function blendAxis(axisVal: number, big5Val: number): number {
  const derived = (big5Val - 0.5) * 2; // -1..1
  const w = Math.abs(axisVal); // trust direct measurement more when it's strong
  return clamp(axisVal * w + derived * (1 - w), -1, 1);
}

/* ------------------------------ compatibility ------------------------------ */

export interface CompatBreakdown {
  values: number; // 0..1 raw answer alignment
  big5: number; // 0..1 trait fit
  mbti: number; // 0..1 type fit
  ego: number; // 0..1 developmental closeness
}

export interface Compatibility {
  score: number; // 0..100
  breakdown: CompatBreakdown;
  headline: string;
}

/**
 * Blend the four signals into a 0..100 compatibility score.
 * Weights are tuned so value-alignment leads (it's the most legible),
 * with trait fit and developmental closeness as strong modifiers.
 */
export function compatibility(
  a: TraitProfile,
  b: TraitProfile,
  valueAlignment: number, // 0..1 from raw-answer similarity (engine supplies)
): Compatibility {
  // Big Five: similarity on O, C, A (shared style); E may complement.
  const simO = sim(a.big5.O, b.big5.O);
  const simC = sim(a.big5.C, b.big5.C);
  const simA = sim(a.big5.A, b.big5.A);
  const simN = sim(a.big5.N, b.big5.N);
  const eFit = 0.6 * sim(a.big5.E, b.big5.E) + 0.4 * comp(a.big5.E, b.big5.E);
  const big5 = avg([simO, simC, simA, simN, eFit]);

  // MBTI: shared N/S and J/P aid communication; E/I and T/F can complement.
  const mbti = avg([
    0.5 * axisSim(a.mbtiAxes.SN, b.mbtiAxes.SN) + 0.5 * 1, // intuition/sensing alignment helps
    axisSim(a.mbtiAxes.JP, b.mbtiAxes.JP),
    0.5 * axisSim(a.mbtiAxes.TF, b.mbtiAxes.TF) + 0.5 * axisComp(a.mbtiAxes.TF, b.mbtiAxes.TF),
    0.5 * axisSim(a.mbtiAxes.EI, b.mbtiAxes.EI) + 0.5 * axisComp(a.mbtiAxes.EI, b.mbtiAxes.EI),
  ]);

  // Loevinger: people within ~1 stage understand each other best; gaps cost.
  const gap = Math.abs(a.egoLevel - b.egoLevel);
  const ego = clamp01(1 - gap / 5);

  const score =
    0.4 * valueAlignment + 0.25 * big5 + 0.15 * mbti + 0.2 * ego;

  return {
    score: Math.round(clamp01(score) * 100),
    breakdown: { values: valueAlignment, big5, mbti, ego },
    headline: headlineFor({ values: valueAlignment, big5, mbti, ego }, a, b),
  };
}

function headlineFor(b: CompatBreakdown, pa: TraitProfile, pb: TraitProfile): string {
  const best = (Object.entries(b) as [keyof CompatBreakdown, number][]).sort(
    (x, y) => y[1] - x[1],
  )[0][0];
  if (best === 'ego')
    return `You meet the world at the same altitude (${pa.egoStage.toLowerCase()}).`;
  if (best === 'values') return 'Your answers line up where it counts.';
  if (best === 'big5') return 'Same temperament, different stories to tell.';
  return `${pa.mbtiType} × ${pb.mbtiType} — your types play well together.`;
}

/* --------------------------------- radar ----------------------------------- */

export interface RadarAxis {
  key: string;
  label: string;
  a: number; // 0..1
  b: number; // 0..1
}

/** Seven normalized axes comparing two profiles, for the spider chart. */
export function radarAxes(a: TraitProfile, b: TraitProfile): RadarAxis[] {
  return [
    { key: 'O', label: 'Open', a: a.big5.O, b: b.big5.O },
    { key: 'C', label: 'Driven', a: a.big5.C, b: b.big5.C },
    { key: 'E', label: 'Outgoing', a: a.big5.E, b: b.big5.E },
    { key: 'A', label: 'Warm', a: a.big5.A, b: b.big5.A },
    { key: 'S', label: 'Steady', a: 1 - a.big5.N, b: 1 - b.big5.N },
    { key: 'F', label: 'Feeling', a: norm(a.mbtiAxes.TF), b: norm(b.mbtiAxes.TF) },
    { key: 'Ego', label: 'Ego dev.', a: (a.egoLevel - 1) / 8, b: (b.egoLevel - 1) / 8 },
  ];
}

/* --------------------------------- helpers --------------------------------- */

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const sim = (x: number, y: number) => 1 - Math.abs(x - y); // 0..1 for inputs in 0..1
const comp = (x: number, y: number) => Math.abs(x - y); // complementarity reward
const axisSim = (x: number, y: number) => 1 - Math.abs(x - y) / 2; // inputs -1..1
const axisComp = (x: number, y: number) => Math.abs(x - y) / 2;
const norm = (v: number) => (v + 1) / 2; // -1..1 -> 0..1
const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
