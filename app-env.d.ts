// @ts-ignore
/// <reference types="nativewind/types.d.ts" />
/// <reference types="fbtee/ReactTypes.d.ts" />

declare module '*.svg' {
  import { FC } from 'react';
  import { SvgProps } from 'react-native-svg';

  const content: FC<SvgProps & { currentColor?: string }>;
  export default content;
}

// Fixes default-import type resolution under moduleResolution: nodenext
// for @react-native-async-storage/async-storage (CJS, no exports field)
declare module '@react-native-async-storage/async-storage' {
  interface AsyncStorageInterface {
    clear(callback?: (error: Error | null) => void): Promise<void>;
    flushGetRequests(): void;
    getAllKeys(
      callback?: (error: Error | null, keys: ReadonlyArray<string>) => void,
    ): Promise<ReadonlyArray<string>>;
    getItem(
      key: string,
      callback?: (error: Error | null, result: string | null) => void,
    ): Promise<string | null>;
    mergeItem(
      key: string,
      value: string,
      callback?: (error: Error | null) => void,
    ): Promise<void>;
    multiGet(
      keys: ReadonlyArray<string>,
      callback?: (
        errors: ReadonlyArray<Error | null>,
        result: ReadonlyArray<[string, string | null]>,
      ) => void,
    ): Promise<ReadonlyArray<[string, string | null]>>;
    multiMerge(
      keyValuePairs: ReadonlyArray<[string, string]>,
      callback?: (errors: ReadonlyArray<Error | null>) => void,
    ): Promise<void>;
    multiRemove(
      keys: ReadonlyArray<string>,
      callback?: (errors: ReadonlyArray<Error | null>) => void,
    ): Promise<void>;
    multiSet(
      keyValuePairs: ReadonlyArray<[string, string]>,
      callback?: (errors: ReadonlyArray<Error | null>) => void,
    ): Promise<void>;
    removeItem(
      key: string,
      callback?: (error: Error | null) => void,
    ): Promise<void>;
    setItem(
      key: string,
      value: string,
      callback?: (error: Error | null) => void,
    ): Promise<void>;
  }
  const AsyncStorage: AsyncStorageInterface;
  export default AsyncStorage;
}
