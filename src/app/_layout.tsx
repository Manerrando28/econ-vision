import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { COLORS } from '../theme/colors';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={{
      ...DarkTheme,
      colors: { ...DarkTheme.colors, background: COLORS.background, card: COLORS.surface, text: COLORS.textPrimary, primary: COLORS.primary, border: COLORS.border },
    }}>
      <Head>
        <html lang="pt-BR" />
        <title>Eco Vision</title>
        <meta name="theme-color" content={COLORS.background} />
        <meta name="description" content="Monitoramento de alagamentos, alertas locais e orientações de segurança em São Paulo." />
      </Head>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Sobre o Eco Vision', headerTintColor: COLORS.primary }} />
      </Stack>
    </ThemeProvider>
  );
}
