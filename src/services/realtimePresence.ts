/**
 * realtimePresence — Sprint 3: Realtime collaboration channel.
 * Broadcasts active analysts viewing a country and counts public analyses live.
 */
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface PresenceUser {
  user_id: string;
  display_name: string;
  online_at: string;
}

export function joinCountryChannel(
  countryId: string,
  userId: string,
  displayName: string,
  onSync: (users: PresenceUser[]) => void
): { channel: RealtimeChannel; leave: () => void } {
  const channel = supabase.channel(`country:${countryId}`, {
    config: { presence: { key: userId } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceUser>();
      const users: PresenceUser[] = Object.values(state).flat() as PresenceUser[];
      onSync(users);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userId,
          display_name: displayName,
          online_at: new Date().toISOString(),
        });
      }
    });

  return {
    channel,
    leave: () => {
      supabase.removeChannel(channel);
    },
  };
}
