import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export function useCreatePrayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, isAnonymous, orgId }: { content: string; isAnonymous: boolean; orgId: string }) => {
      const { data, error } = await supabase
        .from('prayers')
        .insert({
          content,
          is_anonymous: isAnonymous,
          organization_id: orgId,
          // user_id is handled by RLS/Supabase Auth automatically if default?
          // Schema says user_id is NOT NULL and references profiles.
          // RLS policy 'Insert prayers in same organization' checks auth.uid() = user_id.
          // So we MUST send user_id or have a trigger/default.
          // Since I didn't set default auth.uid() in schema, I must send it.
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newPrayer) => {
      await queryClient.cancelQueries({ queryKey: ['prayers', newPrayer.orgId] });
      const previousPrayers = queryClient.getQueryData(['prayers', newPrayer.orgId]);

      queryClient.setQueryData(['prayers', newPrayer.orgId], (old: any) => {
         if (!old) return old;
         const newPages = [...old.pages];
         if (newPages.length > 0) {
             newPages[0] = [{
                id: 'temp-' + Date.now(),
                content: newPrayer.content,
                is_anonymous: newPrayer.isAnonymous,
                created_at: new Date().toISOString(),
                prayer_count: 0,
                profiles: { full_name: 'Me', avatar_url: '' } // Mock
             }, ...newPages[0]];
         }
         return { ...old, pages: newPages };
      });
      return { previousPrayers };
    },
    onError: (err, newPrayer, context) => {
        if (context?.previousPrayers) {
            queryClient.setQueryData(['prayers', newPrayer.orgId], context.previousPrayers);
        }
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['prayers', variables.orgId] });
      router.back();
    },
  });
}
