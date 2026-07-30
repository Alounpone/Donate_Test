import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface DonationRecord {
  id?: string;
  streamer_slug: string;
  donor_name: string;
  amount_lak: number;
  message?: string;
  status: string;
  created_at?: string;
}

// Safely evaluate environment variables without throwing during Vercel static builds
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith("http") &&
  !rawUrl.includes("your-supabase-project")
);

// Fallback placeholder URL & key to prevent createClient from throwing during build time if env vars are missing
const supabaseUrl = isSupabaseConfigured ? rawUrl! : "https://placeholder-project.supabase.co";
const supabaseAnonKey = isSupabaseConfigured ? rawKey! : "placeholder-anon-key";

// Lazy-initialized safe Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
      return null;
    }
  }
  return supabaseInstance;
}

// Safe singleton client instance for direct imports
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local Fallback Event System for local testing when Supabase keys aren't provided yet
const LOCAL_STORAGE_KEY = "donate_laos_local_donations";
const BROADCAST_CHANNEL_NAME = "donate_laos_realtime";

class LocalRealtimeChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(donation: DonationRecord) => void> = [];

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === "INSERT") {
            this.listeners.forEach((fn) => fn(event.data.record));
          }
        };
      } catch {
        // BroadcastChannel fallback silently ignored if unsupported
      }
    }
  }

  subscribe(callback: (donation: DonationRecord) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  broadcast(record: DonationRecord) {
    if (this.channel) {
      try {
        this.channel.postMessage({ type: "INSERT", record });
      } catch {
        // Ignore channel post errors
      }
    }
    // Also notify local window listeners directly
    this.listeners.forEach((fn) => fn(record));
  }
}

export const localRealtime = new LocalRealtimeChannel();

/**
 * Get recent donations for a streamer (Supabase or LocalStorage fallback)
 */
export async function getDonations(streamerSlug: string): Promise<DonationRecord[]> {
  const safeSlug = (streamerSlug || "test").toLowerCase();
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("donations")
        .select("*")
        .eq("streamer_slug", safeSlug)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as DonationRecord[];
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const all: DonationRecord[] = raw ? JSON.parse(raw) : [];
    return all.filter((d) => d.streamer_slug === safeSlug);
  } catch {
    return [];
  }
}

/**
 * Insert new donation into Supabase (or LocalStorage fallback)
 */
export async function insertDonation(donation: DonationRecord): Promise<{ success: boolean; data?: DonationRecord; error?: string }> {
  const safeSlug = (donation.streamer_slug || "test").toLowerCase();
  const recordToInsert: DonationRecord = {
    ...donation,
    streamer_slug: safeSlug,
    id: donation.id || (typeof crypto !== "undefined" ? crypto.randomUUID() : `local-${Date.now()}`),
    status: donation.status || "approved",
    created_at: donation.created_at || new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("donations")
        .insert([recordToInsert])
        .select()
        .single();

      if (!error && data) {
        return { success: true, data: data as DonationRecord };
      }
      if (error) {
        console.warn("Supabase insert error, saving locally:", error.message);
      }
    } catch (err) {
      console.warn("Supabase insert exception, fallback to local:", err);
    }
  }

  // Local fallback
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const all: DonationRecord[] = raw ? JSON.parse(raw) : [];
      all.unshift(recordToInsert);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
      
      // Broadcast to all open tabs (OBS overlay, Dashboard)
      localRealtime.broadcast(recordToInsert);
      return { success: true, data: recordToInsert };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Local storage error";
      return { success: false, error: msg };
    }
  }

  return { success: true, data: recordToInsert };
}

/**
 * Subscribe to realtime NEW inserts on donations table for a specific streamer
 */
export function subscribeToDonations(
  streamerSlug: string,
  onNewDonation: (donation: DonationRecord) => void
) {
  const safeSlug = (streamerSlug || "test").toLowerCase();
  const client = getSupabaseClient();
  let supabaseChannel: ReturnType<SupabaseClient["channel"]> | null = null;

  if (client) {
    try {
      supabaseChannel = client
        .channel(`donations-streamer-${safeSlug}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "donations",
            filter: `streamer_slug=eq.${safeSlug}`,
          },
          (payload) => {
            if (payload.new) {
              onNewDonation(payload.new as DonationRecord);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Supabase realtime subscription failed:", err);
    }
  }

  // Also register local fallback subscription so instant test buttons and local tab updates work simultaneously
  const unsubscribeLocal = localRealtime.subscribe((donation) => {
    if ((donation.streamer_slug || "test").toLowerCase() === safeSlug) {
      onNewDonation(donation);
    }
  });

  return () => {
    if (supabaseChannel && client) {
      client.removeChannel(supabaseChannel);
    }
    unsubscribeLocal();
  };
}
