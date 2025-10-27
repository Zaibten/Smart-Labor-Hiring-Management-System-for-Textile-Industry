import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tabs layout (main app) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* ✅ Hide headers for your separate screens */}
        <Stack.Screen name="(screens)/LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)/SignupScreen" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)/SplashScreen" options={{ headerShown: false }} />

        {/* Example modal (keep as is) */}
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
