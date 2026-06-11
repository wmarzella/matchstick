/**
 * Supabase backend — multi-device persistence + realtime.
 *
 * The store works in full snapshots; this maps a Snapshot to/from the relational
 * schema (see schema.sql). Source of truth for answers is the portable `answers`
 * table keyed by profile, so a returning guest's answers follow them to every
 * event. `events.results` holds the denormalized MatchResult for fast reads.
 *
 * Every guest is backed by a profile row (real guests by their profile; demo
 * guests by a synthetic `demo:` profile) so foreign keys always resolve and the
 * whole snapshot round-trips uniformly.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { Backend, Snapshot } from '../store/backend';
import type { EventRecord, Guest, MatchMode, Profile } from './../store/types';
import type { AccentName } from '../theme';
import type { ThemeKey } from '../data/questions';

export class SupabaseBackend implements Backend {
  readonly kind = 'supabase' as const;
  constructor(private sb: SupabaseClient) {}

  async load(): Promise<Snapshot | null> {
    const [profilesRes, answersRes, eventsRes, partsRes, messagesRes] = await Promise.all([
      this.sb.from('profiles').select('*'),
      this.sb.from('answers').select('*'),
      this.sb.from('events').select('*'),
      this.sb.from('event_participants').select('*'),
      this.sb.from('match_messages').select('*'),
    ]);
    if (profilesRes.error || eventsRes.error) return null;

    // answers grouped by profile
    const answersByProfile: Record<string, Record<string, number>> = {};
    for (const row of answersRes.data ?? []) {
      (answersByProfile[row.profile_id] ??= {})[row.question_id] = row.value;
    }

    const profiles: Record<string, Profile> = {};
    for (const r of profilesRes.data ?? []) {
      profiles[r.id] = {
        id: r.id,
        phone: r.phone,
        firstName: r.first_name ?? '',
        lastName: r.last_name ?? '',
        age: r.age ?? undefined,
        gender: r.gender ?? undefined,
        interestedIn: r.interested_in ?? undefined,
        answers: answersByProfile[r.id] ?? {},
        eventsAttended: [],
        createdAt: Date.parse(r.created_at) || Date.now(),
        updatedAt: Date.parse(r.updated_at) || Date.now(),
      };
    }

    const events: EventRecord[] = (eventsRes.data ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      hostName: r.host_name,
      date: r.date ?? '',
      mode: r.mode as MatchMode,
      ageConstrained: r.age_constrained,
      maxGuests: r.max_guests,
      accent: r.accent as AccentName,
      themes: (r.themes ?? []) as ThemeKey[],
      questionIds: r.question_ids ?? [],
      createdAt: Date.parse(r.created_at) || Date.now(),
      revealAt: r.reveal_at ? Date.parse(r.reveal_at) : undefined,
      revealedAt: r.revealed_at ? Date.parse(r.revealed_at) : undefined,
      revealFullNames: r.reveal_full_names ?? false,
      sharePhones: r.share_phones ?? false,
      groupCount: r.group_count ?? 1,
      results: r.results ?? undefined,
      rounds: r.rounds ?? undefined,
    }));

    const messages = (messagesRes.data ?? []).map((m) => ({
      id: m.id,
      eventId: m.event_id,
      pairKey: m.pair_key,
      fromGuestId: m.from_profile,
      text: m.body,
      at: Date.parse(m.created_at) || Date.now(),
    }));

    // guests per event, assembled from participants + profiles
    const guests: Record<string, Guest[]> = {};
    for (const e of events) guests[e.id] = [];
    for (const p of partsRes.data ?? []) {
      const profile = profiles[p.profile_id];
      if (!profile) continue;
      const isDemo = profile.phone.startsWith('demo:');
      const eventQ = events.find((e) => e.id === p.event_id)?.questionIds ?? [];
      const answers: Record<string, number> = {};
      for (const qid of eventQ) if (profile.answers[qid] != null) answers[qid] = profile.answers[qid];
      (guests[p.event_id] ??= []).push({
        id: profile.id,
        profileId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: isDemo ? '' : profile.phone,
        age: profile.age,
        gender: profile.gender,
        interestedIn: profile.interestedIn,
        answers,
        startedAt: Date.parse(p.started_at) || undefined,
        completedAt: p.completed_at ? Date.parse(p.completed_at) : undefined,
        isDemo: isDemo || undefined,
      });
      profile.eventsAttended.push(p.event_id);
    }

    return { events, guests, profiles, messages };
  }

  async persist(snap: Snapshot): Promise<void> {
    // 1. Ensure a profile row for every guest (synthesizing demo profiles).
    const profileRows = new Map<string, any>();
    const answerRows: any[] = [];
    const addProfile = (id: string, p: Partial<Profile>, phone: string, answers: Record<string, number>) => {
      if (profileRows.has(id)) return;
      profileRows.set(id, {
        id,
        phone,
        first_name: p.firstName ?? '',
        last_name: p.lastName ?? '',
        age: p.age ?? null,
        gender: p.gender ?? null,
        interested_in: p.interestedIn ?? [],
        updated_at: new Date(p.updatedAt ?? Date.now()).toISOString(),
      });
      for (const [qid, value] of Object.entries(answers)) {
        answerRows.push({ profile_id: id, question_id: qid, value });
      }
    };

    for (const profile of Object.values(snap.profiles)) {
      addProfile(profile.id, profile, profile.phone, profile.answers);
    }
    const participantRows: any[] = [];
    for (const [eventId, list] of Object.entries(snap.guests)) {
      for (const g of list) {
        const pid = g.profileId ?? g.id;
        addProfile(
          pid,
          g,
          g.isDemo ? `demo:${pid}` : g.phone || `demo:${pid}`,
          g.answers,
        );
        participantRows.push({
          event_id: eventId,
          profile_id: pid,
          started_at: new Date(g.startedAt ?? Date.now()).toISOString(),
          completed_at: g.completedAt ? new Date(g.completedAt).toISOString() : null,
        });
      }
    }

    const eventRows = snap.events.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      host_name: e.hostName,
      date: e.date || null,
      mode: e.mode,
      age_constrained: e.ageConstrained,
      max_guests: e.maxGuests,
      accent: e.accent,
      themes: e.themes,
      question_ids: e.questionIds,
      reveal_at: e.revealAt ? new Date(e.revealAt).toISOString() : null,
      revealed_at: e.revealedAt ? new Date(e.revealedAt).toISOString() : null,
      reveal_full_names: e.revealFullNames ?? false,
      share_phones: e.sharePhones ?? false,
      group_count: e.groupCount ?? 1,
      results: e.results ?? null,
      rounds: e.rounds ?? null,
    }));

    // Order matters for FKs: profiles → answers/events → participants.
    if (profileRows.size) await this.sb.from('profiles').upsert([...profileRows.values()]);
    await Promise.all([
      answerRows.length ? this.sb.from('answers').upsert(answerRows) : Promise.resolve(),
      eventRows.length ? this.sb.from('events').upsert(eventRows) : Promise.resolve(),
    ]);
    if (participantRows.length)
      await this.sb.from('event_participants').upsert(participantRows, {
        onConflict: 'event_id,profile_id',
      });

    const messageRows = snap.messages.map((m) => ({
      id: m.id.length === 36 ? m.id : undefined, // let pg generate uuids for local ids
      event_id: m.eventId,
      pair_key: m.pairKey,
      from_profile: m.fromGuestId,
      body: m.text,
      created_at: new Date(m.at).toISOString(),
    }));
    if (messageRows.length) await this.sb.from('match_messages').upsert(messageRows as any[]);
  }

  subscribe(onChange: (snap: Snapshot) => void): () => void {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        const snap = await this.load();
        if (snap) onChange(snap);
      }, 250);
    };
    const channel = this.sb
      .channel('matchstick')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_participants' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_messages' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers' }, refresh)
      .subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      this.sb.removeChannel(channel);
    };
  }
}
