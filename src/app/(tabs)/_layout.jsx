import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs} from 'expo-router';
import {Avatar} from "tamagui";
import constants from "../../constants";



export default function TabLayout() {


    return (
            <Tabs sceneContainerStyle={{backgroundColor: "white"}} screenOptions={{ tabBarActiveTintColor: constants.colours.primary}}>
                
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
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
            </Tabs>
    );
}
