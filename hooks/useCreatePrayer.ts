import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { GuestStorage } from '../lib/guestStorage';

export function useCreatePrayer() {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();

  return useMutation({
    mutationFn: async ({ content, isAnonymous, orgId }: { content: string; isAnonymous: boolean; orgId: string | null }) => {
      if (isGuest) {
        return GuestStorage.savePrayer(content, isAnonymous);
      }

      const { data, error } = await supabase
        .from('prayers')
        .insert({
          content,
          is_anonymous: isAnonymous,
          organization_id: orgId || null,
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
