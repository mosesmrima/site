import React, { useCallback, useEffect, useState } from "react";
import { Stack } from 'expo-router/stack';
import '../../tamagui-web.css';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from "../../tamagui.config";
import { store } from '../store';
import { Provider, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { auth } from "../../firebaseConfig";
import { getUser } from "../features/user/userSlice";
import { router, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import constants from "../constants";

SplashScreen.preventAutoHideAsync();

function MainApp() {
    const pathname = usePathname();
    const pathsWithoutRedirect = ['/login', '/create', '/add'];
    const dispatch = useDispatch();

    const [appIsReady, setAppIsReady] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            const authInstance = await auth; // Wait for auth to be initialized
            setAuthInitialized(true);
            const unsubscribe = authInstance.onAuthStateChanged(async user => {
                if (user) {
                    try {
                        await dispatch(getUser());
                    } catch (error) {
                        console.error('Error fetching user:', error);
                    }
                } else {
                    if (!pathsWithoutRedirect.includes(pathname) && isMounted) {
                        router.replace('/login');
                    }
                }
                setAppIsReady(true);
            });

            return () => unsubscribe();
        };

        initializeAuth();
    }, [isMounted]);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
            setIsMounted(true);  // Set mounted state after hiding the splash screen
        }
    }, [appIsReady]);

    if (!appIsReady || !authInitialized) {
        return (
            <View style={{ backgroundColor: "white", flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={constants.colours.primary} />
            </View>
        );
    }

    return (

            <TamaguiProvider config={tamaguiConfig} onLayout={onLayoutRootView}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </TamaguiProvider>

    );
}

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        const loadFontsAndPrepareApp = async () => {
            try {
                await Font.loadAsync({
                    'Inter': require('../../assets/fonts/Inter.ttf'),
                    'InterBold': require('../../assets/fonts/Inter-Bold.ttf'),
                });
            } catch (e) {
                console.warn(e);
            } finally {
                setFontsLoaded(true);
            }
        };

        loadFontsAndPrepareApp();
    }, []);

    useEffect(() => {
        const prepareSplashScreen = async () => {
            if (fontsLoaded) {
                await SplashScreen.hideAsync();
            }
        };
        prepareSplashScreen();
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
      <GestureHandlerRootView style={{ flex: 1 }} >
        <Provider store={store}>
            <MainApp />
        </Provider>
       </GestureHandlerRootView>
    );
}
