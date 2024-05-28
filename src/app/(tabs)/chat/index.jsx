import React from 'react';
import { View } from 'react-native';
import ChatList from '../../../components/ChatList';
import { useRouter } from 'expo-router';

const Messages = () => {


    return (
        <View style={{ flex: 1 }}>
            <ChatList/>
        </View>
    );
};

export default Messages;
