import { Stack } from 'expo-router/stack';
import '../../tamagui-web.css';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from "../../tamagui.config";
import { useFonts, Inter_100Thin, Inter_200ExtraLight, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding immediately
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [fontsLoaded] = useFonts({
        Inter_100Thin,
        Inter_200ExtraLight,
        Inter_300Light,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
        Inter_900Black,
    });

    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        if (fontsLoaded) {
            setAppIsReady(true);
        }
    }, [fontsLoaded]);

    useEffect(() => {
        async function hideSplashScreen() {
            if (appIsReady) {
                await SplashScreen.hideAsync();
            }
        }

        hideSplashScreen();
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <TamaguiProvider config={tamaguiConfig}>
            <Stack   style={{ fontFamily: 'Inter_400Regular'}}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </TamaguiProvider>
    );
}
