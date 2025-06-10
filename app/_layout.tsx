// ARQUIVO _layout.tsx

import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View, Text, StyleSheet, LogBox } from "react-native"; // <-- IMPORTAR LogBox AQUI
import { ThemeProvider } from '../utils/context/themedContext';


// --- ADICIONAR ESTE BLOCO PARA IGNORAR O AVISO ---
// É importante ser o mais específico possível com a mensagem para não ignorar outros avisos importantes.
LogBox.ignoreLogs([
  "Warning: Text strings must be rendered within a <Text> component.",
  // Se houver outras variações da mensagem ou de outros avisos que você queira ignorar.
  // Exemplo: "Non-serializable values were found in the navigation state"
]);

// Se você quiser ignorar TODOS os avisos (NÃO RECOMENDADO EM PRODUÇÃO):
// LogBox.ignoreAllLogs(true);
// --- FIM DO BLOCO PARA IGNORAR ---


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// ... (Restante do seu código _layout.tsx)

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