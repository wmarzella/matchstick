import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '../src/store';
import { palette } from '../src/theme';

export default function RootLayout() {
  const [loaded] = useFonts({
    'InstrumentSerif-Regular': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
    'InstrumentSerif-Italic': require('../assets/fonts/InstrumentSerif-Italic.ttf'),
    'HankenGrotesk-400': require('../assets/fonts/HankenGrotesk-400.ttf'),
    'HankenGrotesk-500': require('../assets/fonts/HankenGrotesk-500.ttf'),
    'HankenGrotesk-600': require('../assets/fonts/HankenGrotesk-600.ttf'),
    'HankenGrotesk-700': require('../assets/fonts/HankenGrotesk-700.ttf'),
    'HankenGrotesk-800': require('../assets/fonts/HankenGrotesk-800.ttf'),
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
  });

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: palette.surface }} />;
  }

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.surface },
            animation: 'fade',
          }}
        />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
