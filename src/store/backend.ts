/**
 * Storage backend abstraction. The store keeps in-memory state and delegates
 * persistence + cross-device sync to a Backend. Two implementations:
 *   - LocalBackend   : AsyncStorage, single device (default)
 *   - SupabaseBackend : multi-device with realtime (when configured)
 *
 * Both expose the same shape: load the full Snapshot, persist it, and
 * (optionally) subscribe to remote changes. Full-snapshot sync is simple and
 * correct at party scale.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EventRecord, Guest, Message, Profile } from './types';

export interface Snapshot {
  events: EventRecord[];
  guests: Record<string, Guest[]>; // eventId -> guests
  profiles: Record<string, Profile>; // profileId -> profile
  messages: Message[]; // in-app match threads
}

export interface Backend {
  readonly kind: 'local' | 'supabase';
  load(): Promise<Snapshot | null>;
  persist(snap: Snapshot): Promise<void>;
  /** Subscribe to remote changes; returns an unsubscribe fn. Optional. */
  subscribe?(onChange: (snap: Snapshot) => void): () => void;
}

const STORAGE_KEY = 'matchstick.state.v2';

export class LocalBackend implements Backend {
  readonly kind = 'local' as const;

  async load(): Promise<Snapshot | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Snapshot) : null;
    } catch {
      return null;
    }
  }

  async persist(snap: Snapshot): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    } catch {
      /* ignore */
    }
  }
}
