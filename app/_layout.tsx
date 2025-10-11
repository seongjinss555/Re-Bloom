import { Stack } from "expo-router";
import React from "react";
import 'react-native-reanimated';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/authContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/Login" />
        <Stack.Screen name="auth/Register" />
        <Stack.Screen name="login/success" />
      </Stack>
      
    </AuthProvider>
    </SafeAreaProvider>
  );
}