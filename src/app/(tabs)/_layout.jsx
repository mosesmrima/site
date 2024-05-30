import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {Tabs} from 'expo-router';
import {Avatar, Text, View} from "tamagui";
import constants from "../../constants";
import {useSelector} from "react-redux";
import defaultAvatar from "../../../assets/defaultAvatar.png"


export default function TabLayout() {
    const { currentUser } = useSelector(store => store.user)
    const {firebaseError} = useSelector(store => store.posts)

    if (firebaseError) {
        return <View flex={1} justifyContent={"center"} alignItems={"center"}>
            <Text>Firebase free tier exceeded try again after 24hrs </Text>
        </View>
    }

    if (currentUser) {
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
                    name="chat"
                    options={{
                        title: 'Messages',
                        headerShown: false,
                        tabBarIcon: ({ color }) => <MaterialIcons size={28} name="message" color={color} />,
                    }}
                />

                <Tabs.Screen
                    name="users"
                    options={{
                        title: 'Messages',
                        headerShown: false,
                        href: null,
                    }}
                />


                <Tabs.Screen
                    name={"profile"}
                    options={{
                        title: 'My Profile',
                        tabBarIcon: () => (      <Avatar circular size="$2">
                            <Avatar.Image
                                accessibilityLabel="Nate Wienert"
                                source={currentUser.profilePic? currentUser.profilePic : defaultAvatar}
                            />
                            <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                        </Avatar>),
                    }}
                />

                <Tabs.Screen
                    name={"login"}
                    options={{
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

                <Tabs.Screen
                    name={"usersProfile"}
                    options={{
                        title: 'Users Profile',
                        href: null,
                    }}
                />
            </Tabs>
        );
    } else {
        return <View style={{flex: 1, justifyContent: "center", alignItems: "center"} }>
            <Text>Loading Please wait...</Text>
        </View>
    }
}
