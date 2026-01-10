import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Stack, Link, router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: 'https://ui-avatars.com/api/?name=' + fullName,
        },
      },
    });

    if (error) Alert.alert(error.message);
    else {
      Alert.alert('Success', 'Please check your inbox for email verification!');
      router.replace('/(auth)/sign-in');
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center p-8 bg-surface">
      <Stack.Screen options={{ title: 'Sign Up' }} />
      <Text className="text-3xl font-bold text-slate-900 mb-8">Create Account</Text>

      <View className="space-y-4">
        <View>
          <Text className="text-slate-600 mb-2">Full Name</Text>
          <TextInput
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200"
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

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
        onPress={signUpWithEmail}
        disabled={loading}
        className={`mt-8 bg-primary p-4 rounded-xl items-center ${loading ? 'opacity-50' : ''}`}
      >
        <Text className="text-white font-bold text-lg">Sign Up</Text>
      </Pressable>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-slate-500">Already have an account? </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable>
            <Text className="text-primary font-bold">Sign In</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
