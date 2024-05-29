import React, { useCallback, useEffect, useState } from "react";
import { Stack } from 'expo-router/stack';
import '../../tamagui-web.css';
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig } from "../../tamagui.config";
import { store } from '../store';
import { Provider, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Font from 'expo-font';
import { auth } from "../../firebaseConfig";
import { getUser } from "../features/user/userSlice";
import { router, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import constants from "../constants";

function MainApp() {
    const pathname = usePathname();
    const pathsWithoutRedirect = ['/login', '/create', '/add'];
    const dispatch = useDispatch();

    const [appIsReady, setAppIsReady] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            const authInstance = await auth;
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
    }, [dispatch, pathname, isMounted]);

    const onLayoutRootView = useCallback(() => {
        if (appIsReady) {
            setIsMounted(true);  // Set mounted state after app is ready
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return (
            <View style={{ backgroundColor: "white", flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={constants.colours.primary} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <TamaguiProvider config={tamaguiConfig}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </TamaguiProvider>
        </GestureHandlerRootView>
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

    if (!fontsLoaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <MainApp />
            </Provider>
        </GestureHandlerRootView>
    );
}
