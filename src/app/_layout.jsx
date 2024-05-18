import { Stack } from 'expo-router/stack';
import '../../tamagui-web.css';
import { TamaguiProvider} from 'tamagui';
import { tamaguiConfig } from "../../tamagui.config";
import { store } from '../store';
import { Provider, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { auth } from "../../firebaseConfig";
import { getUser } from "../features/user/userSlice";
import { router, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import constants from "../constants"



function MainApp() {
    const pathname = usePathname();
    const pathsWithoutRedirect = ['/login', '/create', '/add'];
    const dispatch = useDispatch();

    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                dispatch(getUser());
            } else {
                if (!pathsWithoutRedirect.includes(pathname)) {
                    router.replace('/login');
                }
            }
            setAppIsReady(true);
        });

        return () => unsubscribe();
    }, [pathname, dispatch]);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
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
    return (
        <Provider store={store}>
            <MainApp />
        </Provider>
    );
}
