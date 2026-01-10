import { View, Text, Pressable } from 'react-native';
import { formatDistanceToNow } from 'date-fns';

type Prayer = {
  id: string;
  content: string;
  is_anonymous: boolean;
  prayer_count: number;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
};

export function PrayerCard({ prayer, onPray }: { prayer: Prayer; onPray: () => void }) {
  const authorName = prayer.is_anonymous ? 'Anonymous' : prayer.profiles?.full_name || 'Unknown';

  return (
    <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-slate-100">
      <View className="flex-row justify-between items-start mb-3">
        <Text className="font-bold text-slate-900">{authorName}</Text>
        <Text className="text-xs text-slate-400">
          {formatDistanceToNow(new Date(prayer.created_at), { addSuffix: true })}
        </Text>
      </View>

      <Text className="text-slate-700 text-base leading-relaxed mb-4">
        {prayer.content}
      </Text>

      <View className="flex-row justify-end">
        <Pressable
          onPress={onPray}
          className="flex-row items-center bg-slate-50 px-4 py-2 rounded-full border border-slate-200 active:bg-slate-100"
        >
          <Text className="text-indigo-600 font-medium mr-2">🙏 Pray</Text>
          <Text className="text-slate-600 font-bold">{prayer.prayer_count}</Text>
        </Pressable>
      </View>
    </View>
  );
}
