import React from 'react';
import { Tabs } from 'expo-router';
import { FrostedTabBar } from '../../components/FrostedTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: any) => <FrostedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
