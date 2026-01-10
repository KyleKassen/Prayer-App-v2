import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Prayers' }} />
      <Tabs.Screen name="compose" options={{ title: 'Post Prayer' }} />
    </Tabs>
  );
}
