import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />          {/* Welcome screen */}
        <Stack.Screen name="login" />          {/* Login screen */}
        <Stack.Screen name="(tabs)" />         {/* Tab navigation */}
        <Stack.Screen name="waste-recognition" /> {/* Waste recognition stack */}
      </Stack>
    </>
  );
}