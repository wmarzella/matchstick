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

- **Host admin dashboard** — the full match.box flow: Signups (distribute link +
  QR, submitted/remaining stats, add demo participants), Matching (name cloud +
  Calculate → ranked match cards with compatibility %), Finalize, and Reveal
  (teaser + send matches). Plus a Manage screen mirroring the whole settings
  catalog (listing, custom link, seats, collaborators, groups, age constraints,
  feedback) — all free.
- **Host wizard** — matching mode (romantic / platonic / professional),
  age-constrained matching, event details, accent color, guest cap
- **Questionnaires** — pick 1–3 themed sets, hand-pick statements in the builder,
  or toggle **premium questions** (the scrolling-chips panel). 150+ original
  agree/disagree statements, each carrying psychometric trait loadings.
- **Guest flow** — join via event link/QR, phone-first sign-in (real SMS OTP
  through Supabase, or mocked locally; WhatsApp-style alternative), a **ground
  rules card with a sign-to-agree signature pad**, then the questionnaire: a
  vertically paged stack opening with name → age pages, one Likert statement per
  page (7 numbered cells with per-question pole labels). Returning guests get a
  **"Welcome back — this event has N new questions"** intro, and the confirmation
  screen shows their running events / answers / hot-takes stats.
- **Portable profiles** — answers are saved to a profile keyed by phone. The next
  event you're invited to **pre-fills everything you've already answered** and
  only asks what's new; the profile accumulates and sharpens over time.
- **Psychometric matching** — every answer feeds a trait profile across **Big Five
  (OCEAN)**, **Myers–Briggs** (four axes + derived type) and **Loevinger's ego
  development** (9 stages). Compatibility blends value-alignment with trait fit
  and developmental closeness. See [the model](#the-matching-model).
- **Radar chart** — the reveal overlays both people across seven trait axes so you
  can *see* how close you are, with a compatibility breakdown and MBTI/ego badges.
- **The reveal** — the host schedules it ("Send matches") and every device counts
  down to the same moment with an odometer-style timer, then: cream flip
  name-card, "why you matched" prose, conversation starters with Shuffle, radar +
  trait-by-trait breakdown, full-room results, and **receipts** (superlatives
  from the answers).
- **Reveal options** — host toggles for *full last names vs last initial* and
  *share phone numbers vs keep them private* (private is the default; matches
  talk through the in-app thread instead).
- **In-app match messaging** — a per-pair thread with a system opener (the
  notification badge on "Send a message"), so numbers never have to leave the
  app. For real SMS relay (masked numbers), wire Twilio Proxy — see notes below.
- **Groups & rounds** — partition the room into up to 3 match groups (matching
  stays within each), and strike additional rounds that never repeat a previous
  pairing.
- **Multi-device** — optional Supabase backend with realtime signups, messages,
  and a synchronized reveal across phones. Runs fully on-device without it.
- **Demo event** — 11 seeded guests so you can run a full reveal immediately.

**Non-goals** (deliberately not cloned): public event listings / ticket sales,
transactional email, and carrier-grade SMS relay — the last needs a Twilio
Proxy-style service; the schema and message thread are already shaped for it.

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

## The matching model

match.box's algorithm is proprietary, so this is an original, transparent model
grounded in three published frameworks
([src/engine/psychometrics.ts](src/engine/psychometrics.ts)):

- **Big Five (OCEAN)** — each question carries signed loadings on Openness,
  Conscientiousness, Extraversion, Agreeableness, Neuroticism. A guest's 1–7
  answers aggregate into a 0–1 score per trait.
- **Myers–Briggs** — four axes (E/I, S/N, T/F, J/P) scored from loadings, with
  Big-Five fallback so the four-letter type is always defined.
- **Loevinger ego development** — statements are tagged with the developmental
  stage they're characteristic of (Impulsive → … → Unitive, 1–9); a guest's
  level is the agreement-weighted mean.

**Compatibility** = `0.40·value-alignment + 0.25·Big-Five fit + 0.15·MBTI fit +
0.20·ego closeness`, where value-alignment is raw answer similarity, trait fit
mixes similarity (O/C/A) with complementarity (E), and ego closeness rewards
people within ~one stage. The **radar chart** plots seven normalized axes
(O, C, E, A, Steady, Feeling, Ego) for both people.

To retune, edit the `traits` loadings in
[src/data/questions.ts](src/data/questions.ts) and the weights in
`compatibility()`.

## Architecture

```
app/                    expo-router screens
  index.tsx             landing
  events.tsx            join an event on this device
  about.tsx             FAQ
  host/                 setup → questions (themes/premium/builder) → review
  event/[id]/           admin dashboard, manage, join, quiz, done, reveal
  profile/[id].tsx      portable profile + trait breakdown
src/
  theme.ts              design tokens (copied from match.box's CSS bundle)
  components/           ui, admin (Section/ActionCard/Stat), RadarChart, ScrollingChips
  data/questions.ts     original question bank w/ trait loadings, 15 themes
  engine/
    psychometrics.ts    Big Five + MBTI + Loevinger + compatibility + radar
    matching.ts         profiles, pairing, explanations, receipts
  store/
    index.tsx           React context: events, guests, portable profiles
    backend.ts          Backend interface + LocalBackend (AsyncStorage)
  supabase/
    client.ts           env-gated client
    backend.ts          SupabaseBackend (snapshot sync + realtime)
    schema.sql          tables + RLS + realtime
docs/matchbox-reference.css   literal CSS extracted from match.box (reference)
```

## Multi-device (Supabase)

The app runs fully on-device by default (AsyncStorage). To sync across phones with
realtime signups and a synchronized reveal:

1. Create a project at [supabase.com](https://supabase.com).
2. Run [src/supabase/schema.sql](src/supabase/schema.sql) in the SQL editor.
3. Enable **Phone** auth (Auth → Providers) with a Twilio/MessageBird key for real
   SMS OTP.
4. Copy `.env.example` → `.env` and paste your project URL + anon key.

The store picks the backend automatically: `SupabaseBackend` when the env vars are
present, `LocalBackend` otherwise. Both implement the same `Backend` interface, so
screens don't change. Answers live in the portable `answers` table keyed by
profile — that's what makes them follow a guest to every event.

## License

MIT — see [LICENSE](LICENSE). Fonts under SIL OFL 1.1 (see
`assets/fonts/OFL-*.txt`). Not affiliated with or endorsed by any commercial
matchmaking product.
