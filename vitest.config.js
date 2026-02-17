// this is needed for react jsx support
import react from '@vitejs/plugin-react';
import reactNative from 'vitest-react-native';

export default {
  plugins: [reactNative(), react()],
};
