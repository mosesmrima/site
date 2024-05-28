import React from 'react';
import { View, Text } from 'react-native';
import {Stack, Tabs} from 'expo-router';
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function ChatLayout() {
    return (
        <Stack>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Chats',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                }}
            />

            <Stack.Screen
                name="[chatId]"
                options={{
                    title: '',
                    href: null
                }}
            />
        </Stack>
    );
}
