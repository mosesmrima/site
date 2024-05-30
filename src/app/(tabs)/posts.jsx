import React, { useEffect, useCallback } from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';
import { YStack, Text } from 'tamagui';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '../../features/posts/postsSlice';
import SearchComponent from '../../components/SearchComponent';
import Post from '../../components/Post';

const Tab = () => {
    const dispatch = useDispatch();
    const { allPostsLoading, allPosts, firebaseError } = useSelector(store => store.posts);

    useEffect(() => {
        dispatch(getAllPosts());

    }, [dispatch]);
    const renderItem = useCallback(({ item }) => <Post post={item} />, []);

    if (allPostsLoading) {
        return (
            <YStack flex={1} justifyContent={"center"} alignItems={"center"}>
                <ActivityIndicator size="large" />
            </YStack>
        );
    }

    if (firebaseError) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Firebase free tier exceeded, try again after 24hrs</Text>
            </View>
        );
    }

    return (
        <View
            style={{ flex: 1 }}
            alignItems={"center"}
            gap={3}
            padding={12}
            $gtSm={{
                flexDirection: "row",
                alignItems: "stretch"
            }}
        >
            <YStack padding={4} height={40} width={250}>
                <SearchComponent />
            </YStack>
            <FlatList
                data={allPosts}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ padding: 6, alignItems: 'center' }}
                ListEmptyComponent={() => (
                    <Text>No posts available</Text>
                )}
                style={{ flex: 1, width: '100%' }}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                getItemLayout={(data, index) => (
                    { length: 300, offset: 300 * index, index }
                )}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={21}
            />
        </View>
    );
};

export default Tab;
