/**
 * Question bank for Matchstick.
 *
 * Every statement was written for this open-source project. Format follows the
 * classic compatibility-quiz pattern: guests rate agreement with a first-person
 * statement on a 7-point scale (1 = strongly disagree … 7 = strongly agree).
 *
 * Questions optionally carry psychometric `traits` loadings (see
 * engine/psychometrics.ts): how strongly agreement moves Big Five / MBTI axes,
 * and which Loevinger ego stage a statement is characteristic of. Provocative
 * "premium" questions (flagged) are the most trait-diagnostic.
 */

import type { TraitLoadings } from '../engine/psychometrics';

export type ThemeKey =
  | 'principles'
  | 'outlook'
  | 'introspective'
  | 'politics'
  | 'spicy'
  | 'queer'
  | 'friends'
  | 'college'
  | 'family'
  | 'coworkers'
  | 'galentines'
  | 'birthday'
  | 'gamenight'
  | 'fun'
  | 'premium';

export interface QuestionTheme {
  key: ThemeKey;
  label: string;
  emoji: string;
  premium?: boolean;
}

export interface Question {
  id: string;
  theme: ThemeKey;
  statement: string;
  premium?: boolean;
  traits?: TraitLoadings;
}

export const THEMES: QuestionTheme[] = [
  { key: 'principles', label: 'Principles', emoji: '⚖️' },
  { key: 'outlook', label: 'Outlook on Life', emoji: '💭' },
  { key: 'introspective', label: 'Introspective', emoji: '😌' },
  { key: 'politics', label: 'Political Leanings', emoji: '🗳️' },
  { key: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { key: 'queer', label: 'Queer', emoji: '🌈' },
  { key: 'friends', label: 'Friends', emoji: '🤝' },
  { key: 'college', label: 'College', emoji: '🍻' },
  { key: 'family', label: 'Family', emoji: '🧑‍🧑‍🧒‍🧒' },
  { key: 'coworkers', label: 'Coworkers', emoji: '💼' },
  { key: 'galentines', label: "Galentine's", emoji: '👯‍♀️' },
  { key: 'birthday', label: 'Birthday', emoji: '🎈' },
  { key: 'gamenight', label: 'Game Night', emoji: '🃏' },
  { key: 'fun', label: 'Fun', emoji: '🎉' },
  { key: 'premium', label: 'Premium', emoji: '✨', premium: true },
];

let n = 0;
const q = (
  theme: ThemeKey,
  statement: string,
  traits?: TraitLoadings,
  premium = false,
): Question => ({ id: `q${++n}`, theme, statement, traits, premium: premium || undefined });

// premium-question shorthand
const pq = (statement: string, traits?: TraitLoadings) => q('premium', statement, traits, true);

export const QUESTIONS: Question[] = [
  // ⚖️ Principles — conscientiousness, agreeableness, ego
  q('principles', 'I would rather be respected than liked', { A: -1, C: 1, ego: 5 }),
  q('principles', 'A promise matters more than the reason I made it', { C: 1.5, ego: 3, egoWeight: 0.8 }),
  q('principles', 'Loyalty should outweigh fairness when they collide', { A: 1, ego: 3 }),
  q('principles', 'Some rules deserve to be broken on principle', { C: -1, O: 1, ego: 6 }),
  q('principles', 'I would report a friend who did something seriously wrong', { C: 1, A: -0.5, ego: 5 }),
  q('principles', 'Money changes what people are willing to call ethical', { O: 0.5, ego: 6, egoWeight: 0.7 }),
  q('principles', 'I hold myself to a higher standard than I hold others', { C: 1, ego: 5 }),
  q('principles', 'Forgiveness has to be earned, not given', { A: -1, ego: 4 }),

  // 💭 Outlook on Life — openness, neuroticism, ego
  q('outlook', 'Most things work out for the best in the end', { N: -1, ego: 3, egoWeight: 0.6 }),
  q('outlook', 'Comfort is a warning sign that I have stopped growing', { O: 1, C: 0.5, ego: 6 }),
  q('outlook', 'Luck explains more of success than people admit', { O: 0.5, ego: 6, egoWeight: 0.7 }),
  q('outlook', 'The world is getting better, not worse', { O: 0.5, N: -0.5 }),
  q('outlook', 'A short remarkable life beats a long ordinary one', { O: 1.5, ego: 6 }),
  q('outlook', 'Routine is the secret to freedom', { C: 1.5, SN: -1 }),
  q('outlook', 'People can fundamentally change who they are', { O: 1, ego: 6 }),
  q('outlook', 'Everything happens for a reason', { O: -0.5, ego: 3, egoWeight: 0.8 }),

  // 😌 Introspective — openness, self-awareness, ego
  q('introspective', 'I need time alone to feel like myself', { E: -1.5, EI: -1 }),
  q('introspective', 'I replay conversations in my head long after they end', { N: 1.5, ego: 4 }),
  q('introspective', 'I find it easy to say exactly what I feel', { E: 1, A: -0.3, N: -0.5 }),
  q('introspective', 'I am still becoming the person I want to be', { O: 1, ego: 5 }),
  q('introspective', 'I trust my gut over my reasoning', { TF: 1, SN: 0.5, C: -0.5 }),
  q('introspective', 'My moods follow the people around me', { N: 1, A: 0.5, ego: 3 }),
  q('introspective', 'I can hold two opposite truths without needing to resolve them', { O: 1, ego: 7, egoWeight: 1.2 }),
  q('introspective', 'I would rather understand myself than be understood', { O: 1, ego: 6 }),

  // 🗳️ Political Leanings — openness, ego, agreeableness
  q('politics', 'I could happily date someone who votes differently than I do', { O: 1, A: 1, ego: 6 }),
  q('politics', 'Compromise is how politics is supposed to work', { A: 1, ego: 5 }),
  q('politics', 'Big problems need big government solutions', { O: 0.5 }),
  q('politics', 'Tradition deserves the benefit of the doubt', { O: -1, C: 0.5, ego: 3 }),
  q('politics', 'Protest is patriotic', { O: 1, ego: 5 }),
  q('politics', 'I keep my political opinions out of polite company', { E: -0.5, A: 0.5, ego: 3 }),
  q('politics', 'My views have moved meaningfully in the last five years', { O: 1, ego: 6 }),
  q('politics', 'Every perspective is worth taking seriously', { O: 1, A: 1, ego: 7, egoWeight: 1.1 }),

  // 🌶️ Spicy — extraversion, agreeableness, fidelity values
  q('spicy', 'Chemistry matters more than compatibility on paper', { TF: 1, SN: 1, O: 0.5 }),
  q('spicy', 'I flirt without always realizing it', { E: 1, A: 0.5 }),
  q('spicy', 'A little jealousy is a sign of caring', { A: -0.5, N: 0.5, ego: 3 }),
  q('spicy', 'I would kiss on a first date', { E: 1, O: 0.5, C: -0.5 }),
  q('spicy', 'Being a little hard to get works', { A: -0.5, E: -0.3 }),
  q('spicy', 'I have a type and I stick to it', { O: -0.5, C: 0.5 }),
  q('spicy', 'A great argument can be a kind of intimacy', { O: 1, E: 0.5, TF: -0.3 }),
  q('spicy', "I would rather be someone's wildest story than their safest choice", { O: 1.5, E: 1, ego: 6 }),

  // ✨ Premium — most trait-diagnostic; provocative, opinion-splitting
  pq('Flirting outside a relationship is a form of cheating', { A: 0.5, C: 0.5, ego: 3, egoWeight: 0.8 }),
  pq('There is something genuinely special about me', { N: -1, E: 0.8, A: -0.5, ego: 4 }),
  pq('Society has become too politically correct', { O: -1.2, A: -0.8, ego: 3 }),
  pq('Traditional gender roles still have real value', { O: -1.2, C: 0.5, ego: 3, egoWeight: 1.1 }),
  pq('I would shoplift if I were certain I would not be caught', { C: -1.5, A: -1, ego: 2, egoWeight: 1.2 }),
  pq('Happiness is mostly a choice', { N: -1, ego: 4 }),
  pq('A partner staying close with an ex is completely fine', { O: 1, A: 0.5, ego: 6 }),
  pq('I would accept a bribe if it were large enough', { C: -1.5, A: -1, ego: 2, egoWeight: 1.2 }),
  pq('I do whatever it takes to get ahead', { C: 0.5, A: -1.5, ego: 2 }),
  pq('I am more talented than most people give me credit for', { N: -0.5, E: 0.5, A: -0.8, ego: 4 }),
  pq('Some cultures are simply better than others', { O: -1.5, A: -0.8, ego: 3 }),
  pq('Revenge can be the right response to a real wrong', { A: -1, C: -0.5, ego: 2 }),
  pq('I would end a friendship over deeply held political differences', { O: -0.5, A: -1, ego: 4 }),
  pq('Saving for the future matters more than enjoying today', { C: 1.5, SN: -0.5, JP: -1 }),
  pq('I go out of my way to reduce my impact on the planet', { O: 1, A: 1, C: 0.5, ego: 6 }),
  pq('I take real pride in not fitting in', { O: 1, A: -0.5, ego: 6, egoWeight: 0.9 }),
  pq('Most people would lie if the stakes were high enough', { A: -1, ego: 4 }),
  pq('I am comfortable being the smartest person in the room', { E: 0.8, A: -0.8, N: -0.5, ego: 4 }),
  pq('It is okay to judge people by their worst moment', { A: -1.2, ego: 3 }),
  pq('I would rather change the world than be happy in it', { O: 1, C: 1, ego: 6, egoWeight: 0.9 }),
  pq('Honesty matters even when it hurts the people I love', { A: -0.8, C: 1, ego: 5 }),
  pq('The way someone treats waiters tells you everything', { A: 1, ego: 5 }),
  pq('I can usually see the world through my opponent’s eyes', { O: 1, A: 0.8, ego: 7, egoWeight: 1.2 }),
  pq('My sense of who I am keeps getting more fluid with age', { O: 1.2, ego: 8, egoWeight: 1.3 }),

  // 🌈 Queer
  q('queer', 'My chosen family knows me better than my given one', { ego: 5 }),
  q('queer', 'Labels help more than they limit', { C: 0.5 }),
  q('queer', 'Coming into myself made me braver in every part of life', { O: 1, ego: 6 }),
  q('queer', 'Community spaces matter more than dating apps', { E: 0.5, A: 0.5 }),
  q('queer', 'I want a love story no one has written yet', { O: 1.5, ego: 6 }),
  q('queer', 'Pride is a protest first and a party second', { O: 0.5, ego: 5 }),
  q('queer', 'I owe younger queer people my visibility', { A: 1, ego: 6 }),
  q('queer', 'Joy is the most radical thing I practice', { O: 1, ego: 7, egoWeight: 0.9 }),

  // 🤝 Friends
  q('friends', 'I would drop everything for a friend in crisis', { A: 1.5 }),
  q('friends', 'Close friendships need maintenance, not grand gestures', { C: 1, A: 0.5 }),
  q('friends', 'I make friends easily but keep few of them close', { E: 0.5 }),
  q('friends', 'Friends should call each other out, not just cheer each other on', { A: -0.3, C: 0.5, ego: 5 }),
  q('friends', 'It is okay to outgrow people', { O: 0.5, ego: 6 }),
  q('friends', 'Group chats are a love language', { E: 1 }),
  q('friends', 'I am the planner in my friend group', { C: 1, JP: -1, E: 0.5 }),
  q('friends', 'A best friend can be a higher title than a partner', { A: 0.5 }),

  // 🍻 College
  q('college', 'The people mattered more than the classes', { O: 0.3, E: 0.5 }),
  q('college', 'I peaked after college, not during it', { ego: 5 }),
  q('college', 'All-nighters were a badge of honor', { C: -0.5, N: 0.3 }),
  q('college', 'I would pick a different major if I could', {}),
  q('college', 'Campus traditions deserve to be taken seriously', { O: -0.5, C: 0.3 }),
  q('college', 'The late-night dorm talks were the realest ones', { O: 0.5, E: 0.3 }),
  q('college', 'I learned more outside the classroom than inside it', { O: 0.5 }),
  q('college', 'I still feel loyal to where I grew up', { O: -0.3 }),

  // 🧑‍🧑‍🧒‍🧒 Family
  q('family', 'Family means showing up even when it is inconvenient', { A: 1, C: 0.5 }),
  q('family', 'I want my household louder than the one I grew up in', { E: 0.5 }),
  q('family', 'Old family recipes are sacred documents', { O: -0.3, C: 0.3 }),
  q('family', 'Distance has made my family closer', {}),
  q('family', 'I am becoming my parents and I am fine with it', { O: -0.3, ego: 5 }),
  q('family', 'Holidays should be hosted, never outsourced', { C: 0.5, E: 0.5 }),
  q('family', 'Every family needs one keeper of the stories', { A: 0.5 }),
  q('family', 'Hard conversations are how families stay whole', { A: -0.2, ego: 5 }),

  // 💼 Coworkers
  q('coworkers', 'Work friendships make the job worth it', { A: 1, E: 0.5 }),
  q('coworkers', 'I keep my work self and my real self separate', { ego: 4 }),
  q('coworkers', 'Meetings reveal who people really are', { O: 0.3 }),
  q('coworkers', 'Ambition is contagious in the best way', { C: 1, E: 0.5 }),
  q('coworkers', 'I would rather work with someone kind than someone brilliant', { A: 1.2 }),
  q('coworkers', 'Office banter is a skill worth practicing', { E: 1, A: 0.3 }),
  q('coworkers', 'Feedback is a gift, even when it stings', { O: 0.8, ego: 5 }),
  q('coworkers', 'The best ideas happen outside scheduled hours', { O: 1, JP: 1 }),

  // 👯‍♀️ Galentine's
  q('galentines', 'My closest friends have saved my life more than once', { A: 1 }),
  q('galentines', 'A good hype squad beats a good therapist some weeks', { E: 0.5 }),
  q('galentines', 'Brunch is a ritual, not a meal', { E: 0.5, O: 0.3 }),
  q('galentines', 'We should compliment strangers more often', { A: 1, E: 0.5 }),
  q('galentines', 'Matching outfits are never too much', { E: 0.8, O: 0.3 }),
  q('galentines', 'Every group needs a designated photographer', { C: 0.5 }),
  q('galentines', 'Celebrating each other loudly is the whole point', { E: 1, A: 0.5 }),
  q('galentines', 'A handwritten note beats any text', { A: 0.5, C: 0.3 }),

  // 🎈 Birthday
  q('birthday', 'Birthdays should be celebrated for a whole week', { E: 1, O: 0.3 }),
  q('birthday', 'Surprise parties are a kindness, not an ambush', { E: 0.5, A: 0.5 }),
  q('birthday', 'Getting older keeps getting better', { N: -0.8, ego: 6 }),
  q('birthday', 'The cake matters more than the presents', { A: 0.3 }),
  q('birthday', 'I remember everyone’s birthday without the app reminding me', { C: 1, A: 0.5 }),
  q('birthday', 'Making a wish still counts for something', { O: 0.5 }),
  q('birthday', 'A small dinner beats a big party', { E: -1, EI: -0.8 }),
  q('birthday', 'You can tell a lot by how someone celebrates others', { A: 0.8, ego: 5 }),

  // 🃏 Game Night
  q('gamenight', 'I play to win, even at party games', { A: -1, C: 0.5 }),
  q('gamenight', 'House rules beat the rulebook', { O: 1, C: -0.5, JP: 1 }),
  q('gamenight', 'A little friendly trash talk improves every game', { E: 0.8, A: -0.3 }),
  q('gamenight', 'I would rather lose with a bold move than win safe', { O: 1, ego: 5 }),
  q('gamenight', 'Team games beat solo games every time', { E: 0.8, A: 0.5 }),
  q('gamenight', 'The rules explainer is doing sacred work', { C: 0.8 }),
  q('gamenight', 'Flipping the board is never justified', { A: 0.5, C: 0.5, N: -0.3 }),
  q('gamenight', 'Bluffing well is a life skill', { E: 0.5, A: -0.5 }),

  // 🎉 Fun
  q('fun', 'I say yes first and figure it out later', { O: 1, C: -1, JP: 1, ego: 5 }),
  q('fun', 'The best nights are the unplanned ones', { O: 1, JP: 1, C: -0.5 }),
  q('fun', 'Karaoke is mandatory, not optional', { E: 1.2 }),
  q('fun', 'I would rather host than be hosted', { E: 1, C: 0.5 }),
  q('fun', 'Dancing badly counts double', { E: 1, O: 0.5, N: -0.5 }),
  q('fun', 'Every party needs one wildcard guest', { O: 1, E: 0.5 }),
  q('fun', 'Staying in can be the best night out', { E: -1, EI: -0.8 }),
  q('fun', 'I collect experiences, not things', { O: 1, ego: 5 }),
];

export const questionsForThemes = (themes: ThemeKey[]): Question[] =>
  QUESTIONS.filter((question) => themes.includes(question.theme));

export const questionById = (id: string): Question | undefined =>
  QUESTIONS.find((question) => question.id === id);

export const premiumQuestions = (): Question[] =>
  QUESTIONS.filter((question) => question.premium);

/** A shuffled "surprise me" set spanning all themes (deterministic if seeded). */
export const surpriseSet = (count = 24, rng: () => number = Math.random): Question[] => {
  const shuffled = [...QUESTIONS].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
};
