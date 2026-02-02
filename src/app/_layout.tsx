import 'global.css';
import { VStack } from '@nkzw/stack';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import { createLocaleContext } from 'fbtee';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ViewerContext } from 'src/user/useViewerContext.tsx';
import nl_NL from '../translations/nl_NL.json' with { type: 'json' };

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(app)',
};

const LocaleContext = createLocaleContext({
  availableLanguages: new Map([['nl_NL', 'Nederlands (Dutch)']] as const),
  clientLocales: ['nl_NL'],
  loadLocale: async (locale: string) => {
    if (locale === 'nl_NL') {
      return nl_NL.nl_NL;
    }
    return {};
  },
});

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
    <LocaleContext>
      <ViewerContext>
        <GestureHandlerRootView>
          <VStack className="flex-1 basis-full">
            <Slot />
          </VStack>
        </GestureHandlerRootView>
      </ViewerContext>
    </LocaleContext>
  );
}
