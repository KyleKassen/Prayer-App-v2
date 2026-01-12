import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Stack, Link, router } from 'expo-router';
import { supabase } from '../../lib/supabase';

import { useAuth } from '../../context/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInAnonymously } = useAuth();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function handleGuestSignIn() {
    try {
      await signInAnonymously();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error signing in as guest');
    }
  }

  return (
    <View className="flex-1 justify-center p-8 bg-surface">
      <Stack.Screen options={{ title: 'Sign In' }} />
      <Text className="text-3xl font-bold text-slate-900 mb-8">Welcome Back</Text>

      <View className="space-y-4">
        <View>
          <Text className="text-slate-600 mb-2">Email</Text>
          <TextInput
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200"
            placeholder="you@church.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-slate-600 mb-2">Password</Text>
          <TextInput
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>

      <Pressable
        onPress={signInWithEmail}
        disabled={loading}
        className={`mt-8 bg-primary p-4 rounded-xl items-center ${loading ? 'opacity-50' : ''}`}
      >
        <Text className="text-white font-bold text-lg">Sign In</Text>
      </Pressable>

      <Pressable
        onPress={handleGuestSignIn}
        disabled={loading}
        className="mt-4 p-4 rounded-xl items-center border border-slate-200"
      >
        <Text className="text-slate-600 font-bold text-lg">Continue as Guest</Text>
      </Pressable>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-slate-500">Don't have an account? </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable>
            <Text className="text-primary font-bold">Sign Up</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
