import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import Text from 'src/ui/Text.tsx';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oeps!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-lg font-bold">Dit scherm bestaat niet.</Text>
        <Link className="mt-4 pt-4" href="/">
          <Text className="text-base text-primary">Ga naar beginscherm!</Text>
        </Link>
      </View>
    </>
  );
}
