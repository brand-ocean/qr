import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'settings_showContentWarning';

type SettingsContextType = {
  setShowContentWarning: (value: boolean) => void;
  showContentWarning: boolean;
};

const SettingsContext = createContext<SettingsContextType>({
  setShowContentWarning: () => {},
  showContentWarning: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [showContentWarning, setShowContentWarningState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value: string | null) => {
      if (value !== null) {
        setShowContentWarningState(value === 'true');
      }
    });
  }, []);

  const setShowContentWarning = (value: boolean) => {
    setShowContentWarningState(value);
    AsyncStorage.setItem(STORAGE_KEY, String(value));
  };

  return (
    <SettingsContext value={{ setShowContentWarning, showContentWarning }}>
      {children}
    </SettingsContext>
  );
}

export const useSettings = () => useContext(SettingsContext);
