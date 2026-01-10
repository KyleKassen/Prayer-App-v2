import { useState } from 'react';
import { View, TextInput, Text, Pressable, Switch, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCreatePrayer } from '../../hooks/useCreatePrayer';
import { Stack } from 'expo-router';

export default function Compose() {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { organizationId } = useAuth();
  const mutation = useCreatePrayer();

  function handleSubmit() {
    if (!content.trim()) return;
    if (!organizationId) {
        Alert.alert('Error', 'No organization found.');
        return;
    }

    mutation.mutate({ content, isAnonymous, orgId: organizationId });
  }

  return (
    <View className="flex-1 bg-surface p-4">
      <Stack.Screen options={{ title: 'New Prayer', headerBackTitle: 'Cancel' }} />

      <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4">
        <TextInput
            className="text-lg text-slate-900 min-h-[150px]"
            multiline
            placeholder="Share your prayer request..."
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
        />
      </View>

      <View className="flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
        <Text className="text-slate-700 font-medium">Post Anonymously</Text>
        <Switch value={isAnonymous} onValueChange={setIsAnonymous} trackColor={{ true: '#4F46E5', false: '#cbd5e1' }} />
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={mutation.isPending || !content.trim()}
        className={`bg-primary p-4 rounded-xl items-center ${mutation.isPending ? 'opacity-50' : ''}`}
      >
        <Text className="text-white font-bold text-lg">Post Request</Text>
      </Pressable>
    </View>
  );
}
