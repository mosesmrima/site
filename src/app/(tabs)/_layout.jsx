import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {Tabs, usePathname, router} from 'expo-router';
import {Avatar, Spinner, YStack} from "tamagui";
import constants from "../../constants";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {getUser} from "../../features/user/userSlice";
import {auth} from "../../../firebaseConfig"


export default function TabLayout() {
    const pathname = usePathname()
    const pathsWithoutRedirect = ['/login', '/create'];
    const dispatch = useDispatch();
    const {currentUser, isLoading} = useSelector(store => store.user)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                dispatch(getUser());
            } else {
                if (!pathsWithoutRedirect.includes(pathname)) {
                    router.replace('/login');
                }
            }
        });
        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <YStack width={"100vw"} height={"100vh"} justifyContent={"center"} alignItems={"center"}>
                <Spinner/>
            </YStack>
        )
    }




    return (
            <Tabs sceneContainerStyle={{backgroundColor: "white"}}   screenOptions={({ route }) => ({
                tabBarActiveTintColor: constants.colours.primary,
                tabBarStyle: {
                    display: route.name === "login" || route.name === "create" ? "none" : "flex"
                },
                tabBarShowLabel: false
            })}>
                
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                    }}
                />

                <Tabs.Screen
                    name="add"
                    options={{
                        title: 'New Post',
                        tabBarIcon: ({ color }) => <FontAwesome size={28} name="plus-square" color={color} />,
                    }}
                />

                <Tabs.Screen
                    name={"videos"}
                    options={{
                        title: 'Videos',
                        tabBarIcon: ({ color }) => (<FontAwesome size={28} name="video-camera" color={color} />),
                    }}
                />

                <Tabs.Screen
                    name="messages"
                    options={{
                        title: 'Messages',
                        tabBarIcon: ({ color }) => <MaterialIcons size={28} name="message" color={color} />,
                    }}
                />


                <Tabs.Screen
                    name={"profile"}
                    options={{
                        title: 'My Profile',
                        tabBarIcon: ({ color }) => (      <Avatar circular size="$2">
                            <Avatar.Image
                                accessibilityLabel="Nate Wienert"
                                src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80"
                            />
                            <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                        </Avatar>),
                    }}
                />

                <Tabs.Screen
                    name={"login"}
                    options={{
                        title: 'Login',
                        href: null,
                        headerShown: false,
                    }}
                />

                <Tabs.Screen
                    name={"create"}
                    options={{
                        title: 'Create Account',
                        href: null,
                        headerShown: false,
                    }}
                />
            </Tabs>
    );
}
