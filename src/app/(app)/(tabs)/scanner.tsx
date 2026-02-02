import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import QRScanner from 'src/ui/QRScanner.tsx';

export default function ScannerScreen() {
  const router = useRouter();

  const handleVideoFound = useCallback(
    (videoId: string) => {
      router.replace(`/(app)/(tabs)/video/${videoId}` as Href);
    },
    [router],
  );

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return <QRScanner onClose={handleClose} onVideoFound={handleVideoFound} />;
}
