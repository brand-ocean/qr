import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: 'transparent',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="rules"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="scanner"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="video/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[cardId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
