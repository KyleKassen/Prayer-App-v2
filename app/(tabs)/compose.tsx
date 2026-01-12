import { useState } from 'react';
import { View, TextInput, Text, Pressable, Switch, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCreatePrayer } from '../../hooks/useCreatePrayer';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Compose() {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { organizationId, isGuest } = useAuth();
  const mutation = useCreatePrayer();

  function handleSubmit() {
    if (!content.trim()) return;

    // Org ID is optional now -> if null, it's a personal prayer
    mutation.mutate(
      { content, isAnonymous, orgId: organizationId || null },
      {
        onSuccess: () => {
            // Optional: Success feedback could go here if not handled by hook
        },
        onError: (error) => {
             Alert.alert('Error', 'Failed to post prayer request. Please try again.');
             console.error(error);
        }
      }
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['bottom']}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView className="flex-1 px-4 pt-2">
            <View className="mb-6">
                <Text className="text-slate-500 mb-2 font-medium ml-1">
                    {isGuest ? "Share your request securely" : (organizationId ? "For your organization" : "Personal Prayer Request")}
                </Text>

                <View
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 2
                    }}
                    className="bg-white p-4 rounded-3xl border border-slate-100 min-h-[200px]"
                >
                    <TextInput
                        className="text-lg text-slate-800 leading-7"
                        multiline
                        placeholder="What would you like prayer for today?"
                        placeholderTextColor="#94a3b8"
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                        autoFocus
                        style={{ minHeight: 180 }}
                    />
                </View>
            </View>

            <View
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2
                }}
                className="bg-white rounded-2xl border border-slate-100 mb-6 overflow-hidden"
            >
                <Pressable
                    onPress={() => setIsAnonymous(!isAnonymous)}
                    style={({ pressed }) => ({
                        backgroundColor: pressed ? '#f8fafc' : 'transparent'
                    })}
                    className="flex-row justify-between items-center p-4"
                >
                    <View className="flex-1 pr-4">
                        <Text className="text-slate-800 font-semibold text-base mb-1">Post Anonymously</Text>
                        <Text className="text-slate-500 text-sm">
                            Your name will be hidden from others
                        </Text>
                    </View>
                    <Switch
                        value={isAnonymous}
                        onValueChange={setIsAnonymous}
                        trackColor={{ true: '#6366f1', false: '#e2e8f0' }}
                        thumbColor={'white'}
                        ios_backgroundColor="#e2e8f0"
                    />
                </Pressable>
            </View>

        </ScrollView>

        <View
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2
            }}
            className="p-4 bg-white border-t border-slate-100"
        >
            <Pressable
                onPress={handleSubmit}
                disabled={mutation.isPending || !content.trim()}
                style={({ pressed }) => ({
                    opacity: mutation.isPending ? 0.7 : (pressed ? 0.9 : 1),
                    shadowColor: '#4338ca',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: !content.trim() ? 0 : 0.2,
                    shadowRadius: 10,
                    elevation: !content.trim() ? 0 : 10
                })}
                className={`w-full py-4 rounded-2xl items-center flex-row justify-center ${
                    !content.trim() ? 'bg-slate-200' : 'bg-indigo-600'
                }`}
            >
                <Text className={`font-bold text-lg ${!content.trim() ? 'text-slate-400' : 'text-white'}`}>
                    {mutation.isPending ? 'Posting...' : 'Post Request'}
                </Text>
            </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
