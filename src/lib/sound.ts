import { AudioPlayer, createAudioPlayer } from 'expo-audio';

// Sound utilities for VIRALS app
let clickSound: AudioPlayer | null = null;
let successSound: AudioPlayer | null = null;

// Initialize sounds (call once on app start)
export async function initSounds() {
  try {
    clickSound = await createAudioPlayer({
      uri: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU',
    });
    clickSound.volume = 0.3;

    successSound = await createAudioPlayer({
      uri: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU',
    });
    successSound.volume = 0.3;
  } catch {
    // Silently fail - sounds are not critical
  }
}

// Play click sound
export async function playClickSound() {
  try {
    if (clickSound) {
      await clickSound.seekTo(0);
      await clickSound.play();
    }
  } catch {
    // Silently fail - sounds are not critical
  }
}

// Play success sound
export async function playSuccessSound() {
  try {
    if (successSound) {
      await successSound.seekTo(0);
      await successSound.play();
    }
  } catch {
    // Silently fail - sounds are not critical
  }
}

// Cleanup sounds
export async function cleanupSounds() {
  if (clickSound) {
    clickSound.release();
    clickSound = null;
  }
  if (successSound) {
    successSound.release();
    successSound = null;
  }
}
