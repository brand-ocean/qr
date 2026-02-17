import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <BottomSheetModalProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            contentStyle: {
              backgroundColor: 'transparent',
            },
            headerShown: false,
          }}
        />
      </Stack>
    </BottomSheetModalProvider>
  );
}
