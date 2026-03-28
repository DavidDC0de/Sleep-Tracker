import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* This hides the header for the login screen */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* This sets the title for your upload screen */}
      <Stack.Screen name="upload" options={{ title: 'Upload Document' }} />
    </Stack>
  );
}