import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const { session, isLoading, isGuest } = useAuth();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasOrg, setHasOrg] = useState(false);

  useEffect(() => {
    if (session) {
      checkProfile();
    } else if (isGuest) {
      // Guest users don't need profile check
      setIsCheckingProfile(false);
    } else if (!isLoading) {
       setIsCheckingProfile(false);
    }
  }, [session, isLoading, isGuest]);

  async function checkProfile() {
    if (!session?.user) return;
    const { data } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', session.user.id)
      .single();

    if (data?.organization_id) {
      setHasOrg(true);
    }
    setIsCheckingProfile(false);
  }

  if (isLoading || isCheckingProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (isGuest) {
    return <Redirect href="/(tabs)" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!hasOrg) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
