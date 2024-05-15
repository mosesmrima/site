import {Stack} from 'expo-router/stack';
import '../../tamagui-web.css';
import { TamaguiProvider } from 'tamagui';
import {tamaguiConfig} from "../../tamagui.config";
import {
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    useFonts
} from '@expo-google-fonts/inter';
import React, {useEffect, useState} from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {store} from '../store';
import {Provider} from 'react-redux';
import {GestureHandlerRootView} from "react-native-gesture-handler";


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

    // Manage fonts loading
    useEffect(() => {
        if (fontsLoaded) {
            setAppIsReady(true);
        }
    }, [fontsLoaded]);

    // Manage splash screen
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TamaguiProvider config={tamaguiConfig}>
                <Provider store={store}>
                    <Stack style={{ fontFamily: 'Inter_400Regular'}}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </Provider>
            </TamaguiProvider>
        </GestureHandlerRootView>
    );
}
