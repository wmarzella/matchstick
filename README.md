# Matchstick 🔥

**Free, open-source party matchmaking for iPhone (and Android, and web).**

Host an event. Guests answer a short questionnaire on their phones. An algorithm
pairs the room — romantically, platonically, or professionally — and everyone's
match is revealed together, with reasons, quality scores, and superlatives.

Matchstick is an unaffiliated open-source homage to the event-matchmaking
category (think: compatibility quizzes at parties). Every feature is free,
because there is nothing to sell: the whole thing is MIT-licensed and runs
without a server.

## Features

- **Host wizard** — matching mode (romantic / platonic / professional),
  age-constrained matching, event details, accent color, guest cap
- **Questionnaires** — pick 1–3 themed question sets (Principles, Outlook on
  Life, Spicy, Game Night, …) or hand-pick statements in the builder;
  140+ original agree/disagree statements included
- **Guest flow** — join via event link/QR, quick sign-in, one-statement-per-screen
  quiz with a 7-point agreement scale
- **Matching engine** — pairwise similarity scoring over answers, greedy
  max-weight pairing, trio handling for the odd guest out, orientation
  eligibility in romantic mode, gentle age-gap penalty when enabled
- **The reveal** — synchronized countdown, match card with phone number,
  "why you two" explanations, match-quality percentile
- **Receipts** — superlatives computed from answer patterns
  (Most Decisive, Resident Wildcard, …)
- **Demo event** — 11 seeded guests so you can run a full reveal immediately

## Run it

```bash
npm install
npx expo start
```

- **iPhone**: install [Expo Go](https://expo.dev/go) from the App Store, scan
  the QR code from the terminal. For a standalone install, use
  [EAS Build](https://docs.expo.dev/build/introduction/) or
  `npx expo run:ios` on a Mac with Xcode.
- **Web**: press `w` in the Expo CLI.

## Design language

Warm cream over a near-black green surface, seven vivid accent colors (each
event picks one), serif display headings, grotesk body text, letterspaced mono
labels, and an opacity ramp for text hierarchy. Tokens live in
[src/theme.ts](src/theme.ts).

Fonts are all SIL OFL and bundled in `assets/fonts/`:

| Role | Font |
|------|------|
| Display serif | Instrument Serif |
| Body | Hanken Grotesk |
| Labels / numbers | Space Mono |

## Architecture

```
app/                    expo-router screens
  index.tsx             landing
  events.tsx            join an event on this device
  about.tsx             FAQ
  host/                 setup → questions (themes or builder) → review
  event/[id]/           event page, join, quiz, done, reveal
src/
  theme.ts              design tokens
  components/ui.tsx     shared components (buttons, cards, trays, wizard footer)
  data/questions.ts     original question bank, 14 themes
  engine/matching.ts    similarity, pairing, explanations, receipts
  store/                React context + AsyncStorage persistence
```

**Single-device by design.** This build has no backend: events, guests, and
answers persist locally via AsyncStorage. The store
([src/store/index.tsx](src/store/index.tsx)) is the only stateful module — to go
multi-device, replace its internals with Supabase/Firebase/your API and wire a
real SMS provider into the join screen's (clearly mocked) verification step.

## License

MIT — see [LICENSE](LICENSE). Fonts under SIL OFL 1.1 (see
`assets/fonts/OFL-*.txt`). Not affiliated with or endorsed by any commercial
matchmaking product.
