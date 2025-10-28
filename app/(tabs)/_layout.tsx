import { Tabs } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // ✅ hides the top header globally
        // tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
  name="index"
  options={{
    headerShown: false,
    tabBarStyle: { display: "none" }, // ✅ Hides tab bar only here
  }}
/>

      {/* 
      <Tabs.Screen
        name="explore"
        options={{
          headerShown: false,
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      /> 
      */}
    </Tabs>
  );
}
