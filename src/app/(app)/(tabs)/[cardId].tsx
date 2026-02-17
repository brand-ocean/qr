import { Redirect, useLocalSearchParams } from 'expo-router';

export default function CardRedirectScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();

  if (cardId && /^kaart\d{4}$/i.test(cardId)) {
    return <Redirect href={`/(app)/(tabs)/video/${cardId.toLowerCase()}`} />;
  }

  return <Redirect href="/" />;
}
