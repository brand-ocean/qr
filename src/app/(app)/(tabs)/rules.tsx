import { VStack } from '@nkzw/stack';
import { Stack as ExpoStack } from 'expo-router';
import { fbs } from 'fbtee';
import { ScrollView } from 'react-native';
import Text from 'src/ui/Text.tsx';

export default function RulesScreen() {
  return (
    <>
      <ExpoStack.Screen
        options={{ title: String(fbs('Rules', 'Rules screen title')) }}
      />
      <ScrollView className="flex-1 bg-screen">
        <VStack gap={32} className="p-6">
          {/* How to Play */}
          <VStack gap={12}>
            <Text className="text-2xl font-bold text-text">
              <fbt desc="How to play heading">How to Play</fbt>
            </Text>
            <Text className="text-base leading-6 text-textLight">
              <fbt desc="How to play description">
                Scan the QR code on your physical game card to watch its unique
                video clip. Each card has a specific time segment that reveals
                part of the story!
              </fbt>
            </Text>
          </VStack>

          {/* Objective */}
          <VStack gap={12}>
            <Text className="text-2xl font-bold text-text">
              <fbt desc="Game objective heading">Objective</fbt>
            </Text>
            <Text className="text-base leading-6 text-textLight">
              <fbt desc="Game objective description">
                Collect cards and watch their video segments to piece together
                the complete narrative. Each card unlocks a different part of
                the adventure!
              </fbt>
            </Text>
          </VStack>

          {/* Video Controls */}
          <VStack gap={12}>
            <Text className="text-2xl font-bold text-text">
              <fbt desc="Video controls heading">Video Controls</fbt>
            </Text>
            <VStack gap={8}>
              <Text className="text-base leading-6 text-textLight">
                •{' '}
                <fbt desc="Rule auto play">
                  Videos play automatically when you scan a card
                </fbt>
              </Text>
              <Text className="text-base leading-6 text-textLight">
                •{' '}
                <fbt desc="Rule time limit">
                  Each video stops at its designated end time
                </fbt>
              </Text>
              <Text className="text-base leading-6 text-textLight">
                •{' '}
                <fbt desc="Rule replay">
                  Press the Replay button to watch again
                </fbt>
              </Text>
            </VStack>
          </VStack>

          {/* Tips */}
          <VStack gap={12}>
            <Text className="text-2xl font-bold text-text">
              <fbt desc="Tips heading">Tips</fbt>
            </Text>
            <VStack gap={8}>
              <Text className="text-base leading-6 text-textLight">
                •{' '}
                <fbt desc="Tip 1">
                  Pay attention to details in each video clip
                </fbt>
              </Text>
              <Text className="text-base leading-6 text-textLight">
                • <fbt desc="Tip 2">Cards can be played in any order</fbt>
              </Text>
              <Text className="text-base leading-6 text-textLight">
                •{' '}
                <fbt desc="Tip 3">
                  Watch clips multiple times to catch everything
                </fbt>
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </>
  );
}
