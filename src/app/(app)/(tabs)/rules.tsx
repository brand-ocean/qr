import { VStack } from '@nkzw/stack';
import { Stack as ExpoStack } from 'expo-router';
import { Switch, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSettings } from 'src/context/SettingsContext.tsx';
import Text from 'src/ui/Text.tsx';

export default function RulesScreen() {
  const { setShowContentWarning, showContentWarning } = useSettings();

  return (
    <>
      <ExpoStack.Screen options={{ title: 'Regels' }} />
      <ScrollView className="flex-1 bg-screen">
        <VStack className="p-6" gap={32}>
          {/* Hoe te spelen */}
          <VStack gap={12}>
            <Text className="text-2xl font-bold text-text">Hoe te spelen</Text>
            <Text className="text-base leading-6 text-textLight">
              Scan de QR-code op je fysieke spelkaart om de unieke videoclip te
              bekijken. Elke kaart heeft een specifiek tijdssegment dat een deel
              van het verhaal onthult!
            </Text>
          </VStack>

          {/* Doel */}
          <VStack gap={12}>
            <Text className="text-2xl font-bold text-text">Doel</Text>
            <Text className="text-base leading-6 text-textLight">
              Verzamel kaarten en bekijk hun videosegmenten om het complete
              verhaal samen te stellen. Elke kaart ontgrendelt een ander deel
              van het avontuur!
            </Text>
          </VStack>

          {/* Video bediening */}
          <VStack gap={12}>
            <Text className="text-2xl font-bold text-text">
              Video bediening
            </Text>
            <VStack gap={8}>
              <Text className="text-base leading-6 text-textLight">
                • Video&apos;s spelen automatisch af wanneer je een kaart scant
              </Text>
              <Text className="text-base leading-6 text-textLight">
                • Elke video stopt op de aangewezen eindtijd
              </Text>
              <Text className="text-base leading-6 text-textLight">
                • Druk op de knop Opnieuw afspelen om nogmaals te kijken
              </Text>
            </VStack>
          </VStack>

          {/* Tips */}
          <VStack gap={12}>
            <Text className="text-2xl font-bold text-text">Tips</Text>
            <VStack gap={8}>
              <Text className="text-base leading-6 text-textLight">
                • Let op details in elke videoclip
              </Text>
              <Text className="text-base leading-6 text-textLight">
                • Kaarten kunnen in elke volgorde gespeeld worden
              </Text>
              <Text className="text-base leading-6 text-textLight">
                • Bekijk clips meerdere keren om alles te zien
              </Text>
            </VStack>
          </VStack>
          {/* Inhoudswaarschuwing */}
          <VStack gap={12}>
            <Text className="text-2xl font-bold text-text">
              Inhoudswaarschuwing
            </Text>
            <Text className="text-base leading-6 text-textLight">
              Sommige kaarten bevatten mogelijk schokkende of beledigende
              inhoud. Zet de waarschuwing aan om een melding te krijgen voordat
              je zo&apos;n kaart bekijkt.
            </Text>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text className="text-base text-text">Toon waarschuwing</Text>
              <Switch
                onValueChange={setShowContentWarning}
                value={showContentWarning}
              />
            </View>
          </VStack>
        </VStack>
      </ScrollView>
    </>
  );
}
