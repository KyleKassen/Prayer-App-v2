import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function usePrayerFeed(orgId: string | null) {
  return useInfiniteQuery({
    queryKey: ['prayers', orgId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from('prayers')
        .select('*, profiles(full_name, avatar_url)')
        .eq('organization_id', orgId)
        .range(pageParam, pageParam + 9)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage: any[], allPages: any[]) => {
      // If last page has 10 items, there might be more.
      return lastPage.length === 10 ? allPages.length * 10 : undefined;
    },
    initialPageParam: 0,
    enabled: !!orgId,
  });
}
