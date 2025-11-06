import _AntDesign from '@expo/vector-icons/AntDesign.js';
import { type IconProps } from '@expo/vector-icons/build/createIconSet.js';
import { Tabs } from 'expo-router';
import { fbs } from 'fbtee';
import { FC } from 'react';
import colors from 'src/ui/colors.ts';

// Types in `@expo/vector-icons` do not currently work correctly in `"type": "module"` packages.
const AntDesign = _AntDesign as unknown as FC<IconProps<string>>;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: colors.screen,
        },
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <AntDesign
              color={focused ? colors.primary : colors.text}
              name="play"
              size={24}
            />
          ),
          title: String(fbs('Game', 'Game tab title')),
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <AntDesign
              color={focused ? colors.primary : colors.text}
              name="book"
              size={24}
            />
          ),
          title: String(fbs('Rules', 'Rules tab title')),
        }}
      />
    </Tabs>
  );
}
