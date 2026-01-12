import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Prayers' }} />
      <Tabs.Screen
        name="compose"
        options={{
            title: 'New Prayer Request',
            headerStyle: { backgroundColor: '#F8FAFC' },
            headerShadowVisible: false,
        }}
      />
    </Tabs>
  );
}
