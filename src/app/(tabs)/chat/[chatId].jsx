import React, { useEffect, useState, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { View, Text, ActivityIndicator } from 'react-native';

const ChatScreen = () => {
    const { chatId } = useLocalSearchParams();
    const { otherUser, otherUserIsLoading, currentUser } = useSelector(store => store.user);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!chatId) {
            console.error('No chatId provided');
            return;
        }

        const q = query(collection(db, 'messages', chatId, 'messages'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt;
                messages.push({ _id: doc.id, ...data, createdAt });
            });
            setMessages(messages);
        }, (error) => {
            console.error('Error fetching messages:', error);
        });

        return () => unsubscribe();
    }, [chatId]);

    const onSend = useCallback(async (messages = []) => {
        const { _id, createdAt, text, user } = messages[0];

        try {
            // Add the message to the chat
            console.log(createdAt);
            await addDoc(collection(db, 'messages', chatId, 'messages'), {
                _id,
                createdAt: Timestamp.fromDate(new Date(createdAt)),
                text,
                user,
            });
            console.log('Message added to chat', chatId);

            // Create plain JavaScript objects for users
            const currentUserData = {
                uid: currentUser.uid,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                profilePic: currentUser.profilePic,
            };

            const otherUserData = {
                uid: otherUser.uid,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                profilePic: otherUser.profilePic,
            };

            // Update current user's chat
            console.log('Updating current user chat', currentUser.uid, chatId);
            await setDoc(doc(db, 'users', currentUser.uid, 'chats', chatId), {
                lastMessage: text,
                otherUser: otherUserData,
                otherUserName: `${otherUser.firstName} ${otherUser.lastName}`,
                profilePic: otherUser.profilePic,
                chatId,
            });
            console.log('Current user chat updated', currentUser.uid, chatId);

            // Update other user's chat
            console.log('Updating other user chat', otherUser.uid, chatId);
            await setDoc(doc(db, 'users', otherUser.uid, 'chats', chatId), {
                lastMessage: text,
                otherUser: currentUserData,
                otherUserName: `${currentUser.firstName} ${currentUser.lastName}`,
                chatId,
            });
            console.log('Other user chat updated', otherUser.uid, chatId);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, [chatId, otherUser, currentUser]);

    if (otherUserIsLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!currentUser) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>User not authenticated</Text>
            </View>
        );
    }

    return (
        <GiftedChat
            messages={messages}
            onSend={(messages) => onSend(messages)}
            user={{
                _id: currentUser.uid,
                name: currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`,
            }}
        />
    );
};

export default ChatScreen;
