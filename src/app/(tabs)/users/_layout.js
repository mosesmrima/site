import React from 'react';
import { View, Text } from 'react-native';
import {Stack, Tabs} from 'expo-router';
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function ChatLayout() {
    return (
        <Stack options={{ headerShown: false }}>
            <Stack.Screen
                name="[uid]"
                options={{
                    title: 'User1',
                    headerShown: false,
                    href: null,
                }}
            />
        </Stack>
    );
}
