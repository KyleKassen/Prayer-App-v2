import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Onboarding() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  async function joinOrganization() {
    setLoading(true);
    const { error } = await supabase.rpc('join_organization_by_code', {
      code,
    });

    if (error) {
        Alert.alert('Error', error.message);
    } else {
        router.replace('/(tabs)');
    }
    setLoading(false);
  }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.replace('/(auth)/sign-in');
    }

  return (
    <View className="flex-1 justify-center p-8 bg-surface">
      <Stack.Screen options={{ title: 'Join Church' }} />
      <Text className="text-3xl font-bold text-slate-900 mb-2">Welcome</Text>
      <Text className="text-slate-500 mb-8">Enter the invite code from your church community.</Text>

      <View>
        <TextInput
          className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center text-2xl tracking-widest font-mono uppercase"
          placeholder="CODE"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          maxLength={6}
        />
      </View>

      <Pressable
        onPress={joinOrganization}
        disabled={loading || code.length < 3}
        className={`mt-8 bg-primary p-4 rounded-xl items-center ${loading ? 'opacity-50' : ''}`}
      >
        <Text className="text-white font-bold text-lg">Join Community</Text>
      </Pressable>

        <Pressable onPress={handleSignOut} className="mt-8 items-center">
            <Text className="text-slate-400">Sign Out</Text>
        </Pressable>
    </View>
  );
}
