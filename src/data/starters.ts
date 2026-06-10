/**
 * Original conversation starters for the results screen ("Discuss these, if
 * you'd like"). Written for this project. Keyed by question theme so the
 * starters track what the pair actually aligned on; 'any' is the fallback pool.
 */
import type { ThemeKey } from './questions';

export const STARTERS: Partial<Record<ThemeKey | 'any', string[]>> = {
  principles: [
    'What’s a rule you’d never break — and one you’d break tonight?',
    'Who taught you your sense of fair?',
    'What’s a promise you’re still keeping?',
  ],
  outlook: [
    'What’s something you changed your mind about this year?',
    'If the next decade goes well, what does it look like?',
    'What’s the luckiest thing that ever happened to you?',
  ],
  introspective: [
    'When do you feel most like yourself?',
    'What’s a compliment you’ve never forgotten?',
    'What do you think people get wrong about you at first?',
  ],
  politics: [
    'What’s an opinion you hold that your friends don’t?',
    'Who’s the best disagreement partner you’ve ever had?',
    'What would you fix first if they put you in charge?',
  ],
  spicy: [
    'What’s your actual green flag?',
    'Describe your worst date in three words.',
    'What’s something you find attractive that nobody else seems to?',
  ],
  queer: [
    'Who’s in your chosen family, and how did they earn it?',
    'What’s the best community space you’ve ever found?',
    'What does pride mean to you this year?',
  ],
  friends: [
    'What’s the longest friendship you’ve kept alive, and how?',
    'What makes someone instantly easy to be friends with?',
    'What’s the best thing a friend ever did for you?',
  ],
  college: [
    'What’s the class that actually changed you?',
    'What would you tell your first-year self?',
    'Best late-night memory from those years?',
  ],
  family: [
    'What’s your favorite family tradition — kept or invented?',
    'What recipe would you save in a fire?',
    'Who’s the keeper of the stories in your family?',
  ],
  coworkers: [
    'What’s the best team you’ve ever been on, and why did it work?',
    'What’s a piece of feedback that actually changed you?',
    'Dream job at age ten versus now — what changed?',
  ],
  galentines: [
    'Who’s your hype person, and who are you a hype person for?',
    'What’s the best small celebration you’ve ever thrown?',
    'What compliment do you wish people gave more often?',
  ],
  birthday: [
    'Best birthday you’ve ever had — what made it?',
    'Cake, presents, or people: pick two.',
    'What’s your birthday wish ritual?',
  ],
  gamenight: [
    'What game brings out your competitive side?',
    'House rules: name one you swear by.',
    'What’s your tell when you’re bluffing?',
  ],
  fun: [
    'What’s the most spontaneous thing you’ve done this year?',
    'What’s your karaoke song — and your backup?',
    'Describe your perfect unplanned night.',
  ],
  premium: [
    'What’s a hot take you’ll defend to the end?',
    'What’s something everyone pretends to like?',
    'When is it okay to judge someone quickly?',
  ],
  any: [
    'What’s the best question anyone’s asked you lately?',
    'What are you secretly good at?',
    'What would you do with a free Tuesday and no obligations?',
    'What’s your most defensible irrational opinion?',
    'What’s the last thing that genuinely surprised you?',
    'Who would play you in the movie, and who would you rather?',
  ],
};

/** Pick `count` starters weighted toward the pair's aligned themes. */
export function pickStarters(
  themes: ThemeKey[],
  count = 3,
  rng: () => number = Math.random,
): string[] {
  const pool: string[] = [];
  for (const t of themes) pool.push(...(STARTERS[t] ?? []));
  pool.push(...(STARTERS.any ?? []));
  const seen = new Set<string>();
  const out: string[] = [];
  while (out.length < count && seen.size < pool.length) {
    const pick = pool[Math.floor(rng() * pool.length)];
    if (!seen.has(pick)) {
      seen.add(pick);
      out.push(pick);
    }
  }
  return out;
}
