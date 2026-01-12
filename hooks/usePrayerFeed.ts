import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

import { useAuth } from '../context/AuthContext';
import { GuestStorage } from '../lib/guestStorage';

export function usePrayerFeed(orgId: string | null) {
  const { isGuest } = useAuth();

  return useInfiniteQuery({
    queryKey: ['prayers', orgId, isGuest], // Add isGuest to key
    queryFn: async ({ pageParam = 0 }) => {
      if (isGuest) {
         // Guest feed: return local prayers (simulating pagination by returning all at once or slicing?
         // For simplicity, just return all since it's local and likely small).
         const prayers = await GuestStorage.getPrayers();
         // If we want to support pagination locally we could slice, but let's just return all for page 0 and empty for others
         if (pageParam > 0) return [];
         return prayers;
      }

      let query = supabase
        .from('prayers')
        .select('*, profiles(full_name, avatar_url)')
        .range(pageParam, pageParam + 9)
        .order('created_at', { ascending: false });

      if (orgId) {
        query = query.eq('organization_id', orgId);
      } else {
        // Personal prayers (no org)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            query = query.eq('user_id', user.id);
        } else {
            return []; // Should not happen if not guest
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage: any[], allPages: any[]) => {
      if (isGuest) return undefined;
      return lastPage.length === 10 ? allPages.length * 10 : undefined;
    },
    initialPageParam: 0,
    enabled: true, // Always enable, we handle guest/no-org logic inside
  });
}
