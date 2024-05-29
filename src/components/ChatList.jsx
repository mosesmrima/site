import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, auth } from '../../firebaseConfig';
import { getOtherUser } from "../features/user/userSlice";
import { useDispatch } from "react-redux";
import { router } from "expo-router";
import { Avatar, Card, XStack } from "tamagui";
import defaultAvatar from "../../assets/defaultAvatar.png";

const ChatList = () => {
    const [chats, setChats] = useState([]);

    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            const authInstance = await auth;
            const currentUser = authInstance.currentUser;
            const q = query(collection(db, 'users', currentUser.uid, 'chats'));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const chats = [];
                querySnapshot.forEach((doc) => {
                    chats.push({ id: doc.id, ...doc.data() });
                });
                setChats(chats);
            });

            return () => unsubscribe();
        };

        fetchData();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => {
            dispatch(getOtherUser);
            router.push(`/chat/${item.chatId}`);
        }}>
            <Card margin={4} maxWidth={250} padding={4}>
                <XStack alignItems={"center"} gap={4}>
                    <Avatar circular size="$2">
                        <Avatar.Image
                            source={item.profilePic ? item.profilePic : defaultAvatar}
                        />
                    </Avatar>
                    <Text>{item.otherUserName}</Text>
                </XStack>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View>
            {chats.length === 0 ? (
                <Text>No chats</Text>
            ) : (
                <FlatList
                    data={chats}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            )}
        </View>
    );
};

export default ChatList;
