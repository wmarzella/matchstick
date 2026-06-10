/**
 * Original question bank for Matchstick.
 *
 * Every statement here was written for this open-source project.
 * Format follows the classic compatibility-quiz pattern: guests rate
 * agreement with a first-person statement on a 7-point scale
 * (1 = strongly disagree … 7 = strongly agree).
 */

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
  | 'fun';

export interface QuestionTheme {
  key: ThemeKey;
  label: string;
  emoji: string;
}

export interface Question {
  id: string;
  theme: ThemeKey;
  statement: string;
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
];

let n = 0;
const q = (theme: ThemeKey, statement: string): Question => ({
  id: `q${++n}`,
  theme,
  statement,
});

export const QUESTIONS: Question[] = [
  // ⚖️ Principles
  q('principles', 'I would rather be respected than liked'),
  q('principles', 'A promise matters more than the reason I made it'),
  q('principles', 'Loyalty should outweigh fairness when they collide'),
  q('principles', 'Some rules deserve to be broken on principle'),
  q('principles', 'I would report a friend who did something seriously wrong'),
  q('principles', 'Money changes what people are willing to call ethical'),
  q('principles', 'I hold myself to a higher standard than I hold others'),
  q('principles', 'Forgiveness has to be earned, not given'),

  // 💭 Outlook on Life
  q('outlook', 'Most things work out for the best in the end'),
  q('outlook', 'Comfort is a warning sign that I have stopped growing'),
  q('outlook', 'Luck explains more of success than people admit'),
  q('outlook', 'The world is getting better, not worse'),
  q('outlook', 'A short remarkable life beats a long ordinary one'),
  q('outlook', 'Routine is the secret to freedom'),
  q('outlook', 'People can fundamentally change who they are'),
  q('outlook', 'Everything happens for a reason'),

  // 😌 Introspective
  q('introspective', 'I need time alone to feel like myself'),
  q('introspective', 'I replay conversations in my head long after they end'),
  q('introspective', 'I find it easy to say exactly what I feel'),
  q('introspective', 'I am still becoming the person I want to be'),
  q('introspective', 'I trust my gut over my reasoning'),
  q('introspective', 'My moods follow the people around me'),
  q('introspective', 'I forgive myself as easily as I forgive others'),
  q('introspective', 'I would rather understand myself than be understood'),

  // 🗳️ Political Leanings
  q('politics', 'I could happily date someone who votes differently than I do'),
  q('politics', 'Compromise is how politics is supposed to work'),
  q('politics', 'Big problems need big government solutions'),
  q('politics', 'Tradition deserves the benefit of the doubt'),
  q('politics', 'Protest is patriotic'),
  q('politics', 'I keep my political opinions out of polite company'),
  q('politics', 'My views have moved meaningfully in the last five years'),
  q('politics', 'Local politics matters more than national politics'),

  // 🌶️ Spicy
  q('spicy', 'Chemistry matters more than compatibility on paper'),
  q('spicy', 'I flirt without always realizing it'),
  q('spicy', 'Jealousy in small doses is healthy'),
  q('spicy', 'I would kiss on a first date'),
  q('spicy', 'Being a little hard to get works'),
  q('spicy', 'I have a type and I stick to it'),
  q('spicy', 'A great argument can be a form of foreplay'),
  q('spicy', 'I would rather be someone’s wildest story than their safest choice'),

  // 🌈 Queer
  q('queer', 'My chosen family knows me better than my given one'),
  q('queer', 'Labels help more than they limit'),
  q('queer', 'Coming into myself made me braver in every part of life'),
  q('queer', 'Community spaces matter more than dating apps'),
  q('queer', 'I want a love story no one has written yet'),
  q('queer', 'Pride is a protest first and a party second'),
  q('queer', 'I owe younger queer people visibility'),
  q('queer', 'Joy is the most radical thing I practice'),

  // 🤝 Friends
  q('friends', 'I would drop everything for a friend in crisis'),
  q('friends', 'Close friendships need regular maintenance, not grand gestures'),
  q('friends', 'I make friends easily but keep few of them close'),
  q('friends', 'Friends should call each other out, not just cheer each other on'),
  q('friends', 'It is okay to outgrow people'),
  q('friends', 'Group chats are a love language'),
  q('friends', 'I am the planner in my friend group'),
  q('friends', 'A best friend is a higher title than a partner'),

  // 🍻 College
  q('college', 'The people mattered more than the classes'),
  q('college', 'I peaked after college, not during it'),
  q('college', 'All-nighters were a badge of honor'),
  q('college', 'I would do my major differently if I could'),
  q('college', 'Campus traditions deserve to be taken seriously'),
  q('college', 'The dining hall friendships were the realest ones'),
  q('college', 'I learned more outside the classroom than inside it'),
  q('college', 'I still feel loyal to my college town'),

  // 🧑‍🧑‍🧒‍🧒 Family
  q('family', 'Family means showing up even when it is inconvenient'),
  q('family', 'I want my household to be louder than the one I grew up in'),
  q('family', 'Old family recipes are sacred documents'),
  q('family', 'Distance has made my family closer'),
  q('family', 'I am becoming my parents and I am fine with it'),
  q('family', 'Holidays should be hosted, never outsourced'),
  q('family', 'Every family needs one keeper of the stories'),
  q('family', 'Hard conversations are how families stay whole'),

  // 💼 Coworkers
  q('coworkers', 'Work friendships make the job worth it'),
  q('coworkers', 'I keep my work self and real self separate'),
  q('coworkers', 'Meetings reveal who people really are'),
  q('coworkers', 'Ambition is contagious in the best way'),
  q('coworkers', 'I would rather work with someone kind than someone brilliant'),
  q('coworkers', 'Office banter is a skill worth practicing'),
  q('coworkers', 'Feedback is a gift, even when it stings'),
  q('coworkers', 'The best ideas happen outside scheduled hours'),

  // 👯‍♀️ Galentine's
  q('galentines', 'My girlfriends have saved my life more than once'),
  q('galentines', 'A good hype squad beats a good therapist some weeks'),
  q('galentines', 'Brunch is a ritual, not a meal'),
  q('galentines', 'We should compliment strangers more often'),
  q('galentines', 'Matching outfits are never too much'),
  q('galentines', 'Every group needs a designated photographer'),
  q('galentines', 'Celebrating each other loudly is the whole point'),
  q('galentines', 'A handwritten note beats any text'),

  // 🎈 Birthday
  q('birthday', 'Birthdays should be celebrated for a whole week'),
  q('birthday', 'Surprise parties are a kindness, not an ambush'),
  q('birthday', 'Getting older keeps getting better'),
  q('birthday', 'The cake matters more than the presents'),
  q('birthday', 'I remember everyone’s birthday without the app reminding me'),
  q('birthday', 'Making a wish still counts for something'),
  q('birthday', 'A small dinner beats a big party'),
  q('birthday', 'You can tell a lot about someone by how they celebrate others'),

  // 🃏 Game Night
  q('gamenight', 'I play to win, even at party games'),
  q('gamenight', 'House rules are better than the rulebook'),
  q('gamenight', 'A little friendly trash talk improves every game'),
  q('gamenight', 'I would rather lose with a bold move than win safe'),
  q('gamenight', 'Team games beat solo games every time'),
  q('gamenight', 'The rules explainer is doing sacred work'),
  q('gamenight', 'Flipping the board is never justified'),
  q('gamenight', 'Bluffing well is a life skill'),

  // 🎉 Fun
  q('fun', 'I say yes first and figure it out later'),
  q('fun', 'The best nights are the unplanned ones'),
  q('fun', 'Karaoke is mandatory, not optional'),
  q('fun', 'I would rather host than be hosted'),
  q('fun', 'Dancing badly counts double'),
  q('fun', 'Every party needs one wildcard guest'),
  q('fun', 'Staying in can be the best night out'),
  q('fun', 'I collect experiences, not things'),
];

export const questionsForThemes = (themes: ThemeKey[]): Question[] =>
  QUESTIONS.filter((question) => themes.includes(question.theme));

export const questionById = (id: string): Question | undefined =>
  QUESTIONS.find((question) => question.id === id);

/** A shuffled "surprise me" set of 24 questions spanning all themes. */
export const surpriseSet = (): Question[] => {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 24);
};
