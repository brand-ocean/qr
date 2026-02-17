import 'global.css';
import { VStack } from '@nkzw/stack';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(app)',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'AeonikFono-Black': require('../../assets/fonts/Aeonik_Fono/AeonikFono-Black.otf'),
    'AeonikFono-Bold': require('../../assets/fonts/Aeonik_Fono/AeonikFono-Bold.otf'),
    'AeonikFono-Light': require('../../assets/fonts/Aeonik_Fono/AeonikFono-Light.otf'),
    'AeonikFono-Medium': require('../../assets/fonts/Aeonik_Fono/AeonikFono-Medium.otf'),
    'AeonikFono-Regular': require('../../assets/fonts/Aeonik_Fono/AeonikFono-Regular.otf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <VStack className="flex-1 basis-full">
        <Slot />
      </VStack>
    </GestureHandlerRootView>
  );
}
