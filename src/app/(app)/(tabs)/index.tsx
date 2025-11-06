import { VStack } from '@nkzw/stack';
import { Stack as ExpoStack } from 'expo-router';
import { fbs } from 'fbtee';
import { useState } from 'react';
import { View } from 'react-native';
import Button from 'src/ui/Button.tsx';
import Text from 'src/ui/Text.tsx';
import YouTubePlayer from 'src/ui/YouTubePlayer.tsx';

type VideoCard = {
  readonly id: string;
  readonly name: string;
  readonly videoId: string;
  readonly startTime: number; // in seconds
  readonly endTime: number; // in seconds
  readonly emoji: string;
};

// TODO: These will come from QR code scan data later
// Each card represents a different music video that will be scanned from QR codes
// Note: Using classic music videos that allow embedding
const PLACEHOLDER_CARDS: readonly VideoCard[] = [
  {
    id: '1',
    name: 'Rick Roll',
    videoId: 'dQw4w9WgXcQ', // Never Gonna Give You Up - Rick Astley
    startTime: 43, // 0:43
    endTime: 58, // 0:58 (15 sec) - The iconic chorus
    emoji: '🎤',
  },
  {
    id: '2',
    name: 'Thriller',
    videoId: 'sOnqjkJTMaA', // Thriller - Michael Jackson
    startTime: 330, // 5:30
    endTime: 345, // 5:45 (15 sec) - Iconic zombie dance
    emoji: '🧟',
  },
  {
    id: '3',
    name: 'Take On Me',
    videoId: 'djV11Xbc914', // Take On Me - a-ha
    startTime: 60, // 1:00
    endTime: 75, // 1:15 (15 sec) - Pencil sketch animation
    emoji: '✏️',
  },
  {
    id: '4',
    name: 'Single Ladies',
    videoId: '4m1EFMoRFvY', // Single Ladies - Beyoncé
    startTime: 60, // 1:00
    endTime: 75, // 1:15 (15 sec) - Iconic dance routine
    emoji: '💃',
  },
  {
    id: '5',
    name: 'Billie Jean',
    videoId: 'Zi_XLOBDo_Y', // Billie Jean - Michael Jackson
    startTime: 140, // 2:20
    endTime: 155, // 2:35 (15 sec) - Light-up sidewalk
    emoji: '🕺',
  },
] as const;

export default function GameScreen() {
  const [selectedCard, setSelectedCard] = useState<VideoCard>(
    PLACEHOLDER_CARDS[0],
  );

  const selectRandomCard = () => {
    // Get a random card different from the current one
    const availableCards = PLACEHOLDER_CARDS.filter(
      (card) => card.id !== selectedCard.id,
    );
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    setSelectedCard(availableCards[randomIndex]);
  };

  return (
    <>
      <ExpoStack.Screen
        options={{
          title: String(fbs('Game', 'Game screen title')),
        }}
      />
      <View className="flex-1 bg-screen">
        <View className="flex-1 items-center justify-center p-6">
          <VStack gap={20} className="w-full max-w-md">
            <YouTubePlayer
              videoId={selectedCard.videoId}
              startTime={selectedCard.startTime}
              endTime={selectedCard.endTime}
              onReplay={() => {
                // TODO: Track replay analytics
              }}
            />

            <Text className="text-center text-sm text-textLight">
              <fbt desc="Video time info">
                This video clip plays from{' '}
                <fbt:param name="startTime">{selectedCard.startTime}</fbt:param>
                s to{' '}
                <fbt:param name="endTime">{selectedCard.endTime}</fbt:param>
                s
              </fbt>
            </Text>
          </VStack>
        </View>

        {/* Footer - Temporary dev button */}
        <View className="p-6 pb-8">
          <Button variant="tonal" onPress={selectRandomCard} className="w-full">
            <Text>Random Card (Dev)</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
