import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View, Text, StyleSheet, LogBox } from "react-native"; 
import { ThemeProvider } from '../utils/context/themedContext';


LogBox.ignoreLogs([
  "Warning: Text strings must be rendered within a <Text> component.",
]);



const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function AppLoadingScreen() {
  return (
    <View style={appLoadingStyles.container}>
      <ActivityIndicator size="large" color="#38a69d" />
      <Text style={appLoadingStyles.text}>Carregando aplicativo...</Text>
    </View>
  );
}

const appLoadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});


function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthGroup) {
      router.replace("/(public)/welcome");
    } else if (isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/home");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return <AppLoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ThemeProvider>
          <InitialLayout />
        </ThemeProvider>
      </ClerkProvider>
    </>
  );
}