import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { usePrayerFeed } from '../../hooks/usePrayerFeed';
import { PrayerCard } from '../../components/PrayerCard';

export default function Feed() {
  const { organizationId } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage } = usePrayerFeed(organizationId);

  const prayers = data?.pages.flat() ?? [];

  if (isLoading) {
    return (
        <View className="flex-1 justify-center items-center bg-surface">
            <ActivityIndicator size="large" color="#4F46E5" />
        </View>
    );
  }

  return (
    <View className="flex-1 bg-surface p-4">
      <FlatList
        data={prayers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <PrayerCard prayer={item} onPray={() => console.log('Pray clicked', item.id)} />
        )}
        onEndReached={() => {
            if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => (
            <View className="mt-10 items-center">
                <Text className="text-slate-500">No prayers yet. Be the first!</Text>
            </View>
        )}
      />
    </View>
  );
}
